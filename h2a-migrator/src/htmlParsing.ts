import fs from "fs";
import { parse, DefaultTreeAdapterTypes } from "parse5";
import {
  ContentItemSchema,
  ParsedContentTree,
} from "./schemas/parsedContentTree.js";

export function htmlToParsedContentTree(htmlFilePath: string) {
  const htmlContent = fs.readFileSync(htmlFilePath, "utf-8");
  const document = parse(htmlContent);

  const articleHtmlNode = findArticleNode(document);
  if (!articleHtmlNode) {
    throw new Error("No article node found in the document.");
  }

  const tree = buildParsedContentTree({ sourceHtmlNode: articleHtmlNode });

  return tree;
}

function nodeHasClass(
  node: DefaultTreeAdapterTypes.ChildNode,
  className: string
): boolean {
  if (
    node.nodeName !== "div" ||
    !("attrs" in node) ||
    !Array.isArray(node.attrs)
  ) {
    return false;
  }
  const classAttr = node.attrs.find((attr) => attr.name === "class");
  if (classAttr && classAttr.value) {
    const classes = classAttr.value.split(" ");
    return classes.includes(className);
  }
  return false;
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
    (attr) => attr.name === "data-shortcode-manifest"
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

function buildParsedContentTree(p: {
  sourceHtmlNode: DefaultTreeAdapterTypes.ChildNode;
}): ParsedContentTree | null {
  let result: ParsedContentTree | null = null;

  const shortcodeData = extractHugoShortcodeData(p.sourceHtmlNode);
  if (shortcodeData) {
    console.log(
      `Found shortcode: ${shortcodeData.nodeName} with data:`,
      shortcodeData
    );
    result = {
      item: {
        type: "shortcode",
        data: shortcodeData,
      },
      children: [],
    };
  } else {
    // Remove circular references
    // @ts-ignore, we aren't actually going to use childNodes
    // so we don't care whether it's defined or not
    const { parentNode, childNodes, namespaceURI, ...data } = p.sourceHtmlNode;

    if (!("tagName" in data)) {
      if (data.nodeName === "#text") {
        // Handle text nodes
        result = {
          item: {
            type: "text",
            data: { nodeName: "#text", value: data.value || "" },
          },
          children: [],
        };
      }
    } else {
      result = {
        item: {
          type: "htmlTag",
          data,
        },
        children: [],
      };
    }
  }

  if (result) {
    result.item = ContentItemSchema.parse(result.item);
  }

  // Recurse into children if present
  if (
    result &&
    "childNodes" in p.sourceHtmlNode &&
    Array.isArray(p.sourceHtmlNode.childNodes)
  ) {
    p.sourceHtmlNode.childNodes.forEach((child) => {
      const treeNode = buildParsedContentTree({
        sourceHtmlNode: child,
      });

      if (treeNode) {
        result.children.push(treeNode);
      }
    });
  }

  return result;
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
