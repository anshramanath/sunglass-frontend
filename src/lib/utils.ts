import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { CategoryNode } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function findCategoryId(tree: CategoryNode[], segments: string[]): string | null {
  let current = tree;
  let node: CategoryNode | null = null;
  for (const slug of segments) {
    node = current.find((n) => n.slug === slug) ?? null;
    if (!node) return null;
    current = node.children ?? [];
  }
  return node?.id ?? null;
}

function collectLeavesHelper(nodes: CategoryNode[], path: string[], result: Record<string, { id: string; name: string; path: string }>): void {
  for (const node of nodes) {
    const currentPath = [...path, node.slug];
    if (!node.children?.length) {
      result[node.slug] = { id: node.id, name: node.name, path: currentPath.join("/") };
    } else {
      collectLeavesHelper(node.children, currentPath, result);
    }
  }
}

export function collectLeaves(tree: CategoryNode[]): Record<string, { id: string; name: string; path: string }> {
  const result: Record<string, { id: string; name: string; path: string }> = {};
  collectLeavesHelper(tree, [], result);
  return result;
}
