const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { GlobalFonts } = require('@napi-rs/canvas');

const FONTS = [
  { name: 'Poppins', url: 'https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-Bold.ttf' },
  { name: 'Montserrat', url: 'https://github.com/google/fonts/raw/main/ofl/montserrat/Montserrat%5Bwght%5D.ttf' },
  { name: 'Bebas Neue', url: 'https://github.com/google/fonts/raw/main/ofl/bebasneue/BebasNeue-Regular.ttf' },
  { name: 'Orbitron', url: 'https://github.com/google/fonts/raw/main/ofl/orbitron/Orbitron%5Bwght%5D.ttf' },
  { name: 'Oswald', url: 'https://github.com/google/fonts/raw/main/ofl/oswald/Oswald%5Bwght%5D.ttf' },
  { name: 'Inter', url: 'https://github.com/google/fonts/raw/main/ofl/inter/Inter%5Bopsz%2Cwght%5D.ttf' },
  { name: 'Roboto', url: 'https://github.com/google/roboto/raw/main/src/hinted/Roboto-Bold.ttf' }
];

async function loadFonts() {
  const fontsDir = path.join(__dirname, '../assets/fonts');
  if (!fs.existsSync(fontsDir)) {
    fs.mkdirSync(fontsDir, { recursive: true });
  }

  for (const font of FONTS) {
    const fontPath = path.join(fontsDir, `${font.name}.ttf`);
    if (!fs.existsSync(fontPath)) {
      console.log(`[Fonts] Downloading font: ${font.name}...`);
      try {
        const response = await axios({
          method: 'get',
          url: font.url,
          responseType: 'stream',
          timeout: 10000
        });
        
        const writer = fs.createWriteStream(fontPath);
        response.data.pipe(writer);
        
        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });
        console.log(`[Fonts] Downloaded ${font.name} successfully.`);
      } catch (err) {
        console.error(`[Fonts] Failed to download ${font.name}:`, err.message);
        continue;
      }
    }

    if (fs.existsSync(fontPath)) {
      try {
        const success = GlobalFonts.registerFromPath(fontPath, font.name);
        if (success) {
          console.log(`[Fonts] Registered font: ${font.name}`);
        } else {
          console.warn(`[Fonts] Failed registering font: ${font.name}`);
        }
      } catch (e) {
        console.error(`[Fonts] Failed to register font ${font.name}:`, e.message);
      }
    }
  }
}

module.exports = { loadFonts };
