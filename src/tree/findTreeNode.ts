import { everyTree } from './everyTree';
import type { BooleanType, Iterator, TreeNode } from './tree.type';

/**
 * 在树中查找满足条件的节点。
 * @param tree - 要搜索的树。
 * @param predicate - 用于测试树中每个节点的函数。
 * @returns 找到的第一个满足条件的节点，如果没有找到则返回 null。
 */

export function findTreeNode<T extends TreeNode>(tree: T[], predicate: Iterator<T, BooleanType | void>): T | null {
  let foundNode: T | null = null;

  // 在找到节点后，直接返回 false 停止遍历，避免不必要的遍历。
  everyTree<T>(tree, (node, options) => {
    if (predicate(node, options)) {
      foundNode = node!;
      return false;
    }
    return true;
  });
  return foundNode;
}
