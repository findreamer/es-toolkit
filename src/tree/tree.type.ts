export interface TreeNode {
    children?: Array<TreeNode>;
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

export interface Iterator<T extends TreeNode, R> {
    (item: T, options: Required<TreeOptions<T>>): R;
}

/** 启用缓存 new Map(), 多次重复从一棵树中查找时可大幅提升性能 */
export type CacheOptions<T extends TreeNode> = {
    /** 从缓存 Map 中查找的key，使用 Map.get(value) 匹配 */
    value: number | string;
    /** 构建 Map 时，用户自定义缓存 key 的处理函数，如果不传，则默认取迭代对象的 id */
    resolve?: (item: T, options: Required<TreeOptions<T>>) => string | number;
    /** 匹配到 item 执行副作用函数 */
    foundEffect?: (item: T, options: Required<TreeOptions<T>>) => void;
}