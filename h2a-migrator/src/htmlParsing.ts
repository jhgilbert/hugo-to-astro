import fs from "fs";
import * as cheerio from "cheerio";
import Markdoc from "@markdoc/markdoc";

// declare an object that matches tag names to a function that converts the tag to an AST node
const tagToAstNode: Record<string, (element: Element) => any> = {
  h1: (element) => {
    return new Markdoc.Ast.Node("heading", { level: 1 }, []);
  },
};

export function htmlToAst(htmlFilePath: string) {
  const htmlContent = fs.readFileSync(htmlFilePath, "utf-8");
  const $ = cheerio.load(htmlContent);

  // get the article node
  const articleNode = $("article").first();

  articleNode.children().each((index, element) => {
    const { tagName, attribs } = element;
    console.log("Element:", JSON.stringify({ tagName, attribs }, null, 2));
    console.log("Text:", $(element).text().trim());
  });

  return [];
}

function htmlNodeToAstNode(element: Element) {
  const { tagName } = element;
}
