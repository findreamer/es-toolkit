import type { Iterator, TreeNode, TreeOptions } from './tree.type';
import { isIterable } from './utils';

export interface EveryTreeNodeOptions<T> extends TreeOptions<T> {
  /** 是否使用深度优先遍历，默认为 false */
  useDfs?: boolean;
}

export interface StackNode<T> extends Required<TreeOptions<T>> {
  item: T | null;
}

/**
 * 判断树中每个节点是否满足某个条件
 * @param tree 数组
 * @param iterator Iterator 迭代函数
 * @param options 遍历选项
 * @returns boolean
 */
export function everyTreeNode<T extends TreeNode>(
  tree: T[],
  iterator: Iterator<T, boolean>,
  options: EveryTreeNodeOptions<T> = {}
): boolean {
  if (!Array.isArray(tree)) {
    return false;
  }

  if (tree.length === 0) {
    return true;
  }

  const { childrenKey = 'children', useDfs = false } = options;

  // 初始化遍历队列/栈
  const container: Array<StackNode<T>> = [];
  container.push({
    item: null,
    index: -1,
    level: 0,
    paths: [],
    indexes: [],
    childrenKey,
  });

  // 处理当前节点的函数
  const processNode = (node: StackNode<T>): boolean => {
    const { item, index, level, paths, indexes } = node;
    if (index < 0) {
      return true;
    }

    return iterator(item!, {
      index,
      level,
      paths,
      indexes,
      childrenKey,
    });
  };

  // 添加节点到容器的通用函数
  const addNodesToContainer = (nodes: T[], baseLevel: number, basePaths: T[] = [], baseIndexes: number[] = []) => {
    const len = nodes.length;
    for (let i = 0; i < len; i++) {
      // 如果是DFS，从后往前遍历。
      // 如果是BFS，从前向后遍历
      const idx = useDfs ? len - 1 - i : i;
      const node = nodes[idx];
      container.push({
        item: node,
        index: idx,
        level: baseLevel,
        paths: [...basePaths, node],
        indexes: [...baseIndexes, idx],
        childrenKey,
      });
    }
  };

  // 添加子节点到容器
  const addChildrenToContainer = (node: StackNode<T>) => {
    const { item, level, paths, indexes } = node;
    const children = item?.[childrenKey] as T[];

    if (!isIterable(children) || children.length === 0) {
      return;
    }

    addNodesToContainer(children, level + 1, paths, indexes);
  };

  while (container.length > 0) {
    // DFS下的执行逻辑：从容器中取出最后一个节点进行处理，如果节点有子节点，则将子节点从后往前添加到容器中。
    // BFS下的执行逻辑：从容器中取出第一个节点进行处理，如果节点有子节点，则将子节点从前向后添加到容器中。
    const currentNode = useDfs ? container.pop()! : container.shift()!;

    if (currentNode.index >= 0) {
      if (!processNode(currentNode)) {
        return false;
      }
      addChildrenToContainer(currentNode);
    } else {
      addNodesToContainer(tree, 1);
    }
  }

  return true;
}
