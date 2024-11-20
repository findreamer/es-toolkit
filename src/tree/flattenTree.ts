import { eachTree } from '.';
import type { Iterator, TreeNode } from './tree.type';

/**
 * 扁平化树，将树打平变成一维数组，可以传入第二个参数实现打平节点中的其他属性
 * @param tree 树形数据
 * @param iterator 迭代器函数，用于处理每个节点
 * @returns 扁平化后的数组
 */
export function flattenTree<T extends TreeNode>(tree: T[]): T[];
export function flattenTree<T extends TreeNode, R>(tree: T[], iterator: Iterator<T, R>): R[];
export function flattenTree<T extends TreeNode, R>(tree: T[], iterator?: Iterator<T, R>): R[] {
  const flattenedArray: any[] = [];
  eachTree(tree, (node, options) => {
    flattenedArray.push(iterator?.(node, options) ?? node);
  });
  return flattenedArray;
}
