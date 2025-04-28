import type { TreeNode } from './tree.type';
import { isValidKey } from './utils';

export type ResolveKey<T> = keyof T | ((item: T) => number | string | undefined | null);

export interface NodeInfo<T> {
  node: T;
  level: number;
  paths: T[];
  index: number;
}

export interface ListToTreeOptions<T extends TreeNode, R> {
  /**
   * 一个可选的函数，用于从 TreeNode 中提取唯一标识。默认情况下，使用元素本身的 id 属性。
   */
  resolveId?: ResolveKey<T>;
  /**
   * 一个可选的函数，用于从 TreeNode 中提取父节点的标识，默认情况下，请使用元素本身的 parentId 属性
   */
  resolveParentId?: ResolveKey<T>;
  /**
   * 一个可选的函数，用于将 TreeNode 转换为另一种数据格式。默认情况下，不进行转换
   */
  transform?: (info: NodeInfo<T>) => R;
  /**
   * children key属性
   */
  childrenKey?: string;
}

/**
 * 将列表转换为树结构
 * @param items 一个包含 TreeNode 类型元素的数组
 * @param resolveId 一个可选的函数，用于从 TreeNode 中提取唯一标识。默认情况下，使用元素本身的 id 属性。
 * @param resolveParentId 一个可选的函数，用于从 TreeNode 中提取父节点的标识，默认情况下，请使用元素本身的 parentId 属性
 * @param transform 一个可选的函数，用于将 TreeNode 转换为另一种数据格式。默认情况下，不进行转换。
 */

export function listToTree<T extends TreeNode, R = T>(items: T[], options?: ListToTreeOptions<T, R>): R[] {
  if (!Array.isArray(items)) {
    throw new TypeError('items must be an array');
  }

  const { resolveId = 'id', resolveParentId = 'parentId', childrenKey = 'children', transform } = options || {};

  const getNodeId = (node: T) => (typeof resolveId === 'function' ? resolveId(node) : node[resolveId!]);
  const getParentId = (node: T) =>
    typeof resolveParentId === 'function' ? resolveParentId(node) : (node[resolveParentId!] ?? null);

  const nodeMap = new Map<
    string | number,
    {
      node: T;
      transformed: R;
      children: R[];
      parentId: string | number | null;
      level?: number;
      paths?: T[];
      calculated?: boolean;
    }
  >();

  // 检测循环引用
  const checkCircularReference = (nodeId: string | number, parentId: string | number | null): boolean => {
    if (!parentId) {
      return false;
    }

    let currentParentId = parentId;
    const visited = new Set<string | number>([nodeId]);

    while (currentParentId && isValidKey(currentParentId)) {
      if (visited.has(currentParentId)) {
        return true;
      }
      visited.add(currentParentId);
      currentParentId = nodeMap.get(currentParentId)?.parentId ?? null;
    }
    return false;
  };

  // 使用栈来计算节点信息
  const calculateNodeInfo = transform
    ? (startNodeId: string | number) => {
      const stack: Array<{
        nodeId: string | number;
        parentChain: Array<{ id: string | number; node: T }>;
      }> = [];

      stack.push({ nodeId: startNodeId, parentChain: [] });

      while (stack.length > 0) {
        const current = stack.pop()!;
        const record = nodeMap.get(current.nodeId);

        // 跳过已处理的节点
        if (!record || record.calculated) {
          continue;
        }

        const { parentId } = record;
        const shouldBeRoot = !parentId || !isValidKey(parentId) || checkCircularReference(current.nodeId, parentId);

        if (shouldBeRoot) {
          // 处理根节点
          record.level = 1;
          record.paths = [record.node];
          record.calculated = true;
          continue;
        }

        const parentRecord = nodeMap.get(parentId);
        if (!parentRecord) {
          // 父节点不存在，作为根节点处理
          record.level = 1;
          record.paths = [record.node];
          record.calculated = true;
          continue;
        }

        if (!parentRecord.calculated) {
          // 将当前节点重新放回栈中
          stack.push(current);
          // 父节点未计算完成，将父节点加入栈中
          stack.push({
            nodeId: parentId,
            parentChain: [...current.parentChain, { id: current.nodeId, node: record.node }],
          });
          continue;
        }

        // 父节点已计算完成，可以计算当前节点
        record.level = parentRecord.level + 1;
        record.paths = [...parentRecord.paths!, record.node];
        record.calculated = true;
      }

      return nodeMap.get(startNodeId);
    }
    : null;

  // 建立节点映射
  for (const item of items) {
    const nodeId = getNodeId(item);
    const parentId = getParentId(item);

    if (!isValidKey(nodeId)) {
      continue;
    }

    nodeMap.set(nodeId, {
      node: item,
      transformed: null as any,
      children: [],
      parentId: checkCircularReference(nodeId, parentId) ? null : isValidKey(parentId) ? parentId : null,
    });
  }

  // 构建树
  const roots: R[] = [];
  const processNode = (record: typeof nodeMap extends Map<any, infer V> ? V : never) => {
    const transformed = transform
      ? transform({
        node: record.node,
        level: record.level!,
        paths: record.paths!,
        index: record.parentId ? (nodeMap.get(record.parentId)?.children.length ?? 0) : roots.length,
      })
      : (record.node as unknown as R);

    if (record.children.length > 0) {
      (transformed as any)[childrenKey] = record.children;
    }
    return transformed;
  };

  nodeMap.forEach((record, nodeId) => {
    const nodeInfo = transform ? calculateNodeInfo!(nodeId) : record;
    if (!nodeInfo) {
      return;
    }

    record.transformed = processNode(record);

    if (record.parentId && isValidKey(record.parentId) && !checkCircularReference(nodeId, record.parentId)) {
      const parentRecord = nodeMap.get(record.parentId);
      if (parentRecord) {
        parentRecord.children.push(record.transformed);
        if (parentRecord.children.length > 0) {
          (parentRecord.transformed as any)[childrenKey] = parentRecord.children;
        }
      } else {
        roots.push(record.transformed);
      }
    } else {
      roots.push(record.transformed);
    }
  });

  return roots;
}
