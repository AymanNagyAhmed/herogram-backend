import { join } from 'path';
import { existsSync } from 'fs';

export function checkImageExists(filename: string): boolean {
  const filePath = join(process.cwd(), 'public', 'uploads', 'images', filename);
  console.log('Checking file path:', filePath);
  return existsSync(filePath);
} 