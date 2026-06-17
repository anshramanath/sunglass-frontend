"use client";

import Link from "next/link";
import { CategoryNode } from "@/lib/types";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

function buildPath(node: CategoryNode, ancestors: CategoryNode[]): string {
  return [...ancestors, node].map((n) => n.slug).join("/");
}

function CategoryLinks({
  nodes,
  ancestors,
}: {
  nodes: CategoryNode[];
  ancestors: CategoryNode[];
}) {
  return (
    <>
      {nodes.map((node) =>
        node.children && node.children.length > 0 ? (
          <li key={node.id}>
            <p className="block px-3 py-1.5 text-sm rounded-md text-muted-foreground cursor-default">
              {node.name}
            </p>
            <ul className="ml-3">
              <CategoryLinks nodes={node.children} ancestors={[...ancestors, node]} />
            </ul>
          </li>
        ) : (
          <li key={node.id}>
            <Link
              href={`/category/${buildPath(node, ancestors)}`}
              className="block px-3 py-1.5 text-sm rounded-md hover:bg-muted"
            >
              {node.name}
            </Link>
          </li>
        )
      )}
    </>
  );
}

export default function NavMenu({ categories }: { categories: CategoryNode[] }) {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        {categories.map((cat) =>
          cat.children && cat.children.length > 0 ? (
            <NavigationMenuItem key={cat.id}>
              <NavigationMenuTrigger>{cat.name}</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="w-44 p-1">
                  <CategoryLinks nodes={cat.children} ancestors={[cat]} />
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          ) : (
            <NavigationMenuItem key={cat.id}>
              <Link href={`/category/${cat.slug}`} className={navigationMenuTriggerStyle()}>
                {cat.name}
              </Link>
            </NavigationMenuItem>
          )
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
