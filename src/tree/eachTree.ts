import type { Iterator, TreeNode, TreeOptions } from './tree.type';

export type EachTreeIteratorRes = void | boolean | 'break' | 'continue';

/**
 * 遍历树
 * @param tree 数组
 * @param iterator 迭代器函数
 * @param options 遍历选项
 * @returns void
 */

export function eachTree<T extends TreeNode>(
  tree: T[],
  iterator: Iterator<T, EachTreeIteratorRes>,
  options: TreeOptions<T> = {}
): void {
  if (!Array.isArray(tree)) {
    throw new Error('tree must be an array');
  }

  if (typeof iterator !== 'function') {
    throw new Error('iterator must be a function');
  }

  const { level = 1, paths = [], indexes = [], childrenKey = 'children' } = options;

  const length = tree.length;
  for (let i = 0; i < length; i++) {
    const item = tree[i];
    const res = iterator(item, {
      index: i,
      level,
      paths: [...paths, item],
      indexes: [...indexes, i],
      childrenKey,
    });

    if (res === 'break') {
      return;
    } else if (res === 'continue') {
      continue;
    }

    const children = item?.[childrenKey] as T[];
    if (Array.isArray(children) && children.length > 0) {
      eachTree(children, iterator, {
        index: i,
        level: level + 1,
        paths: [...paths, item],
        indexes: [...indexes, i],
        childrenKey,
      });
    }
  }
}
