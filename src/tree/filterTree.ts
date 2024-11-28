import type { BooleanType, Iterator, TreeNode, TreeOptions } from './tree.type';

export interface FilterTreeOptions<T> extends TreeOptions<T> {
  /** 是否深度优先， 默认 false */
  useDfs?: boolean;
}

/**
 * 通过迭代器过滤树。
 * @param tree - 树形数据
 * @param iterator - 迭代器函数
 * @param options - 配置选项
 * @returns 过滤后的树
 */
export function filterTree<T extends TreeNode>(
  tree: T[],
  iterator: Iterator<T, BooleanType>,
  options: FilterTreeOptions<T> = {}
): T[] {
  const { level = 1, paths = [], useDfs = false, indexes = [], childrenKey = 'children' } = options;

  const processChildren = (item: T, index: number) => {
    const children = item[childrenKey] as T[] | undefined;
    if (!Array.isArray(children)) {
      return item;
    }

    const filteredChildren = filterTree(children, iterator, {
      index: useDfs ? index : indexes[index],
      level: level + 1,
      useDfs,
      paths: [...paths, item],
      indexes: [...indexes, index],
      childrenKey,
    });

    return {
      ...item,
      [childrenKey]: filteredChildren,
    };
  };

  if (useDfs) {
    return tree
      .map((item, index) => processChildren(item, index))
      .filter((item, idx) =>
        iterator(item, {
          index: idx,
          level,
          paths: [...paths, item],
          indexes: [...indexes, idx],
          childrenKey,
        })
      );
  }

  return tree
    .filter((item, index) =>
      iterator(item, {
        index,
        level,
        paths: [...paths, item],
        indexes: [...indexes, index],
        childrenKey,
      })
    )
    .map((item, index) => processChildren(item, index));
}
