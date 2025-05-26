import Markdoc, { Node } from "@markdoc/markdoc";
import { ParsedContentEntry } from "./schemas.js";

const astConversionFnsByTagName: Record<
  string,
  (node: ParsedContentEntry, childAsts: Node[]) => Node
> = {
  h1: buildHeadingNode,
  h2: buildHeadingNode,
  h3: buildHeadingNode,
  h4: buildHeadingNode,
  h5: buildHeadingNode,
  h6: buildHeadingNode,
};

export function treeToAst(treeNode: ParsedContentEntry) {
  const tagName = treeNode.item.data?.tagName;
  if (!tagName || !astConversionFnsByTagName[tagName]) {
    return null;
  }

  const childAsts: Node[] = [];
  if (treeNode.children && treeNode.children.length > 0) {
    treeNode.children.forEach((childTreeNode) => {
      const childTree = treeToAst(childTreeNode);
      if (childTree) {
        childAsts.push(childTree);
      }
    });
  }

  const node = astConversionFnsByTagName[tagName](treeNode, childAsts);

  return node;
}

function buildHeadingNode(
  treeNode: ParsedContentEntry,
  childAsts: Node[]
): Node {
  let attrs: Record<string, any> = {};
  if (treeNode.item.data?.attrs) {
    attrs = treeNode.item.data.attrs;
  }

  const levelsByTagName: Record<string, number> = {
    h1: 1,
    h2: 2,
    h3: 3,
    h4: 4,
    h5: 5,
    h6: 6,
  };

  const level = levelsByTagName[treeNode.item.data.tagName];

  if (!level) {
    throw new Error(`Unsupported heading treeNode: ${treeNode}`);
  }

  const node = new Markdoc.Ast.Node("heading", { level, ...attrs }, childAsts);

  if (!node) {
    throw new Error(`Failed to build AST node for heading: ${treeNode}`);
  }

  if (Array.isArray(node)) {
    throw new Error(
      `Expected a single AST node for heading, but got an array: ${node}`
    );
  }

  return node;
}
