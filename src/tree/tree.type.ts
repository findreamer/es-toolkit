export interface TreeItem {
    children?: Array<TreeItem>;
    [property: string]: unknown;
}

/**
 * 遍历选项
 */
export interface TreeOptions<T> {
    /** 索引  */
    index?: number;
    /** 当前层级 从 1 开始 */
    level?: number;
    /** 路径 */
    paths?: Array<T>;
    /** 索引路径 */
    indexes?: Array<number>;
}

export interface Iterator<T extends TreeItem, R> {
    (item?: T, options?: Required<TreeOptions<T>>): R;
}