import { describe, expect, it } from 'vitest';
import { flattenTree } from './flattenTree';
import type { TreeNode } from './tree.type';

interface TestNode extends TreeNode {
  id: number;
  name?: string;
}

describe('flattenTree', () => {
  // 基础测试数据
  const tree: TestNode[] = [
    {
      id: 1,
      name: 'node1',
      children: [
        { id: 2, name: 'node2' },
        {
          id: 3,
          name: 'node3',
          children: [{ id: 4, name: 'node4' }],
        },
      ],
    },
    { id: 5, name: 'node5' },
  ];

  describe('基本功能测试', () => {
    it('应该正确扁平化树结构', () => {
      const result = flattenTree(tree);
      expect(result).toHaveLength(5);
      expect(result.map(node => node.id)).toEqual([1, 2, 3, 4, 5]);
    });

    it('应该处理空数组', () => {
      const result = flattenTree([]);
      expect(result).toEqual([]);
    });

    it('应该处理没有子节点的树', () => {
      const simpleTree: TestNode[] = [{ id: 1 }, { id: 2 }];
      const result = flattenTree(simpleTree);
      expect(result).toHaveLength(2);
      expect(result.map(node => node.id)).toEqual([1, 2]);
    });

    it('应该处理只有一个节点的树', () => {
      const singleNodeTree: TestNode[] = [{ id: 1 }];
      const result = flattenTree(singleNodeTree);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });
  });

  describe('迭代器功能测试', () => {
    it('应该使用迭代器转换节点', () => {
      const result = flattenTree(tree, node => ({
        value: node.id,
        label: node.name,
      }));

      expect(result).toHaveLength(5);
      expect(result[0]).toEqual({ value: 1, label: 'node1' });
      expect(result[3]).toEqual({ value: 4, label: 'node4' });
    });

    it('应该在迭代器中提供正确的层级信息', () => {
      const levels: number[] = [];
      flattenTree(tree, (_, options) => {
        levels.push(options.level);
        return null;
      });

      expect(levels).toEqual([1, 2, 2, 3, 1]);
    });

    it('应该在迭代器中提供正确的索引信息', () => {
      const indexes: number[][] = [];
      flattenTree(tree, (_, options) => {
        indexes.push(options.indexes);
        return null;
      });

      expect(indexes).toEqual([[0], [0, 0], [0, 1], [0, 1, 0], [1]]);
    });

    it('应该在迭代器中提供正确的路径信息', () => {
      const paths: number[][] = [];
      flattenTree(tree, (_, options) => {
        paths.push(options.paths.map(node => (node as TestNode).id));
        return null;
      });

      expect(paths).toEqual([[], [1], [1], [1, 3], []]);
    });
  });

  describe('边界情况测试', () => {
    it('应该处理 children 为空数组的节点', () => {
      const treeWithEmptyChildren: TestNode[] = [
        {
          id: 1,
          children: [],
        },
        { id: 2 },
      ];
      const result = flattenTree(treeWithEmptyChildren);
      expect(result).toHaveLength(2);
    });
  });

  describe('childrenKey 配置测试', () => {
    const customTree = [
      {
        id: 1,
        subNodes: [{ id: 11, subNodes: [{ id: 111 }] }, { id: 12 }],
      },
      {
        id: 2,
        subNodes: [{ id: 21 }],
      },
    ];

    it('应该支持自定义子节点属性名', () => {
      const result = flattenTree(customTree, { childrenKey: 'subNodes' });
      expect(result).toHaveLength(6);
      expect(result.map(node => node.id)).toEqual([1, 11, 111, 12, 2, 21]);
    });

    it('应该支持转换函数和自定义子节点属性名', () => {
      const result = flattenTree(customTree, node => ({ value: node.id }), { childrenKey: 'subNodes' });

      expect(result).toHaveLength(6);
      expect(result[0]).toEqual({ value: 1 });
      expect(result[2]).toEqual({ value: 111 });
    });
  });
});
