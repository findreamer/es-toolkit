import { eachTree } from './eachTree';
import type { Iterator, TreeNode, TreeOptions } from './tree.type';

export interface FindTreeNodeOptions<T> extends TreeOptions<T> {
  /** 缓存的键 */
  searchKey: string;
  /** 自定义缓存键的处理函数 */
  resolveCacheKey?: string | (() => string);
}

/**
 * 函数重载
 * @param tree
 * @param filter
 */
export function findTreeNode<T extends TreeNode>(
  tree: T[],
  filter: (item: T, options: Required<TreeOptions<T>>) => boolean
): T | null;

export function findTreeNode<T extends TreeNode>(tree: T[], options: FindTreeNodeOptions<T>): T | null;

/**
 * 查找树节点
 * @param tree
 * @param arg
 */
export function findTreeNode<T extends TreeNode>(
  tree: T[],
  arg: ((item: T, options: Required<TreeOptions<T>>) => boolean) | FindTreeNodeOptions<T>
): T | null {
  const cache = new Map<string, T>(); // 缓存

  // 如果第二个参数是函数，使用过滤函数查找
  if (typeof arg === 'function') {
    const filter = arg;
    for (const item of tree) {
      const res = filter(item, { index: 0, level: 1, paths: [item], indexes: [0], childrenKey: 'children' });
      if (res) {
        return item; // 找到节点，立即返回
      }
    }
    return null; // 未找到
  }

  // 如果第二个参数是配置对象，启用缓存
  const { searchKey, resolveCacheKey } = arg;

  eachTree(tree, (item, options) => {
    const key = typeof resolveCacheKey === 'function' ? resolveCacheKey() : item[searchKey];
    if (key) {
      cache.set(key, item); // 存入缓存
    }
  });

  // 从缓存中查找节点
  for (const [key, value] of cache.entries()) {
    if (key === searchKey) {
      return value; // 找到节点，返回
    }
  }

  return null; // 未找到
}
