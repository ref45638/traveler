import { Jimp } from "jimp";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function cropImage() {
  try {
    const imagePath = path.join(__dirname, "../public/images/home.png");
    console.log(`Reading image from: ${imagePath}`);

    const image = await Jimp.read(imagePath);

    console.log("Original size:", image.bitmap.width, "x", image.bitmap.height);

    // Autocrop the image
    image.autocrop();

    console.log("New size:", image.bitmap.width, "x", image.bitmap.height);

    await image.write(imagePath);
    console.log("Image cropped and saved successfully!");
  } catch (error) {
    console.error("Error cropping image:", error);
  }
}

cropImage();
