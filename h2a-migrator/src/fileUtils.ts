import fs from "fs";
import path from "path";
import os from "os";
import { ulid } from "ulid";
import { OUTPUT_DIR } from "./config.js";

/**
 * Delete and recreate the output directory
 * to ensure a clean slate for each run.
 */
export function resetOutDir() {
  // Delete the old out folder
  if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  }
  // Make a new out folder
  fs.mkdirSync(path.dirname(OUTPUT_DIR), { recursive: true });
}

export function getMarkdownFilePaths(dir: string) {
  const files = fs.readdirSync(dir);
  const markdownFiles: string[] = [];
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isFile() && file.endsWith(".md")) {
      markdownFiles.push(filePath);
    }
    // recursively get markdown files in subdirectories
    else if (fs.statSync(filePath).isDirectory()) {
      const subDirMarkdownFiles = getMarkdownFilePaths(filePath);
      markdownFiles.push(...subDirMarkdownFiles);
    }
  }

  return markdownFiles;
}

export function getHugoOutputPath(
  mdFilePath: string,
  siteRoot: string
): string {
  const contentDir = path.join(siteRoot, "content");
  if (!mdFilePath.startsWith(contentDir)) {
    throw new Error(
      `Markdown file must be inside the Hugo "content" directory: ${contentDir}`
    );
  }

  const relPath = path.relative(contentDir, mdFilePath);
  const parsed = path.parse(relPath);

  // Determine if it's _index.md or a regular page
  const isIndex = parsed.name === "_index";

  if (isIndex) {
    // _index.md → section index → /section/index.html
    return path.join(siteRoot, "public", parsed.dir, "index.html");
  } else {
    // page.md → /page/index.html
    return path.join(siteRoot, "public", parsed.dir, parsed.name, "index.html");
  }
}

export function makeTempHugoSiteCopy(sitePath: string) {
  console.log("\nMaking a temporary copy of the Hugo site...");

  const tempDir = path.join(os.tmpdir(), `temp-hugo-sites/${ulid()}`);
  fs.cpSync(sitePath, tempDir, {
    recursive: true,
    force: true,
  });

  return tempDir;
}
