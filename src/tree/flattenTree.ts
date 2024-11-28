import { eachTree } from '.';
import type { Iterator, TreeNode, TreeOptions } from './tree.type';

/**
 * 扁平化树，将树打平变成一维数组，可以传入第二个参数实现打平节点中的其他属性
 * @param tree 树形数据
 * @param transformFn 迭代器函数，用于处理每个节点
 * @returns 扁平化后的数组
 */

export function flattenTree<T extends TreeNode>(tree: T[], options?: TreeOptions<T>): T[];
export function flattenTree<T extends TreeNode, R>(
  tree: T[],
  transformFn: Iterator<T, R>,
  options?: TreeOptions<T>
): R[];
export function flattenTree<T extends TreeNode, R>(
  tree: T[],
  transformFn?: Iterator<T, R> | TreeOptions<T>,
  options?: TreeOptions<T>
): R[] {
  const resultArray: any[] = [];
  const opts = typeof transformFn === 'function' ? options : transformFn;
  const fn = typeof transformFn === 'function' ? transformFn : undefined;

  eachTree(
    tree,
    (node, treeOptions) => {
      resultArray.push(fn?.(node, treeOptions) ?? node);
    },
    opts
  );

  return resultArray;
}
