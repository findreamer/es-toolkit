// export interface TreeItem {
//     children?: TreeItem[];
//     [property: string]: unknown;
// }

// /**
//  * 遍历选项
//  */
// export interface TreeOptions<T> {
//     /** 索引 从 1 开始 */
//     key?: number
//     /** 当前层级 从 1 开始 */
//     level?: number
//     /** 路径 */
//     paths?: Array<T>
//     /** 索引路径 */
//     indexes?: Array<number>
// }

// export interface Iterator<T extends TreeItem, R = void> {
//     (item?: T, options?: TreeOptions<T>): R;
// }

// export interface MapTreeOptions<T> extends TreeOptions<T> {
//     /** 是否深度优先， 默认 false */
//     depthFirst?: boolean
// }

// export function mapTree<T extends TreeItem>(tree: Array<T>, iterator: Iterator<T, T | void>, options: MapTreeOptions<T> = {}) {
//     const { level = 1, depthFirst = false, paths = [], indexes = [] } = options

//     return tree.map((item, index) => {

//         if (depthFirst) {
//             let children = item.children ? mapTree(item.children as Array<T>, iterator, { level: level + 1, depthFirst, paths: [...paths, item], indexes: [...indexes, index] }) : undefined;
//             children && (item = { ...item, children });
//             item = (iterator(item, { level, paths, indexes: [...indexes] }) as unknown as T) ?? { ...item };

//             return item;
//         }

//         item = (iterator(item, { level, paths, indexes: [...indexes] }) as unknown as T) ?? { ...item };

//         if (item.children && item.children.length > 0) {
//             item.children = mapTree(item.children as Array<T>, iterator, { level: level + 1, depthFirst, paths: [...paths, item], indexes: [...indexes, index] });
//         }
//         return item;
//     })

// }

export interface TreeItem {
    children?: Array<TreeItem>;
    [property: string]: any; // 使用 any 类型代替 unknown，如果可能，尽量使用更具体的类型
}

/**
 * 遍历选项
 */
export interface TreeOptions<T> {
    /** 索引 从 1 开始 */
    key?: number;
    /** 当前层级 从 1 开始 */
    level?: number;
    /** 路径 */
    paths?: Array<T>;
    /** 索引路径 */
    indexes?: Array<number>;
}

export interface Iterator<T extends TreeItem, R> {
    (item?: T, options?: TreeOptions<T>): R;
}

export interface MapTreeOptions<T> extends TreeOptions<T> {
    /** 是否深度优先， 默认 false */
    depthFirst?: boolean;
}

export function mapTree<T extends TreeItem, R>(tree: Array<T>, iterator: Iterator<T, R>, options: MapTreeOptions<T> = {}): Array<R> {
    const { level = 1, depthFirst = false, paths = [], indexes = [] } = options;

    return tree.map((item, index) => {
        if (depthFirst) {
            let children = item.children ? mapTree(item.children as Array<T>, iterator, { level: level + 1, depthFirst, paths: [...paths, item], indexes: [...indexes, index] }) : undefined;
            children && (item = { ...item, children });
            item = (iterator(item, { level, paths, indexes: [...indexes] }) as unknown as T) ?? { ...item };
            return item as unknown as R;
        }

        item = (iterator(item, { level, paths, indexes: [...indexes] }) as unknown as T) ?? { ...item };
        if (item.children && item.children.length > 0) {
            item.children = mapTree(item.children as Array<T>, iterator, { level: level + 1, depthFirst, paths: [...paths, item], indexes: [...indexes, index] }) as unknown as T[];
        }
        return item as unknown as R;
    })
}