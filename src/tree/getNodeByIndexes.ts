import type { TreeNode } from './tree.type';

/**
 * 根据索引获取节点
 * @param tree 树形数据
 * @param indexes 索引数组或单个索引
 * @returns 对应的节点或 null
 */
export function getNodeByIndexes<T extends TreeNode>(tree: T[], indexes: number[] | number): T | null {
  const indexArray = Array.isArray(indexes) ? indexes : [indexes];

  const lastIndex = indexArray.pop()!;
  let currentNodes: T[] | null = tree;

  for (let i = 0, len = indexArray.length; i < len; i++) {
    const index = indexArray[i];
    if (!currentNodes![index]) {
      currentNodes = null;
      break;
    }
    currentNodes = currentNodes![index].children as any;
  }
  return currentNodes ? currentNodes[lastIndex] : null;
}
