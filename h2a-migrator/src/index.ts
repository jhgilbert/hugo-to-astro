import os from "os";
import fs from "fs";
import path from "path";
import { ulid } from "ulid";
import { HUGO_SITE_DIR, OUTPUT_DIR } from "./config.js";
import { stageHugoSite } from "./shortcodeStaging.js";
import { execSync } from "child_process";
import {
  getMarkdownFilePaths,
  buildAstFromContentFiles,
  getHugoOutputPath,
} from "./mdFileProcessing.js";

function migrateContent() {
  console.log("Migrating content from Hugo to Astro...");

  console.log("\nMaking a temporary copy of the Hugo site...");
  const hugoSiteDupDir = makeTempHugoSiteCopy(HUGO_SITE_DIR);

  console.log("\nStaging the Hugo site...");
  stageHugoSite(hugoSiteDupDir);

  console.log("\nBuilding the Hugo site...");
  const htmlDir = buildHugoSite(hugoSiteDupDir);

  // Delete the old out folder
  if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  }
  // Make a new out folder
  fs.mkdirSync(path.dirname(OUTPUT_DIR), { recursive: true });

  const markdownFilePaths = getMarkdownFilePaths(hugoSiteDupDir + "/content");
  console.log("\nMarkdown file paths:");
  markdownFilePaths.forEach((mdFilePath) => {
    console.log("Md file path:", mdFilePath);
    const htmlFilePath = getHugoOutputPath(mdFilePath, hugoSiteDupDir);
    console.log("Hugo output path:", htmlFilePath);
    const tree = buildAstFromContentFiles({
      mdFilePath,
      htmlFilePath,
    });

    // const fileContents = Markdoc.format(ast);
    // Write file to the output directory
    const outputFilePath = path.join(
      OUTPUT_DIR,
      path.relative(hugoSiteDupDir, mdFilePath).replace(/\.md$/, ".json")
    );

    // Ensure the output directory exists
    fs.mkdirSync(path.dirname(outputFilePath), { recursive: true });

    // make a message if no tree is found
    fs.writeFileSync(outputFilePath, JSON.stringify(tree, null, 2));
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
