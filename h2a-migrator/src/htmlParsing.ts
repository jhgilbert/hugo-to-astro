import fs from "fs";
import Markdoc from "@markdoc/markdoc";
import { parse, DefaultTreeAdapterTypes } from "parse5";

export function htmlToAst(htmlFilePath: string) {
  const htmlContent = fs.readFileSync(htmlFilePath, "utf-8");
  const document = parse(htmlContent);

  const articleNode = findArticleNode(document);
  if (!articleNode) {
    throw new Error("No article node found in the document.");
  }

  traverseNode(articleNode);
}

function extractHugoShortcodeData(node: DefaultTreeAdapterTypes.ChildNode) {
  if (
    node.nodeName !== "div" ||
    !("attrs" in node) ||
    !Array.isArray(node.attrs)
  ) {
    return null;
  }

  const dataInfoAttr = node.attrs.find(
    (attr) => attr.name === "data-shortcode-info"
  );

  if (dataInfoAttr) {
    try {
      return JSON.parse(dataInfoAttr.value);
    } catch (e) {
      console.error("Failed to parse data-info attribute:", e);
    }
  }
  return null;
}

function traverseNode(node: DefaultTreeAdapterTypes.ChildNode, depth = 0) {
  const indent = "  ".repeat(depth);
  console.log(indent + "nodeName:", node.nodeName);

  // check whether the node has the class hugo-shortcode
  const shortcodeData = extractHugoShortcodeData(node);
  if (shortcodeData) {
    console.log(
      indent + "  Shortcode data:",
      JSON.stringify(shortcodeData, null, 2)
    );
    return;
  }

  // Recurse into children if present
  if ("childNodes" in node && Array.isArray(node.childNodes)) {
    node.childNodes.forEach((child) => traverseNode(child, depth + 1));
  }
}

function findArticleNode(document: DefaultTreeAdapterTypes.Document) {
  for (const node of document.childNodes) {
    const articleNode = scanForArticleNode(node);
    if (articleNode) {
      return articleNode;
    }
  }

  return null;
}

function scanForArticleNode(
  node: DefaultTreeAdapterTypes.ChildNode
): DefaultTreeAdapterTypes.ChildNode | null {
  if (node.nodeName === "article") {
    return node;
  }

  if ("childNodes" in node && Array.isArray(node.childNodes)) {
    for (const child of node.childNodes) {
      const articleNode = scanForArticleNode(child);
      if (articleNode) {
        return articleNode;
      }
    }
  }

  return null;
}
