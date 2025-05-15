import {
  findTreeNode as findTreeNodeWithoutCache,
  type FindTreeNodeOptions as FindTreeNormalNodeOptions,
} from './findTreeNode';
import { type FindTreeNodeCacheOptions, findTreeNodeWithCache } from './findTreeNodeWithCache';
import type { BooleanType, Iterator, TreeNode, TreeOptions } from './tree.type';

export interface FindTreeNodeOptions<T extends TreeNode> extends TreeOptions<T> {
  /** 匹配到 node 执行副作用函数 */
  effect?: (node: T, options: Required<TreeOptions<T>>) => void;
}

// 使用缓存时，传递2个参数，predicate 为 FindTreeNodeCacheOptions<T>
export function findTreeNode<T extends TreeNode>(tree: T[], options: FindTreeNodeCacheOptions<T>): T | null;
// 使用缓存时，传递3个参数，predicate 可选
export function findTreeNode<T extends TreeNode>(
  tree: T[],
  predicate: Iterator<T, BooleanType>,
  options: FindTreeNodeCacheOptions<T>
): T | null;
// 不使用缓存，predicate 必填
export function findTreeNode<T extends TreeNode>(
  tree: T[],
  predicate: Iterator<T, BooleanType>,
  options?: FindTreeNormalNodeOptions<T> | undefined
): T | null;
// 实现函数
export function findTreeNode<T extends TreeNode>(
  tree: T[],
  predicateOrOptions: Iterator<T, BooleanType> | FindTreeNodeCacheOptions<T>,
  options?: FindTreeNormalNodeOptions<T>
): T | null {
  if (typeof predicateOrOptions === 'object') {
    return findTreeNodeWithCache(tree, predicateOrOptions);
  }

  const predicate = typeof predicateOrOptions === 'function' ? predicateOrOptions : undefined;
  if (options && ('search' in options || 'resolveCacheKey' in options)) {
    return findTreeNodeWithCache(tree, options as FindTreeNodeCacheOptions<T>);
  }

  if (!predicate) {
    throw new Error('predicate canshu 在不使用缓存时是必填的！');
  }

  return findTreeNodeWithoutCache(tree, predicate, options);
}
