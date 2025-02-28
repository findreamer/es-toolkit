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

  const result: R[] = [];

  function mapItem(item: T, index: number) {
    const children = item[childrenKey] as T[] | undefined;
    const newItem = (iterator(item, {
      index,
      level,
      paths,
      indexes: [...indexes],
      childrenKey,
    }) ?? { ...item }) as T;

    if (children?.length) {
      const childResults: R[] = [];
      const mappedChildren = mapTree(children, iterator, {
        index,
        level: level + 1,
        useDfs,
        paths: [...paths, newItem],
        indexes: [...indexes, index],
        childrenKey,
      });

      for (let i = 0; i < mappedChildren.length; i++) {
        childResults.push(mappedChildren[i]);
      }

      (newItem as any)[childrenKey] = childResults;
    }

    return newItem as unknown as R;
  }

  if (useDfs) {
    for (let i = 0; i < tree.length; i++) {
      const item = tree[i];
      const children = item[childrenKey] as T[] | undefined;

      let mappedChildren: R[] | undefined;

      if (children) {
        mappedChildren = mapTree(children, iterator, {
          index: i,
          level: level + 1,
          useDfs,
          paths: [...paths, item],
          indexes: [...indexes, i],
          childrenKey,
        });
      }

      const newItem = mappedChildren ? { ...item, [childrenKey]: mappedChildren } : item;

      const iteratedItem = iterator(newItem as T, {
        index: i,
        level,
        paths,
        indexes: [...indexes],
        childrenKey,
      });

      result.push((iteratedItem as unknown as R) ?? (newItem as unknown as R));
    }
  } else {
    for (let i = 0; i < tree.length; i++) {
      result.push(mapItem(tree[i], i));
    }
  }

  return result;
}
