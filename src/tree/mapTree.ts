import type { Iterator, TreeNode, TreeOptions } from './tree.type';

export interface MapTreeOptions<T> extends TreeOptions<T> {
  /** 是否深度优先， 默认 false */
  useDfs?: boolean;
}

export function mapTree<T extends TreeNode, R>(
  tree: T[],
  iterator: Iterator<T, R>,
  options: MapTreeOptions<T> = {}
): R[] {
  const { level = 1, useDfs = false, paths = [], indexes = [] } = options;

  return tree.map((item, index) => {
    if (useDfs) {
      const children = item.children
        ? mapTree(item.children as T[], iterator, {
          index,
          level: level + 1,
          useDfs,
          paths: [...paths, item],
          indexes: [...indexes, index],
        })
        : undefined;
      if (children) {
        item = { ...item, children };
      }
      item = (iterator(item, { index, level, paths, indexes: [...indexes] }) as unknown as T) ?? { ...item };
      return item as unknown as R;
    }

    item = (iterator(item, { index, level, paths, indexes: [...indexes] }) as unknown as T) ?? { ...item };
    if (item.children && item.children.length > 0) {
      item.children = mapTree(item.children as T[], iterator, {
        index,
        level: level + 1,
        useDfs,
        paths: [...paths, item],
        indexes: [...indexes, index],
      }) as unknown as T[];
    }
    return item as unknown as R;
  });
}
