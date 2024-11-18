import type { TreeNode, TreeOptions, Iterator } from './tree.type'

export interface StackNode<T> extends Required<TreeOptions<T>> {
    item: T | null;
}

/**
 * 判断树中每个节点是否满足某个条件。
 * @param tree 数组
 * @param iterator Iterator 迭代函数
 * @returns boolean
 */
export function everyTree<T extends TreeNode>(tree: Array<T>, iterator: Iterator<T, boolean>): boolean {
    const stack: Array<StackNode<T>> = [];
    stack.push({ item: null, index: -1, level: 1, paths: [], indexes: [] });
    while (stack.length > 0) {
        const { item, index, level, paths, indexes } = stack.pop()!;

        if (index >= 0) {
            const value = iterator(item!, { index, level, paths, indexes });

            if (value && Array.isArray(item?.children) && item!.children.length > 0) {
                let children = item!.children;
                for (let i = children.length - 1; i >= 0; i--) {
                    stack.push({ item: children[i] as T, index: i, level: level + 1, paths: [...paths, item!], indexes: [...indexes, i] });
                }
            } else if (!value) {
                return false;
            }
        } else {
            if (!Array.isArray(tree)) {
                return false
            }

            for (let i = tree.length - 1; i >= 0; i--) {
                stack.push({ item: tree[i] as T, index: i, level: level + 1, paths: [...paths, item!], indexes: [...indexes, i] });
            }
        }
    }
    return true
}