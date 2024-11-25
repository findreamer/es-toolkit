import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mapTree } from './mapTree';
import type { TreeNode } from './tree.type';

interface TestNode extends TreeNode {
  id: number;
  name: string;
}

describe('mapTree', () => {
  let iterator: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    iterator = vi.fn();
  });

  // 测试数据准备
  const mockTree: TestNode[] = [
    {
      id: 1,
      name: 'Node 1',
      children: [
        {
          id: 11,
          name: 'Node 1-1',
          children: [
            { id: 111, name: 'Node 1-1-1' },
            { id: 112, name: 'Node 1-1-2' },
          ],
        },
        {
          id: 12,
          name: 'Node 1-2',
        },
      ],
    },
    {
      id: 2,
      name: 'Node 2',
      children: [{ id: 21, name: 'Node 2-1' }],
    },
  ];

  describe('基本功能测试', () => {
    it('应该正确映射空数组', () => {
      const result = mapTree([], node => node);
      expect(result).toEqual([]);
    });

    it('应该正确映射单层树', () => {
      const singleLevelTree: TestNode[] = [
        { id: 1, name: 'Node 1' },
        { id: 2, name: 'Node 2' },
      ];

      iterator.mockImplementation(node => ({
        ...node,
        name: `Mapped ${node.name}`,
      }));

      const result = mapTree(singleLevelTree, iterator);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Mapped Node 1');
      expect(result[1].name).toBe('Mapped Node 2');
      expect(iterator).toHaveBeenCalledTimes(2);
    });

    it('应该保持树结构不变', () => {
      const result = mapTree(mockTree, node => node);
      expect(result).toEqual(mockTree);
    });
  });

  describe('转换功能测试', () => {
    it('应该正确转换节点属性', () => {
      const result = mapTree(mockTree, node => ({
        value: node.id,
        label: node.name,
        children: node.children,
      }));

      expect(result[0]).toHaveProperty('value');
      expect(result[0]).toHaveProperty('label');
      expect(result[0]).not.toHaveProperty('id');
      expect(result[0]).not.toHaveProperty('name');
    });

    it('应该正确处理返回 undefined 的情况', () => {
      const result = mapTree(mockTree, node => {
        if (node.id === 1) {
          return undefined;
        }
        return node;
      });

      expect(result[0]).toBeDefined();
      expect(result[0]).toEqual(expect.objectContaining({ id: 1 }));
    });
  });

  describe('遍历顺序测试', () => {
    it('应该默认使用广度优先遍历', () => {
      const visitOrder: number[] = [];
      mapTree(mockTree, node => {
        visitOrder.push(node.id);
        return node;
      });

      expect(visitOrder).toEqual([1, 2, 11, 12, 21, 111, 112]);
    });

    it('应该支持深度优先遍历', () => {
      const visitOrder: number[] = [];
      mapTree(
        mockTree,
        node => {
          visitOrder.push(node.id);
          return node;
        },
        { useDfs: true }
      );

      expect(visitOrder).toEqual([1, 2, 11, 12, 21, 111, 112]);
    });
  });

  describe('childrenKey 配置测试', () => {
    // 准备使用自定义子节点属性的测试数据
    const customTree = [
      {
        id: 1,
        name: 'Node 1',
        subItems: [
          {
            id: 11,
            name: 'Node 1-1',
            subItems: [
              { id: 111, name: 'Node 1-1-1' },
              { id: 112, name: 'Node 1-1-2' },
            ],
          },
        ],
      },
      {
        id: 2,
        name: 'Node 2',
        subItems: [{ id: 21, name: 'Node 2-1' }],
      },
    ];

    it('应该支持自定义子节点属性名', () => {
      const visitOrder: number[] = [];
      const result = mapTree(
        customTree,
        node => {
          visitOrder.push(node.id);
          return node;
        },
        { childrenKey: 'subItems' }
      );

      expect(visitOrder).toEqual([1, 2, 11, 21, 111, 112]);
      expect(result[0]).toHaveProperty('subItems');
      expect(result[0].subItems[0]).toHaveProperty('subItems');
    });

    it('使用错误的子节点属性名时应该正常处理', () => {
      const visitOrder: number[] = [];
      const result = mapTree(
        customTree,
        node => {
          visitOrder.push(node.id);
          return node;
        },
        { childrenKey: 'wrongKey' }
      );

      // 由于找不到子节点，应该只访问顶层节点
      expect(visitOrder).toEqual([1, 2]);
      expect(result).toHaveLength(2);
    });

    it('在转换过程中应该保持自定义子节点属性名', () => {
      const result = mapTree(
        customTree,
        node => ({
          value: node.id,
          label: node.name,
          subItems: node.subItems,
        }),
        { childrenKey: 'subItems' }
      );

      expect(result[0]).toHaveProperty('subItems');
      expect(result[0].subItems[0]).toHaveProperty('subItems');
      expect(result[0]).not.toHaveProperty('children');
    });

    it('深度优先遍历时应该正确处理自定义子节点属性名', () => {
      const visitOrder: number[] = [];
      mapTree(
        customTree,
        node => {
          visitOrder.push(node.id);
          return node;
        },
        {
          childrenKey: 'subItems',
          useDfs: true,
        }
      );

      expect(visitOrder).toEqual([1, 2, 11, 21, 111, 112]);
    });
  });
});
