import { Jimp } from "jimp";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function cropImage(filename) {
  try {
    const imagePath = path.join(__dirname, `../public/images/${filename}`);
    console.log(`Reading image from: ${imagePath}`);

    const image = await Jimp.read(imagePath);

    console.log(`${filename} Original size:`, image.bitmap.width, "x", image.bitmap.height);

    // Autocrop with tolerance (0.0002 is default, try higher if needed, e.g. 0.1 for 10% tolerance)
    // Also leave a small padding
    image.autocrop({ tolerance: 0.1, cropOnlyFrames: false });

    console.log(`${filename} New size:`, image.bitmap.width, "x", image.bitmap.height);

    await image.write(imagePath);
    console.log(`${filename} cropped and saved successfully!`);
  } catch (error) {
    console.error(`Error cropping ${filename}:`, error);
  }
}

async function main() {
  await cropImage("home.png");
  await cropImage("house.png");
}

main();
