import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function main() {
  const inputPath = path.resolve(process.cwd(), 'mlllpfppp.jpg');
  const publicDir = path.resolve(process.cwd(), 'public');

  if (!fs.existsSync(inputPath)) {
    console.error('mlllpfppp.jpg not found');
    process.exit(1);
  }

  // 1. High-res WebP for site logo / profile logo
  await sharp(inputPath)
    .resize(256, 256, { fit: 'cover' })
    .webp({ quality: 95 })
    .toFile(path.join(publicDir, 'logo.webp'));

  // 2. Also keep a jpg version
  await sharp(inputPath)
    .resize(256, 256, { fit: 'cover' })
    .jpeg({ quality: 95 })
    .toFile(path.join(publicDir, 'logo.jpg'));

  // 3. Favicon (64x64)
  await sharp(inputPath)
    .resize(64, 64, { fit: 'cover' })
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));

  console.log('Successfully generated public/logo.webp, public/logo.jpg, and public/favicon.png!');
}

main().catch(console.error);
