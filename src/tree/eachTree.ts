import type { Iterator, TreeNode, TreeOptions } from './tree.type';

export type EachTreeIteratorRes = void | boolean | 'break' | 'continue';

export interface EachTreeOptions<T> extends TreeOptions<T> {
  /** 是否深度优先， 默认 false */
  useDfs?: boolean;
}

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
  options: EachTreeOptions<T> = {}
): void {
  if (!Array.isArray(tree)) {
    throw new Error('tree must be an array');
  }

  if (typeof iterator !== 'function') {
    throw new Error('iterator must be a function');
  }

  const {
    level = 1,
    paths = [],
    indexes = [],
    childrenKey = 'children',
    useDfs = false, // 修改默认值为 false
  } = options;

  // 广度优先遍历
  if (!useDfs) {
    const queue: Array<{
      nodes: T[];
      level: number;
      paths: T[];
      indexes: number[];
    }> = [
        {
          nodes: tree,
          level,
          paths,
          indexes,
        },
      ];

    while (queue.length) {
      const { nodes, level, paths, indexes } = queue.shift()!;

      for (let i = 0; i < nodes.length; i++) {
        const item = nodes[i];
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
          queue.push({
            nodes: children,
            level: level + 1,
            paths: [...paths, item],
            indexes: [...indexes, i],
          });
        }
      }
    }
    return;
  }

  // 深度优先遍历（原有逻辑）
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
