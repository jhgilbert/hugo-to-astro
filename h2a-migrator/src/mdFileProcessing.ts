import fs from "fs";
import path from "path";
import Markdoc from "@markdoc/markdoc";

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

export function mdFileToAst(filePath: string) {
  const source = fs.readFileSync(filePath, "utf-8");
  const dangerousAst = Markdoc.parse(source);

  // console.log("Dangersous AST:", JSON.stringify(dangerousAst, null, 2));

  const safeAst = new Markdoc.Ast.Node(
    dangerousAst.type,
    dangerousAst.attributes,
    []
  );

  console.log("Safe AST:", JSON.stringify(safeAst, null, 2));
  return safeAst;
}
