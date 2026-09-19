import { createClient } from '@supabase/supabase-js';
import {
  S3Client,
  PutObjectCommand,
} from '@aws-sdk/client-s3';

const {
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET = 'attikid-audio',
} = process.env;

if (
  !SUPABASE_URL ||
  !SUPABASE_PUBLISHABLE_KEY ||
  !R2_ACCOUNT_ID ||
  !R2_ACCESS_KEY_ID ||
  !R2_SECRET_ACCESS_KEY
) {
  throw new Error('Missing migration environment variables.');
}

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: false,
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

const { data: songs, error } = await supabase
  .from('songs')
  .select('id,audio_path,audio_mime_type,file_size,title')
  .not('audio_path', 'is', null)
  .order('created_at', { ascending: true });

if (error) {
  throw error;
}

console.log(`Found ${songs.length} songs.`);

for (let i = 0; i < songs.length; i++) {
  const song = songs[i];

  console.log(
    `[${i + 1}/${songs.length}] ${song.title}`
  );

  const sourceUrl =
    `${SUPABASE_URL}/storage/v1/object/public/attikid-audio/${song.audio_path}`;

  const response = await fetch(sourceUrl);

  if (!response.ok) {
    throw new Error(
      `Failed to download ${song.audio_path}: ` +
      `${response.status} ${response.statusText}`
    );
  }

  const buffer = Buffer.from(
    await response.arrayBuffer()
  );

  await r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: song.audio_path,
      Body: buffer,
      ContentType:
        song.audio_mime_type || 'audio/mpeg',
      CacheControl:
        'public, max-age=31536000, immutable',
    })
  );

  console.log(
    `  ✓ uploaded ${song.audio_path}`
  );
}

console.log('Migration complete.');