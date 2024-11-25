export interface TreeNode {
  children?: TreeNode[];
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
  paths?: T[];
  /** 索引路径 */
  indexes?: number[];
  /** 子节点 key */
  childrenKey?: string;
}

export interface Iterator<T extends TreeNode, R> {
  (item: T, options: Required<TreeOptions<T>>): R;
}

export type BooleanType = boolean | number | string | object;
