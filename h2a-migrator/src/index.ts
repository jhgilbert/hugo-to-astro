import os from "os";
import fs from "fs";
import path from "path";
import { ulid } from "ulid";
import { HUGO_SITE_DIR } from "./config";
import { stageShortcodes } from "./shortcodeStaging";
import { execSync } from "child_process";

function migrateContent() {
  console.log("Migrating content from Hugo to Astro...");

  console.log("\nMaking a temporary copy of the Hugo site...");
  const hugoSiteCopy = makeTempHugoSiteCopy(HUGO_SITE_DIR);

  console.log("\nStaging Hugo shortcodes...");
  const shortcodesDir = path.join(hugoSiteCopy, "layouts", "shortcodes");
  stageShortcodes(shortcodesDir);

  console.log("\nBuilding the Hugo site...");
  const htmlDir = buildHugoSite(hugoSiteCopy);

  console.log("\nDeleting the temporary Hugo site copy...");
  fs.rmSync(hugoSiteCopy, { recursive: true, force: true });
  console.log("✅ Temporary Hugo site copy deleted.");
}

migrateContent();

function makeTempHugoSiteCopy(sitePath: string) {
  console.log("\nMaking a temporary copy of the Hugo site...");

  const tempDir = path.join(os.tmpdir(), `temp-hugo-sites/${ulid()}`);
  fs.cpSync(sitePath, tempDir, {
    recursive: true,
    force: true,
  });
  return tempDir;
}

function buildHugoSite(sitePath: string) {
  console.log("🛠️  Building Hugo site...");

  try {
    execSync("rm -rf public && hugo", {
      cwd: sitePath,
      stdio: "inherit", // Passes output directly to console
    });
    console.log("✅ Hugo site built successfully.");
  } catch (err) {
    console.error("❌ Hugo build failed:", err);
    throw err;
  }

  const outputDir = path.join(sitePath, "public");
  return outputDir;
}
