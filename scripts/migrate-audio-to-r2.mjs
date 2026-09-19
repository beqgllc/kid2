import { createClient } from '@supabase/supabase-js';
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';

const {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET = 'attikid-audio',
} = process.env;

if (
  !SUPABASE_URL ||
  !SUPABASE_SERVICE_ROLE_KEY ||
  !R2_ACCOUNT_ID ||
  !R2_ACCESS_KEY_ID ||
  !R2_SECRET_ACCESS_KEY
) {
  throw new Error(
    [
      'Missing required environment variables.',
      '',
      `SUPABASE_URL: ${Boolean(SUPABASE_URL)}`,
      `SUPABASE_SERVICE_ROLE_KEY: ${Boolean(SUPABASE_SERVICE_ROLE_KEY)}`,
      `R2_ACCOUNT_ID: ${Boolean(R2_ACCOUNT_ID)}`,
      `R2_ACCESS_KEY_ID: ${Boolean(R2_ACCESS_KEY_ID)}`,
      `R2_SECRET_ACCESS_KEY: ${Boolean(R2_SECRET_ACCESS_KEY)}`,
      `R2_BUCKET: ${R2_BUCKET}`,
    ].join('\n')
  );
}

/*
 * IMPORTANT:
 * This script runs locally.
 *
 * The Supabase service-role key and R2 secret key must NEVER
 * be exposed to the browser or committed to GitHub.
 */

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

const AUDIO_BUCKET = 'attikid-audio';

console.log('Loading songs from Supabase...');

const { data: songs, error } = await supabase
  .from('songs')
  .select(
    'id,audio_path,audio_mime_type,file_size,title'
  )
  .not('audio_path', 'is', null)
  .order('created_at', { ascending: true });

if (error) {
  throw new Error(
    `Failed to query songs: ${error.message}`
  );
}

if (!songs?.length) {
  console.log('No songs found.');
  process.exit(0);
}

console.log(`Found ${songs.length} songs.`);

let uploaded = 0;
let skipped = 0;
let failed = 0;

for (let i = 0; i < songs.length; i++) {
  const song = songs[i];

  console.log('');
  console.log(
    `[${i + 1}/${songs.length}] ${song.title}`
  );
  console.log(`  Path: ${song.audio_path}`);

  if (!song.audio_path) {
    console.log('  ⚠ No audio path. Skipping.');
    skipped++;
    continue;
  }

  /*
   * Check whether this object already exists in R2.
   * This makes the migration safe to rerun.
   */
  try {
    await r2.send(
      new HeadObjectCommand({
        Bucket: R2_BUCKET,
        Key: song.audio_path,
      })
    );

    console.log('  ✓ Already exists in R2. Skipping.');
    skipped++;
    continue;
  } catch {
    // Object does not exist yet. Continue with migration.
  }

  /*
   * Download directly from Supabase Storage using the
   * authenticated service-role client.
   *
   * This works even when the Supabase bucket is private.
   */
  const {
    data: file,
    error: downloadError,
  } = await supabase.storage
    .from(AUDIO_BUCKET)
    .download(song.audio_path);

  if (downloadError) {
    console.error(
      `  ✗ Supabase download failed: ${downloadError.message}`
    );

    failed++;
    continue;
  }

  if (!file) {
    console.error(
      '  ✗ Supabase returned no file data.'
    );

    failed++;
    continue;
  }

  const buffer = Buffer.from(
    await file.arrayBuffer()
  );

  console.log(
    `  Downloaded: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`
  );

  /*
   * Upload directly to Cloudflare R2.
   */
  try {
    await r2.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: song.audio_path,
        Body: buffer,

        ContentType:
          song.audio_mime_type || 'audio/mpeg',

        ContentLength: buffer.length,

        CacheControl:
          'public, max-age=31536000, immutable',
      })
    );

    console.log(
      `  ✓ Uploaded to R2: ${song.audio_path}`
    );

    uploaded++;
  } catch (uploadError) {
    console.error(
      `  ✗ R2 upload failed: ${
        uploadError instanceof Error
          ? uploadError.message
          : String(uploadError)
      }`
    );

    failed++;
  }
}

console.log('');
console.log('========================================');
console.log('Migration finished');
console.log('========================================');
console.log(`Uploaded: ${uploaded}`);
console.log(`Skipped:  ${skipped}`);
console.log(`Failed:   ${failed}`);
console.log('========================================');

if (failed > 0) {
  process.exitCode = 1;
}