import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function main() {
  const publicDir = path.resolve(process.cwd(), 'public');

  const turtleSrc = path.resolve(process.cwd(), 'Dragon_Turtle.webp');
  const retriSrc = path.resolve(process.cwd(), 'retri.jpeg');

  if (fs.existsSync(turtleSrc)) {
    await sharp(turtleSrc)
      .resize(600, 600, { fit: 'contain', background: { r: 11, g: 13, b: 15, alpha: 1 } })
      .webp({ quality: 90 })
      .toFile(path.join(publicDir, 'turtle.webp'));
    console.log('Saved public/turtle.webp');
  }

  if (fs.existsSync(retriSrc)) {
    await sharp(retriSrc)
      .resize(256, 256, { fit: 'cover' })
      .webp({ quality: 95 })
      .toFile(path.join(publicDir, 'retri.webp'));
    console.log('Saved public/retri.webp');
  }
}

main().catch(console.error);
