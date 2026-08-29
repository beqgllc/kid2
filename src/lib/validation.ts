export function assertText(value: string, field: string, min = 1, max = 2000) {
  const v = value.trim();
  if (v.length < min) throw new Error(`${field} is required.`);
  if (v.length > max) throw new Error(`${field} is too long.`);
  return v;
}

export function assertEmail(value: string) {
  const email = value.trim();
  if (!email) return '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid email address.');
  return email;
}

export function assertAudio(file: File) {
  const allowed = new Set(['audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/aac', 'audio/wav', 'audio/x-wav', 'audio/ogg', 'audio/opus']);
  const ext = file.name.split('.').pop()?.toLowerCase();
  const allowedExt = new Set(['mp3', 'm4a', 'aac', 'wav', 'ogg', 'opus']);
  if (!allowed.has(file.type) && !allowedExt.has(ext || '')) throw new Error(`Unsupported audio format: ${file.name}`);
  if (file.size <= 0) throw new Error(`Empty file: ${file.name}`);
}
