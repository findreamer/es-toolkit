import type { TreeNode, TreeOptions, Iterator } from './tree.type'

export type EachTreeIteratorRes = void | boolean | 'break' | 'continue';

/**
 * 遍历树
 * @param tree 数组
 * @param iterator 
 * @param options 
 * @returns 
 */
export function eachTree<T extends TreeNode>(tree: Array<T>, iterator: Iterator<T, EachTreeIteratorRes>, options: TreeOptions<T> = {}): void {
    const { level = 1, paths = [], indexes = [] } = options;

    const length = tree.length;
    for (let i = 0; i < length; i++) {
        const item = tree[i];
        const res = iterator(item, { index: i, level, paths, indexes: [...indexes, i] });

        if (res === 'break') {
            return;
        } else if (res === 'continue') {
            continue;
        }

        if (Array.isArray(item.children) && item.children.length > 0) {
            eachTree(item.children as Array<T>, iterator, { index: i, level: level + 1, paths: [...paths, item], indexes: [...indexes, i] });
        }
    }

}
