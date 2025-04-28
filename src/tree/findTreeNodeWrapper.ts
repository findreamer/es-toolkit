import { findTreeNode, type FindTreeNodeOptions } from './findTreeNode';
import { type FindTreeNodeCacheOptions, findTreeNodeWithCache } from './findTreeNodeWithCache';
import type { TreeNode, TreeOptions } from './tree.type';

export interface FindTreeNodeWrapperOptions<T extends TreeNode> extends TreeOptions<T> {
  /** 是否使用缓存 */
  useCache?: boolean;
  /** 匹配到 node 执行副作用函数 */
  effect?: (node: T, options: Required<TreeOptions<T>>) => void;
}

// 重载签名：使用缓存时，传递两个参数，predicate 为 FindTreeNodeCacheOptions<T>
export function findTreeNodeWrapper<T extends TreeNode>(
  tree: T[],
  options: FindTreeNodeCacheOptions<T> & { useCache: true }
): T | null;

// 重载签名：使用缓存时，传递三个参数，predicate 可选
export function findTreeNodeWrapper<T extends TreeNode>(
  tree: T[],
  predicate: (node: T, options: Required<TreeOptions<T>>) => boolean,
  options: FindTreeNodeCacheOptions<T> & { useCache: true }
): T | null;

// 重载签名：不使用缓存时，predicate 必填
export function findTreeNodeWrapper<T extends TreeNode>(
  tree: T[],
  predicate: (node: T, options: Required<TreeOptions<T>>) => boolean,
  options?: (FindTreeNodeOptions<T> & { useCache?: false }) | undefined
): T | null;

// 实现签名
export function findTreeNodeWrapper<T extends TreeNode>(
  tree: T[],
  predicateOrOptions?:
    | ((node: T, options: Required<TreeOptions<T>>) => boolean)
    | (FindTreeNodeCacheOptions<T> & { useCache: true }),
  options?: FindTreeNodeWrapperOptions<T>
): T | null {
  if (typeof predicateOrOptions === 'object' && predicateOrOptions.useCache) {
    return findTreeNodeWithCache(tree, predicateOrOptions);
  }

  const predicate = typeof predicateOrOptions === 'function' ? predicateOrOptions : undefined;
  if (options?.useCache) {
    const { useCache, ...cacheOptions } = options as FindTreeNodeCacheOptions<T> & { useCache: true };
    return findTreeNodeWithCache(tree, {
      ...cacheOptions,
      search: cacheOptions.search,
      resolveCacheKey: cacheOptions.resolveCacheKey,
      effect: cacheOptions.effect,
    });
  }

  if (!predicate) {
    throw new Error('predicate 参数在不使用缓存时是必填的');
  }

  const { useCache, ...normalOptions } = options || {};
  return findTreeNode(tree, predicate, normalOptions);
}
