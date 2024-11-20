import { findTree } from './findTree';
import type { CacheOptions, Iterator, TreeNode } from './tree.type';

/**
 * 在树中查找满足条件的节点的索引。
 * @param tree 树形数据
 * @param iterator 迭代器函数，用于判断节点是否满足条件
 * @param options 配置选项
 * @returns 满足条件的节点索引数组或 null
 */

export function findNodeIndexes<T extends TreeNode>(
  tree: T[],
  iterator: Iterator<T, boolean>,
  options?: Omit<CacheOptions<T>, 'foundEffect'>
): number[] | null {
  let resultIndexes: number[] = [];

  const onNodeFound: CacheOptions<T>['foundEffect'] = (_, { indexes }) => {
    resultIndexes = indexes;
  };

  findTree(
    tree,
    (item, opts) => {
      if (iterator(item, opts)) {
        onNodeFound(item, opts);
        return true;
      }
      return false;
    },
    options ? { ...options, foundEffect: onNodeFound } : undefined
  );

  return resultIndexes.length ? resultIndexes : null;
}
