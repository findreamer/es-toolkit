import type { Iterator, TreeNode, TreeOptions } from './tree.type';

export interface MapTreeOptions<T> extends TreeOptions<T> {
  /** 是否深度优先， 默认 false */
  useDfs?: boolean;
}

/**
 * 映射树
 * @param tree 树
 * @param iterator 迭代器
 * @param options 选项
 * @returns 结果
 */

export function mapTree<T extends TreeNode, R>(
  tree: T[],
  iterator: Iterator<T, R>,
  options: MapTreeOptions<T> = {}
): R[] {
  const { level = 1, useDfs = false, paths = [], indexes = [], childrenKey = 'children' } = options;

  return tree.map((item, index) => {
    const children = item[childrenKey] as T[] | undefined;

    if (useDfs) {
      const mappedChildren = children
        ? mapTree(children as T[], iterator, {
          index,
          level: level + 1,
          useDfs,
          paths: [...paths, item],
          indexes: [...indexes, index],
          childrenKey,
        })
        : undefined;

      const newItem = mappedChildren ? { ...item, [childrenKey]: mappedChildren } : item;

      return (
        (iterator(newItem as T, { index, level, paths, indexes: [...indexes], childrenKey }) as unknown as R) ??
        (newItem as unknown as R)
      );
    }

    const newItem = (iterator(item, {
      index,
      level,
      paths,
      indexes: [...indexes],
      childrenKey,
    }) ?? { ...item }) as T;

    if (children?.length) {
      (newItem as any)[childrenKey] = mapTree(children, iterator, {
        index,
        level: level + 1,
        useDfs,
        paths: [...paths, newItem],
        indexes: [...indexes, index],
        childrenKey,
      }) as T[typeof childrenKey];
    }

    return newItem as unknown as R;
  });
}
