import { type CacheOptions, findTreeNode } from './findTreeNode';
import type { Iterator, TreeNode } from './tree.type';

/**
 * 在树中查找满足条件的节点的索引。
 * @param tree 树形数据
 * @param predicate 迭代器函数，用于判断节点是否满足条件
 * @param cacheOptions 配置选项
 * @returns 满足条件的节点索引数组或 null
 */

export function findNodeIndexes<T extends TreeNode>(
  tree: T[],
  predicate: Iterator<T, boolean>,
  cacheOptions?: Omit<CacheOptions<T>, 'effect'>
): number[] | null {
  let nodeIndexes: number[] = [];

  const updateIndexes: CacheOptions<T>['effect'] = (_, { indexes }) => {
    nodeIndexes = indexes;
  };

  findTreeNode<T>(
    tree,
    (node, options) => {
      if (predicate(node, options)) {
        updateIndexes(node, options);
        return true;
      }
      return false;
    },
    cacheOptions ? { ...cacheOptions, effect: updateIndexes } : undefined
  );

  return nodeIndexes.length ? nodeIndexes : null;
}
