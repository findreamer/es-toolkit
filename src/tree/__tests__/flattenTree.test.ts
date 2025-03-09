import { describe, expect, it } from 'vitest';
import { flattenTree } from '../flattenTree';
import type { TreeNode } from '../tree.type';

describe('flattenTree', () => {
  // 测试数据准备
  interface TestNode extends TreeNode {
    id: string;
    name: string;
    children?: TestNode[];
  }

  const testTree: TestNode[] = [
    {
      id: '1',
      name: 'Root 1',
      children: [
        {
          id: '1-1',
          name: 'Child 1-1',
          children: [
            {
              id: '1-1-1',
              name: 'Grandchild 1-1-1',
            },
          ],
        },
        {
          id: '1-2',
          name: 'Child 1-2',
        },
      ],
    },
    {
      id: '2',
      name: 'Root 2',
      children: [
        {
          id: '2-1',
          name: 'Child 2-1',
        },
      ],
    },
  ];

  // 基础功能测试
  it('should flatten entire tree when no additional parameters provided', () => {
    const flattened = flattenTree(testTree);
    expect(flattened).toHaveLength(6);
    expect(flattened.map(node => node.id)).toEqual(['1', '1-1', '1-1-1', '1-2', '2', '2-1']);
  });

  // 空树测试
  it('should return empty array for empty tree', () => {
    expect(flattenTree([])).toEqual([]);
  });

  // 无子节点树测试
  it('should handle tree with no children', () => {
    const simpleTree = [{ id: '1', name: 'Single Node' }];
    expect(flattenTree(simpleTree)).toHaveLength(1);
    expect(flattenTree(simpleTree)[0].id).toBe('1');
  });

  // 层级控制测试
  describe('level control', () => {
    it('should flatten to level 1', () => {
      const flattened = flattenTree(testTree, 1);
      expect(flattened).toHaveLength(2);
      expect(flattened.map(node => node.id)).toEqual(['1', '2']);
    });

    it('should flatten to level 2', () => {
      const flattened = flattenTree(testTree, 2);
      expect(flattened).toHaveLength(5);
      expect(flattened.map(node => node.id)).toEqual(['1', '1-1', '1-2', '2', '2-1']);
    });

    it('should handle level greater than tree depth', () => {
      const flattened = flattenTree(testTree, 10);
      expect(flattened).toHaveLength(6);
      expect(flattened.map(node => node.id)).toEqual(['1', '1-1', '1-1-1', '1-2', '2', '2-1']);
    });

    it('should handle level 0 or negative level', () => {
      expect(flattenTree(testTree, 0)).toHaveLength(0);
      expect(flattenTree(testTree, -1)).toHaveLength(0);
    });
  });

  // 转换函数测试
  describe('transform function', () => {
    it('should transform nodes using transform function', () => {
      const transformed = flattenTree(testTree, node => node.id);
      expect(transformed).toEqual(['1', '1-1', '1-1-1', '1-2', '2', '2-1']);
    });

    it('should transform nodes with complex transformation', () => {
      const transformed = flattenTree(testTree, node => ({
        value: node.id,
        label: node.name,
      }));
      expect(transformed[0]).toEqual({
        value: '1',
        label: 'Root 1',
      });
    });

    it('should handle transform function with tree options', () => {
      const transformed = flattenTree(testTree, (node, options) => ({
        id: node.id,
        level: options.level,
        index: options.index,
      }));
      expect(transformed[0]).toEqual({
        id: '1',
        level: 1,
        index: 0,
      });
    });
  });

  // 组合参数测试
  describe('combined parameters', () => {
    it('should combine level and transform function', () => {
      const result = flattenTree(testTree, 2, node => node.id);
      expect(result).toEqual(['1', '1-1', '1-2', '2', '2-1']);
    });

    it('should handle level 1 with transform', () => {
      const result = flattenTree(testTree, 1, node => node.name);
      expect(result).toEqual(['Root 1', 'Root 2']);
    });
  });

  // 错误处理测试
  describe('error handling', () => {
    it('should handle invalid tree input', () => {
      // @ts-ignore
      expect(() => flattenTree(null)).toThrow();
      // @ts-ignore
      expect(() => flattenTree(undefined)).toThrow();
      // @ts-ignore
      expect(() => flattenTree('not an array')).toThrow();
    });

    it('should handle malformed tree nodes', () => {
      const malformedTree = [
        {
          id: '1',
          // @ts-ignore
          children: 'not an array',
        },
      ];
      expect(() => flattenTree(malformedTree)).not.toThrow();
    });
  });

  describe('函数重载测试，能正确推断类型', () => {
    it('测试1', () => {
      const result = flattenTree(testTree);
      expect(result).toEqual(['1', '1-1', '1-1-1', '1-2', '2', '2-1']);
    });

    it('测试2', () => {
      const result = flattenTree(testTree, 1);
      expect(result).toEqual(['1', '2']);
    });

    it('测试3', () => {
      const result = flattenTree(testTree, 1, node => node.id);
      expect(result).toEqual(['1', '2']);
    });

    it('测试4', () => {
      const result = flattenTree(testTree, node => node.id, 1);
      expect(result).toEqual(['1', '2']);
    });
  });
});
