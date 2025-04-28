import type { Iterator, TreeNode, TreeOptions } from './tree.type';
import { isIterable } from './utils';

export type EachTreeNodeIteratorRes = void | boolean | 'break' | 'continue';

export interface EachTreeNodeOptions<T> extends TreeOptions<T> {
  /** 是否使用深度优先遍历，默认为 false  */
  useDfs?: boolean;
}

type QueueProps<T> = Array<{
  nodes: T[];
  level: number;
  paths: T[];
  indexes: number[];
}>;
/**
 * 遍历树
 * @param tree 数组
 * @param iterator 迭代器函数
 * @param options 遍历选项
 * @returns void
 */

export function eachTreeNode<T extends TreeNode>(
  tree: T[],
  iterator: Iterator<T, EachTreeNodeIteratorRes>,
  options: EachTreeNodeOptions<T> = {}
): void {
  if (!Array.isArray(tree)) {
    throw new Error('tree must be an array');
  }

  if (typeof iterator !== 'function') {
    throw new Error('iterator must be a function');
  }

  // 抽离 children 通用处理逻辑
  function traverseChildren<U extends T>(
    nodes: U[],
    iterator2: Iterator<U, EachTreeNodeIteratorRes>,
    options: Required<EachTreeNodeOptions<U>>,
    queue?: QueueProps<U>
  ) {
    const { paths, level, indexes, useDfs, childrenKey } = options;
    for (let i = 0; i < nodes.length; i++) {
      const item = nodes[i];
      const res = iterator2(item, {
        index: i,
        level,
        paths: [...paths, item],
        indexes: [...indexes, i],
        childrenKey,
      });

      if (res === 'break') {
        break;
      }

      if (res === 'continue') {
        continue;
      }

      const children = item?.[childrenKey] as U[];
      if (isIterable(children) && children.length > 0) {
        if (useDfs) {
          eachTreeNode(children, iterator, {
            index: i,
            level: level + 1,
            paths: [...paths, item],
            indexes: [...indexes, i],
            childrenKey,
          });
        } else {
          queue?.push({
            nodes: children,
            level: level + 1,
            paths: [...paths, item],
            indexes: [...indexes, i],
          });
        }
      }
    }
  }

  const { index = 0, level = 1, paths = [], indexes = [], childrenKey = 'children', useDfs = false } = options;

  // 广度优先遍历
  if (!useDfs) {
    const queue: QueueProps<T> = [
      {
        nodes: tree,
        level,
        paths,
        indexes,
      },
    ];

    while (queue.length) {
      const { nodes, level, paths, indexes } = queue.shift()!;
      traverseChildren<T>(nodes, iterator, { index, level, paths, indexes, childrenKey, useDfs }, queue);
    }
    return;
  }

  // 深度优先遍历
  traverseChildren(tree, iterator, {
    index,
    level,
    paths,
    indexes,
    childrenKey,
    useDfs,
  });
}
