import { Jimp } from "jimp";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function cropImage(filename) {
  try {
    const imagePath = path.join(__dirname, `../public/images/${filename}`);
    console.log(`Processing ${filename}...`);

    const image = await Jimp.read(imagePath);
    console.log(`Original: ${image.bitmap.width}x${image.bitmap.height}`);

    // Try aggressive tolerance
    image.autocrop({ tolerance: 0.4 });

    console.log(`New: ${image.bitmap.width}x${image.bitmap.height}`);

    await image.write(imagePath);
    console.log("Saved.");
  } catch (error) {
    console.error(error);
  }
}

async function main() {
  await cropImage("home.png");
}

main();
