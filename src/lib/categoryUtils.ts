import { CategoryNode } from "./types";

export function findPathNodes(tree: CategoryNode[], segments: string[]): CategoryNode[] | null {
  const nodes: CategoryNode[] = [];
  let current = tree;
  for (const slug of segments) {
    const node = current.find((n) => n.slug === slug) ?? null;
    if (!node) return null;
    nodes.push(node);
    current = node.children ?? [];
  }
  return nodes;
}

export function collectLeaves(nodes: CategoryNode[], path: string[] = []): { node: CategoryNode; path: string[] }[] {
  const result: { node: CategoryNode; path: string[] }[] = [];
  for (const node of nodes) {
    const currentPath = [...path, node.slug];
    if (!node.children?.length) {
      result.push({ node, path: currentPath });
    } else {
      result.push(...collectLeaves(node.children, currentPath));
    }
  }
  return result;
}
