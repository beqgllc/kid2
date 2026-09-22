import 'dotenv/config';
import fsp from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const root = path.resolve(
  process.env.ATTIKID_MEDIA_ROOT ||
    path.join(os.homedir(), 'ATTIKID-MEDIA'),
);

const folders = [
  'music',
  'albums',
  'artwork',
  'videos',
  '_review/music',
  '_review/artwork',
  '_review/videos',
  '_processed/music',
  '_processed/artwork',
  '_processed/videos',
  '_processed/duplicates',
];

for (const folder of folders) {
  await fsp.mkdir(path.join(root, folder), { recursive: true });
}

console.log('ATTIKID media folders are ready:');
console.log(root);
for (const folder of folders) console.log('  ' + folder);
