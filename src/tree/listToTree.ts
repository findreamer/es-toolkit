import type { TreeNode } from './tree.type';
import { isValidKey } from './utils';

interface TreeNodeWithId extends TreeNode {
  id: number | string;
  parentId?: number | string;
}

export type KeyResolver<T> = string | ((item: T) => number | string | undefined | null);
export type TransformFn<T, R> = (item: T) => R;

export function listToTree<T extends TreeNodeWithId, R extends TreeNodeWithId = T>(
  items: T[],
  options?: {
    idKey?: KeyResolver<T>;
    parentKey?: KeyResolver<T>;
    transform?: TransformFn<T, R>;
  }
): R[] {
  const { idKey = 'id', parentKey = 'parentId', transform } = options || {};

  const resolveKey = (item: T, resolver: KeyResolver<T>) => {
    if (typeof resolver === 'function') {
      return resolver(item);
    }
    return (item as any)[resolver];
  };

  const nodeMap = new Map<number | string, T | R>();
  const tree: R[] = [];

  items.forEach(item => {
    const nodeId = resolveKey(item, idKey);
    const node = transform ? transform(item) : (item as unknown as R);

    if (isValidKey(nodeId)) {
      nodeMap.set(nodeId, node);
    }

    const parentId = resolveKey(item, parentKey);

    if (parentId == null || !isValidKey(parentId)) {
      tree.push(node);
    } else {
      const parentNode = nodeMap.get(parentId);
      if (parentNode) {
        (parentNode.children || (parentNode.children = [])).push(node);
      } else {
        tree.push(node);
      }
    }
  });

  return tree;
}
