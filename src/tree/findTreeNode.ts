import { eachTree } from './eachTree';
import { everyTree } from './everyTree';
import type { BooleanType, Iterator, TreeNode, TreeOptions } from './tree.type';
import { isValidKey } from './utils';

// 功能说明：
// 查找节点：
// 如果传入的是一个函数（迭代器），该函数会被用来测试树中每个节点是否满足条件。如果找到满足条件的节点，函数会立即返回该节点。
// 如果传入的是一个包含查找选项的对象，函数会使用缓存来提高查找性能。
// 缓存机制：
// 函数会在第一次查找时初始化一个缓存，以便在后续查找中快速获取节点。缓存包括一个普通的 Map 和一个 WeakMap，用于存储节点及其相关选项。
// 副作用处理：
// 如果找到节点并且传入了副作用函数（effect），该函数会被调用，并传入找到的节点及其选项。

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
 * @param predicate - 用于测试树中每个节点的函数。
 * @param cacheOptions - 可选的缓存选项。
 * @returns 找到的第一个满足条件的节点，如果没有找到则返回 null。
 */

export function findTreeNode<T extends TreeNode>(tree: T[], predicate: Iterator<T, BooleanType | void>): T | null;
export function findTreeNode<T extends TreeNode>(tree: T[], options: FindTreeNodeOptions<T>): T | null;
export function findTreeNode<T extends TreeNode>(
  tree: T[],
  arg: Iterator<T, BooleanType | void> | FindTreeNodeOptions<T>
): T | null {
  if (typeof arg === 'function') {
    const predicate = arg;
    let foundNode: T | null = null;

    // 在找到节点后，直接返回 false 停止遍历，避免不必要的遍历。
    everyTree<T>(tree, (node, options) => {
      if (predicate(node, options)) {
        foundNode = node!;
        return false;
      }
      return true;
    });
    return foundNode;
  }

  // 使用缓存查找
  const { search, resolveCacheKey = 'id', effect } = arg;

  // 如果是第一次查找，初始化缓存
  if (tree !== treeCache.cachedTree && (!treeCache.nodeMap || !treeCache.weakNodeMap)) {
    const nodeMap: TreeCache<T>['nodeMap'] = new Map();
    const weakNodeMap: TreeCache<T>['weakNodeMap'] = new WeakMap();

    eachTree<T>(tree, (node, options) => {
      const cacheKey =
        typeof resolveCacheKey === 'string'
          ? node[resolveCacheKey]
          : typeof resolveCacheKey === 'function'
            ? resolveCacheKey(node, options)
            : (node?.id ?? node?.key ?? node);

      if (isValidKey(cacheKey)) {
        nodeMap.set(cacheKey, { nodeData: node!, nodeOptions: options! });
      } else {
        weakNodeMap.set(cacheKey, { nodeData: node!, nodeOptions: options! });
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
