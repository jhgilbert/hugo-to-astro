import fs from "fs";
import path from "path";
import Markdoc from "@markdoc/markdoc";
import { htmlToAst } from "./htmlParsing.js";

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

export function buildAstFromContentFiles(p: {
  mdFilePath: string;
  htmlFilePath: string;
}) {
  const source = fs.readFileSync(p.mdFilePath, "utf-8");
  const dangerousAst = Markdoc.parse(source);

  const safeAst = new Markdoc.Ast.Node(
    dangerousAst.type,
    dangerousAst.attributes,
    []
  );

  htmlToAst(p.htmlFilePath);

  return safeAst;
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
