import type { TreeNode, TreeOptions, Iterator } from './tree.type'

export interface MapTreeOptions<T> extends TreeOptions<T> {
    /** 是否深度优先， 默认 false */
    useDfs?: boolean;
}

export function mapTree<T extends TreeNode, R>(tree: Array<T>, iterator: Iterator<T, R>, options: MapTreeOptions<T> = {}): Array<R> {
    const { level = 1, useDfs = false, paths = [], indexes = [] } = options;

    return tree.map((item, index) => {
        if (useDfs) {
            let children = item.children ? mapTree(item.children as Array<T>, iterator, { index, level: level + 1, useDfs, paths: [...paths, item], indexes: [...indexes, index] }) : undefined;
            children && (item = { ...item, children });
            item = (iterator(item, { index, level, paths, indexes: [...indexes] }) as unknown as T) ?? { ...item };
            return item as unknown as R;
        }

        item = (iterator(item, { index, level, paths, indexes: [...indexes] }) as unknown as T) ?? { ...item };
        if (item.children && item.children.length > 0) {
            item.children = mapTree(item.children as Array<T>, iterator, { index, level: level + 1, useDfs, paths: [...paths, item], indexes: [...indexes, index] }) as unknown as T[];
        }
        return item as unknown as R;
    })
}