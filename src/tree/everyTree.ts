import type { Iterator, TreeNode, TreeOptions } from './tree.type';

export interface StackNode<T> extends Required<TreeOptions<T>> {
  item: T | null;
}

/**
 * 判断树中每个节点是否满足某个条件。
 * @param tree 数组
 * @param iterator Iterator 迭代函数
 * @param options
 * @returns boolean
 */
export function everyTree<T extends TreeNode>(
  tree: T[],
  iterator: Iterator<T, boolean>,
  options: TreeOptions<T> = {}
): boolean {
  if (!Array.isArray(tree)) {
    return false;
  }

  if (tree.length === 0) {
    return true;
  }

  const { childrenKey = 'children' } = options;
  const stack: Array<StackNode<T>> = [];
  stack.push({ item: null, index: -1, level: 0, paths: [], indexes: [], childrenKey });

  while (stack.length > 0) {
    const { item, index, level, paths, indexes } = stack.pop()!;

    if (index >= 0) {
      const value = iterator(item!, { index, level, paths, indexes, childrenKey });

      if (!value) {
        return false;
      }

      const children = item?.[childrenKey] as T[];
      if (Array.isArray(children) && children.length > 0) {
        for (let i = children.length - 1; i >= 0; i--) {
          stack.push({
            item: children[i],
            index: i,
            level: level + 1,
            paths: [...paths, item!],
            indexes: [...indexes, i],
            childrenKey,
          });
        }
      }
    } else {
      for (let i = tree.length - 1; i >= 0; i--) {
        stack.push({
          item: tree[i],
          index: i,
          level: level + 1,
          paths: [tree[i]],
          indexes: [i],
          childrenKey,
        });
      }
    }
  }

  return true;
}
