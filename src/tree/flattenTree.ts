import { everyTree } from '.';
import type { Iterator, TreeNode } from './tree.type';

/**
 * 扁平化树结构为一维数组
 * @param treeNodes 树形数据
 * @param depthOrTransformer 遍历深度或节点转换函数
 * @param nodeTransformer 节点转换函数
 * @returns 扁平化后的数组
 */
export function flattenTree<T extends TreeNode>(treeNodes: T[]): T[];
export function flattenTree<T extends TreeNode>(treeNodes: T[], maxDepth: number): T[];
export function flattenTree<T extends TreeNode, R>(treeNodes: T[], nodeTransformer: Iterator<T, R>): R[];
export function flattenTree<T extends TreeNode, R>(
  treeNodes: T[],
  maxDepth: number,
  nodeTransformer: Iterator<T, R>
): R[];
export function flattenTree<T extends TreeNode, R>(
  treeNodes: T[],
  depthOrTransformer?: number | Iterator<T, R>,
  nodeTransformer?: Iterator<T, R>
): Array<T | R> {
  const flattenedNodes: Array<T | R> = [];

  // 解析参数
  const maxDepth = typeof depthOrTransformer === 'number' ? depthOrTransformer : Infinity;
  const transformNode = typeof depthOrTransformer === 'function' ? depthOrTransformer : nodeTransformer;

  everyTree(treeNodes, (currentNode, nodeInfo) => {
    // 收集节点
    flattenedNodes.push(transformNode ? transformNode(currentNode, nodeInfo) : currentNode);

    // 当前层级小于最大深度时继续遍历
    return nodeInfo.level < maxDepth;
  });

  return flattenedNodes;
}

// 使用示例：
const tree = [
  {
    id: '1',
    children: [
      {
        id: '1-1',
        children: [{ id: '1-1-1' }],
      },
    ],
  },
];

// 基础用法
const result1 = flattenTree(tree);
// 结果: [{ id: '1' }, { id: '1-1' }, { id: '1-1-1' }]

// 指定层级为2，只展平两层
const result2 = flattenTree(tree, 2);
// 结果: [{ id: '1' }, { id: '1-1' }]

// 使用转换函数
const result3 = flattenTree(tree, node => node.id);
// 结果: ['1', '1-1', '1-1-1']

// 同时指定层级和转换函数
const result4 = flattenTree(tree, 2, node => node.id);
// 结果: ['1', '1-1']
