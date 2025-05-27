import fs from "fs";
import path from "path";
import { HUGO_SITE_DIR, OUTPUT_DIR } from "./config.js";
import { stageHugoSite } from "./siteStaging.js";
import { execSync } from "child_process";
import {
  getMarkdownFilePaths,
  getHugoOutputPath,
  makeTempHugoSiteCopy,
} from "./fileUtils.js";
import Markdoc from "@markdoc/markdoc";
import { htmlToParsedContentTree } from "./htmlParsing.js";

function migrateContent() {
  console.log("Migrating content from Hugo to Astro...");

  console.log("\nMaking a temporary copy of the Hugo site...");
  const hugoSiteDupDir = makeTempHugoSiteCopy(HUGO_SITE_DIR);

  console.log("\nStaging the Hugo site...");
  stageHugoSite(hugoSiteDupDir);

  const htmlDir = buildHugoSite(hugoSiteDupDir);

  // Delete the old out folder
  if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  }
  // Make a new out folder
  fs.mkdirSync(path.dirname(OUTPUT_DIR), { recursive: true });

  // Write a copy of the html dir to the outdir for debugging purposes
  const debugHtmlDir = path.join(OUTPUT_DIR, "build_html");
  if (fs.existsSync(debugHtmlDir)) {
    fs.rmSync(debugHtmlDir, { recursive: true, force: true });
  }
  fs.mkdirSync(debugHtmlDir, { recursive: true });
  fs.cpSync(htmlDir, debugHtmlDir, { recursive: true });

  const markdownFilePaths = getMarkdownFilePaths(hugoSiteDupDir + "/content");

  markdownFilePaths.forEach((mdFilePath) => {
    // Convert the file to a data structure
    const htmlFilePath = getHugoOutputPath(mdFilePath, hugoSiteDupDir);
    const tree = htmlToParsedContentTree(htmlFilePath);

    // Write file to the output directory
    const outputFilePath = path.join(
      OUTPUT_DIR,
      path.relative(hugoSiteDupDir, mdFilePath).replace(/\.md$/, ".json")
    );

    // Ensure the output directory exists
    fs.mkdirSync(path.dirname(outputFilePath), { recursive: true });

    // make a message if no tree is found
    fs.writeFileSync(outputFilePath, JSON.stringify(tree, null, 2));

    writeTestTarget(mdFilePath, htmlFilePath, hugoSiteDupDir);
  });

  console.log("\nDeleting the temporary Hugo site copy...");
  fs.rmSync(hugoSiteDupDir, { recursive: true, force: true });
  console.log("✅ Temporary Hugo site copy deleted.");
}

migrateContent();

function writeTestTarget(
  mdFilePath: string,
  htmlFilePath: string,
  hugoSiteDupDir: string
) {
  const targetsDir = path.join(OUTPUT_DIR, "test_targets");

  const unit = path.basename(mdFilePath, path.extname(mdFilePath));

  // Make an outputDir that replaces the hugoSiteDupDir with the targetsDir
  let outputDir = path.join(
    targetsDir,
    path.relative(hugoSiteDupDir, path.dirname(mdFilePath))
  );
  outputDir = path.join(outputDir, unit);

  // ensure the outputDir exists
  fs.mkdirSync(outputDir, { recursive: true });

  // get the file contents
  const fileContents = fs.readFileSync(mdFilePath, "utf-8");

  fs.writeFileSync(outputDir + `/${unit}.md`, fileContents);

  // write the html contents to the test targets directory
  const htmlContents = fs.readFileSync(htmlFilePath, "utf-8");
  fs.writeFileSync(outputDir + `/${unit}.html`, htmlContents);

  // make an AST and write that to the test targets directory
  const ast = Markdoc.parse(fileContents);
  fs.writeFileSync(
    outputDir + `/${unit}.ast.json`,
    JSON.stringify(ast, null, 2)
  );
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
