import type { TreeItem, TreeOptions, Iterator } from './tree.type'

export interface StackNode<T> extends Required<TreeOptions<T>> {
    item: T | null;
}

/**
 * 遍历树, 测试所有节点是否通过 iterator 函数的测试，通过则返回 true，否则返回 false
 * @param tree 数组
 * @param iterator Iterator 迭代函数
 * @param options TreeOptions
 * @returns boolean
 */
export function everyTree<T extends TreeItem>(tree: Array<T>, iterator: Iterator<T, boolean>, options: TreeOptions<T> = {}): boolean {
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