import { eachTree } from './eachTree';
import { everyTree } from './everyTree';
import type { BooleanType, Iterator, TreeNode, TreeOptions } from './tree.type';
import { isValidKey } from './utils';

/** 启用缓存 new Map(), 多次重复从一棵树中查找时可大幅提升性能 */
export type CacheOptions<T extends TreeNode> = {
  /** 从缓存 Map 中查找的key，使用 Map.get(value) 匹配 */
  cacheKey: number | string | T | object;
  /** 构建 Map 时，用户自定义缓存 key 的处理函数，如果不传，则默认取迭代对象的 id */
  resolveCacheKey?: (node: T, options: Required<TreeOptions<T>>) => string | number | object;
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
 * @param predicate - 用于测试树中每个节点的函数。
 * @param cacheOptions - 可选的缓存选项。
 * @returns 找到的第一个满足条件的节点，如果没有找到则返回 null。
 */

export function findTreeNode<T extends TreeNode>(
  tree: T[],
  predicate: Iterator<T, BooleanType | void>,
  cacheOptions?: CacheOptions<T>
): T | null {
  // 缓存优化
  if (cacheOptions && cacheOptions.cacheKey) {
    const { resolveCacheKey, cacheKey, effect } = cacheOptions;

    // 如果是第一次查找，初始化缓存
    if (tree !== treeCache.cachedTree && (!treeCache.nodeMap || !treeCache.weakNodeMap)) {
      const nodeMap: TreeCache<T>['nodeMap'] = new Map();
      const weakNodeMap: TreeCache<T>['weakNodeMap'] = new WeakMap();

      eachTree<T>(tree, (node, opts) => {
        const mapKey = resolveCacheKey ? resolveCacheKey(node!, opts!) : (node?.id ?? node?.key ?? node);

        if (isValidKey(mapKey)) {
          nodeMap.set(mapKey, { nodeData: node!, nodeOptions: opts! });
        } else if (typeof mapKey === 'object') {
          weakNodeMap.set(mapKey, { nodeData: node!, nodeOptions: opts! });
        }
      });
      treeCache.cachedTree = tree;
      treeCache.nodeMap = nodeMap;
      treeCache.weakNodeMap = weakNodeMap;
    }

    // 从缓存结果中查找
    const cachedNode = isValidKey(cacheKey) ? treeCache.nodeMap!.get(cacheKey) : treeCache.weakNodeMap!.get(cacheKey);
    if (cachedNode != null) {
      const { nodeData, nodeOptions } = cachedNode;

      if (!predicate(nodeData, nodeOptions)) {
        return null;
      }

      if (effect) {
        effect(nodeData, nodeOptions);
      }

      return nodeData;
    }
  }

  // 如果没有启用缓存或缓存未命中，使用遍历查找
  let foundNode: T | null = null;
  everyTree<T>(tree, (node, options) => {
    if (predicate(node, options)) {
      foundNode = node!;
      return false;
    }
    return true;
  });

  return foundNode;
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
