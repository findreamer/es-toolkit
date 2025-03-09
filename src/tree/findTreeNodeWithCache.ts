import { eachTree } from './eachTree';
import type { TreeNode, TreeOptions } from './tree.type';
import { isValidKey } from './utils';

/** 启用缓存 new Map(), 多次重复从一棵树中查找时可大幅提升性能 */
export type FindTreeNodeOptions<T extends TreeNode> = {
  /** 从缓存 Map 中查找的key，使用 Map.get(value) 匹配 */
  search: number | string | T | object;
  /** 构建 Map 时，用户自定义缓存 key 的处理函数，如果不传，则默认取迭代对象的 id */
  resolveCacheKey?: string | ((node: T, options: Required<TreeOptions<T>>) => string | number | object);
  /** 匹配到 node 执行副作用函数 */
  effect?: (node: T, options: Required<TreeOptions<T>>) => void;
};

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
 * 在树中查找满足条件的节点。
 * @param tree - 要搜索的树。
 * @param options - 查找选项。
 * @returns 找到的第一个满足条件的节点，如果没有找到则返回 null。
 */

export function findTreeNodeWithCache<T extends TreeNode>(tree: T[], options: FindTreeNodeOptions<T>): T | null {
  // 使用缓存查找
  const { search, resolveCacheKey = 'id', effect } = options;

  // 如果是第一次查找，初始化缓存
  if (tree !== treeCache.cachedTree && (!treeCache.nodeMap || !treeCache.weakNodeMap)) {
    const nodeMap: TreeCache<T>['nodeMap'] = new Map();
    const weakNodeMap: TreeCache<T>['weakNodeMap'] = new WeakMap();

    eachTree<T>(tree, (node, opts) => {
      const cacheKey =
        typeof resolveCacheKey === 'string'
          ? node[resolveCacheKey]
          : typeof resolveCacheKey === 'function'
            ? resolveCacheKey(node, opts)
            : (node?.id ?? node?.key ?? node);

      if (isValidKey(cacheKey)) {
        nodeMap.set(cacheKey, { nodeData: node!, nodeOptions: opts! });
      } else {
        weakNodeMap.set(cacheKey, { nodeData: node!, nodeOptions: opts! });
      }
    });

    treeCache.cachedTree = tree;
    treeCache.nodeMap = nodeMap;
    treeCache.weakNodeMap = weakNodeMap;
  }

  // 从缓存中查找结果
  const cachedNode = isValidKey(search) ? treeCache.nodeMap?.get(search) : treeCache.weakNodeMap?.get(search);

  if (cachedNode != null && effect) {
    const { nodeData, nodeOptions } = cachedNode;
    effect(nodeData, nodeOptions);
    return nodeData;
  }

  return null;
}

/** 获取缓存对象 */

export function getTreeCache<T>(): Readonly<TreeCache<T>> {
  return Object.freeze(treeCache);
}

export function clearTreeCache() {
  treeCache.cachedTree = null;
  treeCache.nodeMap = null;
  treeCache.weakNodeMap = null;
}
