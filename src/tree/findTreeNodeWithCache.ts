import { eachTreeNode, type EachTreeNodeOptions } from './eachTreeNode';
import type { TreeNode, TreeOptions } from './tree.type';
import { isValidKey } from './utils';

/** 启用缓存 new Map(), 多次重复从一棵树中查找时可大幅提升性能 */
export interface FindTreeNodeCacheOptions<T extends TreeNode> extends EachTreeNodeOptions<T> {
  /** 从缓存 Map 中查找的key，使用 Map.get(value) 匹配 */
  search: number | string | T | object;

  /** 构建 Map 时，用户自定义缓存 key 的处理函数，如果不传，则默认取迭代对象的 id */
  resolveCacheKey?: string | ((node: T, options: Required<TreeOptions<T>>) => string | number | object);

  /** 匹配到 node 执行副作用函数 */
  effect?: (node: T, options: Required<TreeOptions<T>>) => void;
}

export interface TreeCache<T> {
  cachedTree: any | null;
  nodeMap: Map<string | number, { nodeData: T; nodeOptions: Required<TreeOptions<T>> }> | null;
  weakNodeMap: WeakMap<any, { nodeData: T; nodeOptions: Required<TreeOptions<T>> }> | null;
}

const treeCache: TreeCache<any> = {
  cachedTree: null,
  nodeMap: null,
  weakNodeMap: null,
};

/**
 * 树型结构中查找节点的高性能缓存工具函数。
 * @param tree - 要搜索的树。
 * @param options - 可选的缓存选项。
 * @returns 找到满足条件的节点
 */

export function findTreeNodeWithCache<T extends TreeNode>(tree: T[], options: FindTreeNodeCacheOptions<T>): T | null {
  // 使用缓存查找
  const { search, resolveCacheKey, effect } = options;

  // 如果是第一次查找，初始化缓存
  if (tree !== treeCache.cachedTree) {
    const nodeMap: TreeCache<T>['nodeMap'] = new Map();
    const weakNodeMap: TreeCache<T>['weakNodeMap'] = new WeakMap();

    eachTreeNode<T>(
      tree,
      (node, opts) => {
        const cacheKey =
          typeof resolveCacheKey === 'string'
            ? node[resolveCacheKey]
            : typeof resolveCacheKey === 'function'
              ? resolveCacheKey(node, opts)
              : (node['id'] ?? node['key'] ?? node);

        if (!cacheKey) {
          return;
        }

        if (isValidKey(cacheKey)) {
          nodeMap.set(cacheKey, { nodeData: node!, nodeOptions: opts! });
        } else {
          weakNodeMap.set(cacheKey, { nodeData: node!, nodeOptions: opts! });
        }
      },
      options
    );

    treeCache.cachedTree = tree;
    treeCache.nodeMap = nodeMap;
    treeCache.weakNodeMap = weakNodeMap;
  }

  // 从缓存中查找结果
  const cachedNode = search
    ? isValidKey(search)
      ? treeCache.nodeMap?.get(search)
      : treeCache.weakNodeMap?.get(search)
    : null;

  if (cachedNode != null) {
    const { nodeData, nodeOptions } = cachedNode;
    if (effect) {
      effect(nodeData, nodeOptions);
    }
    return nodeData;
  }

  return null;
}

/** 获取缓存对象 */

export function getTreeCache<T>(): Readonly<TreeCache<T>> {
  return Object.freeze({ ...treeCache });
}

export function clearTreeCache() {
  treeCache.cachedTree = null;
  treeCache.nodeMap = null;
  treeCache.weakNodeMap = null;
}
