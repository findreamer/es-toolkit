import type { TreeNode } from './tree.type'


/**
 * 根据索引获取节点
 * @param tree 
 * @param idx 
 * @returns 
 */
export function getNodeByIndexes<T extends TreeNode>(tree: Array<T>, idx: number[] | number): T | null {
    const indexes = Array.isArray(idx) ? idx : [idx];

    const lastIndex = indexes.pop()!;
    let currentTree: Array<T> | null = tree;

    for (let i = 0, len = indexes.length; i < len; i++) {
        const index = indexes[i];
        if (!currentTree![index]) {
            currentTree = null;
            break;
        }
        currentTree = currentTree![index].children as any;
    }
    return currentTree ? currentTree[lastIndex] : null;
}