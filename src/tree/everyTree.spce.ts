import { beforeEach, describe, expect, it, vi } from 'vitest';
import { everyTree } from './everyTree';
import type { TreeNode } from './tree.type';

interface TestNode extends TreeNode {
  id: number;
}

describe('everyTree', () => {
  let iterator: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    iterator = vi.fn();
  });

  // 测试数据
  const tree: TestNode[] = [
    {
      id: 1,
      name: 'Node 1',
      children: [
        {
          id: 11,
          name: 'Node 1.1',
          children: [{ id: 111, name: 'Node 1.1.1' }],
        },
        { id: 12, name: 'Node 1.2' },
      ],
    },
    {
      id: 2,
      name: 'Node 2',
      children: [{ id: 21, name: 'Node 2.1' }],
    },
  ];

  it('所有节点都满足条件时应返回 true', () => {
    const result = everyTree(tree, node => typeof node.id === 'number');
    expect(result).toBe(true);
  });

  it('存在不满足条件的节点时应返回 false', () => {
    const result = everyTree(tree, node => node.id < 100);
    expect(result).toBe(false);
  });

  it('空树应返回 true', () => {
    const result = everyTree([], () => true);
    expect(result).toBe(true);
  });

  it('非数组输入应返回 false', () => {
    const result = everyTree(null as any, () => true);
    expect(result).toBe(false);
  });

  it('迭代器应接收正确的参数', () => {
    iterator.mockImplementation(() => true);
    everyTree(tree, iterator);

    // 检查第一次调用的参数
    const firstCall = iterator.mock.calls[0]!;
    expect(firstCall[0]?.id).toBe(1);
    expect(firstCall[1]?.index).toBe(0);
    expect(firstCall[1]?.level).toBe(1);
    expect(firstCall[1]?.paths).toEqual([tree[0]]);
    expect(firstCall[1]?.indexes).toEqual([0]);

    // 检查调用次数（应该等于节点总数）
    expect(iterator).toHaveBeenCalledTimes(6);
  });

  it('当遇到不满足条件的节点时应立即返回 false 并停止遍历', () => {
    iterator.mockImplementationOnce(node => node.id !== 11);
    const result = everyTree(tree, iterator);

    expect(result).toBe(false);
    // 由于第二个节点就不满足条件，所以应该在遍历到第二个节点时就停止
    expect(iterator).toHaveBeenCalledTimes(2);
  });

  describe('childrenKey 配置测试', () => {
    const customTree = [
      {
        id: 1,
        name: 'Node 1',
        subNodes: [
          {
            id: 11,
            name: 'Node 1.1',
            subNodes: [{ id: 111, name: 'Node 1.1.1' }],
          },
        ],
      },
      {
        id: 2,
        name: 'Node 2',
        subNodes: [{ id: 21, name: 'Node 2.1' }],
      },
    ];

    it('应该支持自定义子节点属性名', () => {
      const visitedIds: number[] = [];
      const result = everyTree(
        customTree,
        node => {
          visitedIds.push(node.id);
          return true;
        },
        { childrenKey: 'subNodes' }
      );

      expect(result).toBe(true);
      expect(visitedIds).toEqual([1, 11, 111, 2, 21]);
    });

    it('使用错误的子节点属性名时应该正常处理', () => {
      const visitedIds: number[] = [];
      const result = everyTree(
        customTree,
        node => {
          visitedIds.push(node.id);
          return true;
        },
        { childrenKey: 'wrongKey' }
      );

      expect(result).toBe(true);
      expect(visitedIds).toEqual([1, 2]);
    });
  });

  describe('遍历顺序测试', () => {
    it('广度优先遍历（默认）应该按正确顺序访问节点', () => {
      const visitedIds: number[] = [];
      everyTree(tree, node => {
        visitedIds.push(node.id);
        return true;
      });
      // BFS 顺序: 1 -> 2 -> 11 -> 12 -> 21 -> 111
      expect(visitedIds).toEqual([1, 2, 11, 12, 21, 111]);
    });

    it('深度优先遍历应该按正确顺序访问节点', () => {
      const visitedIds: number[] = [];
      everyTree(
        tree,
        node => {
          visitedIds.push(node.id);
          return true;
        },
        { useDfs: true }
      );
      // DFS 顺序: 1 -> 11 -> 111 -> 12 -> 2 -> 21
      expect(visitedIds).toEqual([1, 11, 111, 12, 2, 21]);
    });

    it('当节点不满足条件时，应立即停止遍历（BFS）', () => {
      const visitedIds: number[] = [];
      const result = everyTree(tree, node => {
        visitedIds.push(node.id);
        return node.id !== 11;
      });

      expect(result).toBe(false);
      // 应该在遇到 id=11 的节点时停止
      expect(visitedIds.length).toBeLessThan(6);
      expect(visitedIds).toContain(11);
    });

    it('当节点不满足条件时，应立即停止遍历（DFS）', () => {
      const visitedIds: number[] = [];
      const result = everyTree(
        tree,
        node => {
          visitedIds.push(node.id);
          return node.id !== 111;
        },
        { useDfs: true }
      );

      expect(result).toBe(false);
      expect(visitedIds.length).toBeLessThan(6);
      expect(visitedIds).toContain(111);
    });
  });
});
