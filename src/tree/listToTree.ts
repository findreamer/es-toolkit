import type { TreeNode } from './tree.type';
import { isValidKey } from './utils';

interface TreeNodeWithId extends TreeNode {
  id: number | string;
  parentId?: number | string;
}

export type ResolveKey<T> = null | ((item: T) => number | string | undefined | null);
/**
 * 将列表转换为树结构
 * @param items 一个包含 TreeNode 类型元素的数组
 * @param getId 一个可选的函数，用于从 TreeNode 中提取唯一标识。默认情况下，使用元素本身的 id 属性。
 * @param getParentId 一个可选的函数，用于从 TreeNode 中提取父节点的标识，默认情况下，请使用元素本身的 parentId 属性
 * @param transform 一个可选的函数，用于将 TreeNode 转换为另一种数据格式。默认情况下，不进行转换。
 */

export function listToTree<T extends TreeNodeWithId>(items: T[]): T[];
export function listToTree<T extends TreeNodeWithId>(items: T[], getId: ResolveKey<T>): T[];
export function listToTree<T extends TreeNodeWithId>(
  items: T[],
  getId?: ResolveKey<T>,
  getParentId?: ResolveKey<T>
): T[];
export function listToTree<T extends TreeNodeWithId, R extends TreeNodeWithId>(
  items: T[],
  getId?: ResolveKey<T>,
  getParentId?: ResolveKey<T>,
  transform?: (item: T) => R
): R[] {
  const nodeMap = new Map<number | string, T | R>();
  const tree: R[] = [];

  items.forEach(item => {
    const nodeId = getId ? getId(item) : item.id;
    const node = transform ? transform(item) : item;

    if (isValidKey(nodeId)) {
      nodeMap.set(nodeId, node);
    }

    const parentId = getParentId ? getParentId(item) : (item?.parentId ?? null);

    if (parentId == null || !isValidKey(parentId)) {
      tree.push(node as R);
    } else {
      const parentNode = nodeMap.get(parentId);
      if (parentNode) {
        (parentNode.children || (parentNode.children = [])).push(node as R);
      } else {
        tree.push(node as R);
      }
    }
  });

  return tree;
}
