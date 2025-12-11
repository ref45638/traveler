import { Jimp } from "jimp";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function customCrop(filename) {
  try {
    const imagePath = path.join(__dirname, `../public/images/${filename}`);
    console.log(`Processing ${filename}...`);

    const image = await Jimp.read(imagePath);
    const width = image.bitmap.width;
    const height = image.bitmap.height;

    let minX = width,
      minY = height,
      maxX = 0,
      maxY = 0;

    // Define what is "background"
    // We consider transparent OR white as background
    const isBackground = (r, g, b, a) => {
      // Transparent
      if (a < 50) return true;
      // White (or very light)
      if (r > 240 && g > 240 && b > 240) return true;
      return false;
    };

    image.scan(0, 0, width, height, function (x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];
      const a = this.bitmap.data[idx + 3];

      if (!isBackground(r, g, b, a)) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    });

    if (minX < maxX && minY < maxY) {
      const cropWidth = maxX - minX + 1;
      const cropHeight = maxY - minY + 1;
      console.log(`Cropping to: x=${minX}, y=${minY}, w=${cropWidth}, h=${cropHeight}`);

      // Add a little padding
      const padding = 10;
      const pMinX = Math.max(0, minX - padding);
      const pMinY = Math.max(0, minY - padding);
      const pMaxX = Math.min(width, maxX + padding);
      const pMaxY = Math.min(height, maxY + padding);

      image.crop({ x: pMinX, y: pMinY, w: pMaxX - pMinX, h: pMaxY - pMinY });
      await image.write(imagePath);
      console.log("Saved.");
    } else {
      console.log("No content found to crop (or image is blank/all white).");
    }
  } catch (error) {
    console.error(error);
  }
}

async function main() {
  await customCrop("home.png");
  await customCrop("house.png");
}

main();
