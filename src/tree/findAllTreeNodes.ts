import { eachTree } from './eachTree';
import type { Iterator, TreeNode } from './tree.type';

/**
 * 查找所有符合条件的节点
 * @param tree 树形数据
 * @param predicate 迭代器函数，用于判断节点是否满足条件
 * @returns 符合条件的节点数组
 */

export function findAllTreeNodes<T extends TreeNode>(tree: T[], predicate: Iterator<T, boolean>): T[] {
  const matchingNodes: T[] = [];
  eachTree(tree, (node, options) => {
    if (predicate(node, options)) {
      matchingNodes.push(node!);
    }
  });

  return matchingNodes;
}
