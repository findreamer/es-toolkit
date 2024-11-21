import { describe, expect, it, vi } from 'vitest';
import { someTree } from './someTree';
import type { TreeNode } from './tree.type';

interface TestNode extends TreeNode {
  id: number;
  name: string;
  value?: number;
}

describe('someTree', () => {
  // 测试数据准备
  const mockTree: TestNode[] = [
    {
      id: 1,
      name: 'Node 1',
      value: 10,
      children: [
        {
          id: 11,
          name: 'Node 1-1',
          value: 20,
          children: [
            { id: 111, name: 'Node 1-1-1', value: 30 },
            { id: 112, name: 'Node 1-1-2', value: 40 },
          ],
        },
        {
          id: 12,
          name: 'Node 1-2',
          value: 50,
        },
      ],
    },
    {
      id: 2,
      name: 'Node 2',
      value: 60,
      children: [{ id: 21, name: 'Node 2-1', value: 70 }],
    },
  ];

  describe('基本功能测试', () => {
    it('应该正确处理空树', () => {
      const result = someTree([], () => true);
      expect(result).toBe(false);
    });

    it('应该在找到匹配节点时返回 true', () => {
      const result = someTree(mockTree, node => node.id === 111);
      expect(result).toBe(true);
    });

    it('应该在未找到匹配节点时返回 false', () => {
      const result = someTree(mockTree, node => node.id === 999);
      expect(result).toBe(false);
    });

    it('应该能正确处理单层树', () => {
      const singleLevelTree: TestNode[] = [
        { id: 1, name: 'Node 1' },
        { id: 2, name: 'Node 2' },
      ];
      const result = someTree(singleLevelTree, node => node.id === 2);
      expect(result).toBe(true);
    });
  });

  describe('条件匹配测试', () => {
    it('应该支持复杂的条件判断', () => {
      const result = someTree(mockTree, node => node.value !== undefined && node.value > 50 && node.name.includes('2'));
      expect(result).toBe(true);
    });

    it('应该支持基于路径的条件判断', () => {
      const result = someTree(mockTree, (_, options) => options.paths.some(p => (p as TestNode).id === 11));
      expect(result).toBe(true);
    });

    it('应该支持基于层级的条件判断', () => {
      const result = someTree(mockTree, (_, { level }) => level === 3);
      expect(result).toBe(true);
    });

    it('应该支持基于索引的条件判断', () => {
      const result = someTree(mockTree, (_, { index }) => index === 1);
      expect(result).toBe(true);
    });
  });

  describe('遍历行为测试', () => {
    it('应该在找到第一个匹配项后停止遍历', () => {
      const iteratorSpy = vi.fn().mockReturnValue(true);
      someTree(mockTree, iteratorSpy);
      expect(iteratorSpy).toHaveBeenCalledTimes(1);
    });

    it('应该在未找到匹配项时遍历所有节点', () => {
      const iteratorSpy = vi.fn().mockReturnValue(false);
      someTree(mockTree, iteratorSpy);
      expect(iteratorSpy).toHaveBeenCalledTimes(7); // 总节点数
    });

    it('应该按照正确的顺序遍历节点', () => {
      const visitedIds: number[] = [];
      someTree(mockTree, node => {
        visitedIds.push(node.id);
        return false;
      });
      expect(visitedIds).toEqual([1, 11, 111, 112, 12, 2, 21]);
    });
  });

  describe('边界情况测试', () => {
    it('应该正确处理只有根节点的树', () => {
      const singleNodeTree: TestNode[] = [{ id: 1, name: 'Root' }];
      const result = someTree(singleNodeTree, node => node.id === 1);
      expect(result).toBe(true);
    });

    it('应该正确处理空的 children 数组', () => {
      const treeWithEmptyChildren: TestNode[] = [
        {
          id: 1,
          name: 'Node',
          children: [],
        },
      ];
      const result = someTree(treeWithEmptyChildren, node => node.id === 1);
      expect(result).toBe(true);
    });

    it('应该正确处理 undefined children', () => {
      const treeWithUndefinedChildren: TestNode[] = [
        {
          id: 1,
          name: 'Node',
          children: undefined,
        },
      ];
      const result = someTree(treeWithUndefinedChildren, node => node.id === 1);
      expect(result).toBe(true);
    });
  });

  describe('错误处理测试', () => {
    it('应该处理非数组输入', () => {
      // @ts-expect-error 测试非法输入
      const result = someTree({}, () => true);
      expect(result).toBe(false);
    });

    it('应该处理无效的迭代器函数', () => {
      // @ts-expect-error 测试非法输入
      expect(() => someTree(mockTree, 'not a function')).toThrow();
    });

    it('应该处理迭代器返回非布尔值', () => {
      // @ts-expect-error 测试非法返回值
      const result = someTree(mockTree, () => undefined);
      expect(result).toBe(false);
    });
  });

  describe('性能测试', () => {
    it('应该能处理大型树结构', () => {
      const largeTree: TestNode[] = Array.from({ length: 1000 }, (_, index) => ({
        id: index,
        name: `Node ${index}`,
        children:
          index < 990
            ? [
              {
                id: index * 1000,
                name: `Child of ${index}`,
              },
            ]
            : undefined,
      }));

      const result = someTree(largeTree, node => node.id === 989000);
      expect(result).toBe(true);
    });
  });
});
