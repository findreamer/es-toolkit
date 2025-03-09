import { everyTree } from '.';
import type { EveryTreeOptions } from './everyTree';
import type { Iterator, TreeNode } from './tree.type';

export interface FlattenTreeOptions<T, R> extends EveryTreeOptions<T> {
  /** 最大遍历深度 */
  maxDepth?: number;
  /** 节点转换函数 */
  transform?: Iterator<T, R>;
}

/**
 * 扁平化树结构为一维数组
 * @param treeNodes 树形数据
 * @param options 配置选项
 * @returns 扁平化后的数组
 */
export function flattenTree<T extends TreeNode, R = T>(
  treeNodes: T[],
  options: FlattenTreeOptions<T, R> = {}
): Array<T | R> {
  const { maxDepth = Infinity, transform, ...restOptions } = options;

  const flattenedNodes: Array<T | R> = [];

  everyTree(
    treeNodes,
    (currentNode, nodeInfo) => {
      // 收集节点
      flattenedNodes.push(transform ? transform(currentNode, nodeInfo) : currentNode);
      // 当前层级小于最大深度时继续遍历
      return nodeInfo.level < maxDepth;
    },
    restOptions
  );

  return flattenedNodes;
}
