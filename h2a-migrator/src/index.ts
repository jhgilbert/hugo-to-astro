import fs from "fs";
import path from "path";
import { HUGO_SITE_DIR, OUTPUT_DIR } from "./config.js";
import { stageHugoSite } from "./siteStaging.js";
import { execSync } from "child_process";
import {
  getMarkdownFilePaths,
  getHugoOutputPath,
  makeTempHugoSiteCopy,
  resetOutDir,
} from "./fileUtils.js";
import Markdoc from "@markdoc/markdoc";
import { htmlToParsedContentTree } from "./htmlParsing.js";

function migrateContent() {
  resetOutDir();

  // Copy, stage, and build the Hugo site
  const hugoSiteDupDir = makeTempHugoSiteCopy(HUGO_SITE_DIR);
  stageHugoSite(hugoSiteDupDir);
  buildHugoSite({ sitePath: hugoSiteDupDir, debug: true });

  // Process each Markdown file in the site's content directory
  const markdownFilePaths = getMarkdownFilePaths(hugoSiteDupDir + "/content");

  markdownFilePaths.forEach((mdFilePath) => {
    // Convert the file to a data structure
    const htmlFilePath = getHugoOutputPath(mdFilePath, hugoSiteDupDir);
    const tree = htmlToParsedContentTree(htmlFilePath);

    // Write file to the output directory
    const outputFilePath = path.join(
      OUTPUT_DIR,
      path.relative(hugoSiteDupDir, mdFilePath).replace(/\.md$/, ".pct.json")
    );

    // Ensure the output directory exists
    fs.mkdirSync(path.dirname(outputFilePath), { recursive: true });

    // make a message if no tree is found
    fs.writeFileSync(outputFilePath, JSON.stringify(tree, null, 2));

    writeTestFiles(mdFilePath, htmlFilePath, hugoSiteDupDir);
  });

  fs.rmSync(hugoSiteDupDir, { recursive: true, force: true });
}

migrateContent();

function writeTestFiles(
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

  fs.writeFileSync(outputDir + `/01_${unit}.md`, fileContents);

  // write the html contents to the test targets directory
  const htmlContents = fs.readFileSync(htmlFilePath, "utf-8");
  fs.writeFileSync(outputDir + `/02_${unit}.html`, htmlContents);

  // make an AST and write that to the test targets directory
  const ast = Markdoc.parse(fileContents);
  fs.writeFileSync(
    outputDir + `/03_${unit}.naturalAst.json`,
    JSON.stringify(ast, null, 2)
  );
}

function buildHugoSite(p: { sitePath: string; debug?: boolean }): string {
  try {
    execSync("rm -rf public && hugo", {
      cwd: p.sitePath,
      stdio: "inherit", // Passes output directly to console
    });
    console.log("✅ Hugo site built successfully.");
  } catch (err) {
    console.error("❌ Hugo build failed:", err);
    throw err;
  }

  const outputDir = path.join(p.sitePath, "public");

  // Write a copy of the html dir to the outdir for debugging purposes
  if (p.debug) {
    const debugHtmlDir = path.join(OUTPUT_DIR, "build_html");
    if (fs.existsSync(debugHtmlDir)) {
      fs.rmSync(debugHtmlDir, { recursive: true, force: true });
    }
    fs.mkdirSync(debugHtmlDir, { recursive: true });
    fs.cpSync(outputDir, debugHtmlDir, { recursive: true });
  }

  return outputDir;
}
