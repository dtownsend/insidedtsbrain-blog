'use client';

import type { ReactNode } from 'react';
import { HeadingNode, HeadingTreeNode, buildHeadingTree } from '@/lib/extract-headings';

interface TableOfContentsProps {
  headings: HeadingNode[];
}

function renderTree(nodes: HeadingTreeNode[]): ReactNode {
  if (nodes.length === 0) return null;
  return (
    <ul className="list-disc pl-6 sm:pl-4 space-y-1 text-gray-700">
      {nodes.map((node) => (
        <li key={node.id} className="leading-relaxed">
          <a href={`#${node.id}`} className="text-blue-600 hover:text-blue-800 underline">
            {node.text}
          </a>
          {node.children.length > 0 && renderTree(node.children)}
        </li>
      ))}
    </ul>
  );
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  if (headings.length === 0) return null;

  const tree = buildHeadingTree(headings);

  return (
    <details className="mb-8 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 group">
      <summary className="cursor-pointer font-semibold text-gray-900 select-none list-none flex items-center gap-2">
        <span className="inline-block transition-transform group-open:rotate-90" aria-hidden>
          ▶
        </span>
        Table of Contents
      </summary>
      <div className="mt-3">{renderTree(tree)}</div>
    </details>
  );
}
