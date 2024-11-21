import { everyTree } from '.';
import type { Iterator, TreeNode } from './tree.type';

/**
 * 判断树中是否有满足条件的节点
 * @param tree
 * @param iterator
 * @returns boolean
 */

export function someTree<T extends TreeNode>(tree: T[], iterator: Iterator<T, boolean>): boolean {
  let hasMatchingNode = false;
  everyTree(tree, (node, options) => {
    if (iterator(node, options)) {
      hasMatchingNode = true;
      return false;
    }
    return true;
  });
  return hasMatchingNode;
}
