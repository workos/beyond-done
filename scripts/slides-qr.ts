import { mkdir, writeFile, rm } from "node:fs/promises";
import QRCode from "qrcode";
import { pathToFileURL } from "node:url";
import { repoUrl, glossaryUrl } from "../slides/resources.js";

export async function generateSlidesQr() {
  const output = new URL("../slides/public/qr/", import.meta.url);
  await mkdir(output, { recursive: true });
  for (const [name, url] of Object.entries({ repo: repoUrl, glossary: glossaryUrl })) {
    const file = new URL(`${name}.svg`, output);
    if (!url) {
      await rm(file, { force: true });
      console.log(`${name}: no QR until the class hostname is configured`);
      continue;
    }
    const svg = await QRCode.toString(url, { type: "svg", errorCorrectionLevel: "M", margin: 4, width: 320 });
    await writeFile(file, svg);
    console.log(`${name}: ${url}`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await generateSlidesQr();
