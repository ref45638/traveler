import { Jimp } from "jimp";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function checkColor() {
  try {
    const imagePath = path.join(__dirname, "../public/images/home.png");
    const image = await Jimp.read(imagePath);

    const color = image.getPixelColor(0, 0);
    const rgba = Jimp.intToRGBA(color);
    console.log("Top-left pixel color:", rgba);

    // Try cropping with higher tolerance and leave border
    // If it's white (255,255,255, 255), we might need to make it transparent or crop white.

    if (rgba.a === 255 && rgba.r > 240 && rgba.g > 240 && rgba.b > 240) {
      console.log("Background seems to be white/light. Attempting to autocrop based on this color.");
      // Jimp's autocrop usually works on transparency or the border color.
      // Let's try to set tolerance higher.
      image.autocrop({ tolerance: 0.3 });
    } else {
      image.autocrop({ tolerance: 0.3 });
    }

    console.log("New size with 0.3 tolerance:", image.bitmap.width, "x", image.bitmap.height);
    await image.write(imagePath);
  } catch (error) {
    console.error("Error:", error);
  }
}

checkColor();
