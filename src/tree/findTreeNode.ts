import { everyTreeNode, EveryTreeNodeOptions } from './everyTreeNode';
import type { BooleanType, Iterator, TreeNode, TreeOptions } from './tree.type';

export interface FindTreeNodeOptions<T extends TreeNode> extends EveryTreeNodeOptions<T> {
  /** 匹配到 node 执行副作用函数 */
  effect?: (node: T, options: Required<TreeOptions<T>>) => void;
}

/**
 * 在树中查找满足条件的节点。
 * @param tree - 要搜索的树。
 * @param predicate - 用于测试树中每个节点的函数。
 * @param options - 可选配置对象
 * @returns 找到的第一个满足条件的节点，如果没有找到则返回 null。
 */

export function findTreeNode<T extends TreeNode>(
  tree: T[],
  predicate: Iterator<T, BooleanType | void>,
  options?: FindTreeNodeOptions<T>
): T | null {
  let foundNode: T | null = null;

  // 在找到节点后，直接返回 false 停止遍历，避免不必要的遍历。
  everyTreeNode<T>(
    tree,
    (node, opts) => {
      if (predicate(node, opts)) {
        foundNode = node!;

        if (options?.effect && typeof options.effect === 'function') {
          options.effect(node, opts);
        }

        return false;
      }
      return true;
    },
    options
  );
  return foundNode;
}
