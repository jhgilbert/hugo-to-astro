import os from "os";
import fs from "fs";
import path from "path";
import { ulid } from "ulid";
import { HUGO_SITE_DIR } from "./config";
import { stageShortcodes } from "./shortcodeStaging";
import { execSync } from "child_process";
import { getMarkdownFilePaths, mdFileToAst } from "./mdFileProcessing";
import Markdoc from "@markdoc/markdoc";

function migrateContent() {
  console.log("Migrating content from Hugo to Astro...");

  console.log("\nMaking a temporary copy of the Hugo site...");
  const hugoSiteDupDir = makeTempHugoSiteCopy(HUGO_SITE_DIR);

  console.log("\nStaging Hugo shortcodes...");
  const shortcodesDir = path.join(hugoSiteDupDir, "layouts", "shortcodes");
  stageShortcodes(shortcodesDir);

  console.log("\nBuilding the Hugo site...");
  const htmlDir = buildHugoSite(hugoSiteDupDir);

  const markdownFilePaths = getMarkdownFilePaths(hugoSiteDupDir + "/content");
  console.log("\nMarkdown file paths:");
  markdownFilePaths.forEach((filePath) => {
    console.log(filePath);
    const ast = mdFileToAst(filePath);
    const fileContents = Markdoc.format(ast);
    console.log("File contents:", `\n${fileContents}\n`);
  });

  console.log("\nDeleting the temporary Hugo site copy...");
  fs.rmSync(hugoSiteDupDir, { recursive: true, force: true });
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
