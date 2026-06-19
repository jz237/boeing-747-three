import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.INSPECT_URL ?? "http://127.0.0.1:5173";
const outputDir = path.resolve("inspection-renders");
const views = ["front", "side", "top", "rear", "quarter"];

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 });

for (const view of views) {
  await page.goto(`${baseUrl}/?view=${view}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(outputDir, `${view}.png`) });
  console.log(`${view}: ${path.join(outputDir, `${view}.png`)}`);
}

await browser.close();
