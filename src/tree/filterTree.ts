import type { TreeNode, Iterator, TreeOptions } from './tree.type'

export interface FilterTreeOptions<T> extends TreeOptions<T> {
    /** 是否深度优先， 默认 false */
    useDfs?: boolean;
}

/**
 * 通过迭代器过滤树。
 * @param tree 
 * @param iterator 
 * @param options 
 * @returns 
 */
export function filterTree<T extends TreeNode>(tree: Array<T>, iterator: Iterator<T, boolean>, options: FilterTreeOptions<T> = {}): Array<T> {
    const { level = 1, paths = [], useDfs = false, indexes = [] } = options;

    if (useDfs) {
        return tree.map((item, index) => {
            let children = item.children ? filterTree(item.children as Array<T>, iterator, { index, level: level + 1, useDfs, paths: [...paths, item], indexes: [...indexes, index] }) : undefined;

            if (Array.isArray(children) && Array.isArray(item.children)) {
                item = { ...item, children: children };
            }
            return item as T;
        }).filter((item, idx) => iterator(item, { index: idx, level, paths, indexes: [...indexes] }))
    }

    return tree
        .filter((item, index) => iterator(item, { index, level, paths, indexes: [...indexes] }))
        .map((item, index) => {
            if (item.children?.splice) {
                let children = filterTree(
                    item.children as Array<T>,
                    iterator,
                    { index: indexes[index], level: level + 1, useDfs, paths: [...paths, item], indexes: [...indexes, index] }
                );

                if (Array.isArray(children) && Array.isArray(item.children)) {
                    item = { ...item, children: children };
                }
            }
            return item as T;
        });
}