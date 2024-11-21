import { describe, expect, it } from 'vitest';
import { flattenTree } from './flattenTree';
import type { TreeNode } from './tree.type';

interface TestNode extends TreeNode {
  id: number;
  name: string;
}

describe('flattenTree', () => {
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

  it('应该正确扁平化空树', () => {
    const result = flattenTree([]);
    expect(result).toEqual([]);
  });

  it('应该正确扁平化单层树', () => {
    const singleLevelTree: TestNode[] = [
      { id: 1, name: 'Node 1' },
      { id: 2, name: 'Node 2' },
    ];
    const result = flattenTree(singleLevelTree);
    expect(result).toHaveLength(2);
    expect(result.map(node => node.id)).toEqual([1, 2]);
  });

  it('应该正确扁平化多层树', () => {
    const result = flattenTree(mockTree);
    expect(result).toHaveLength(7);
    expect(result.map(node => node.id)).toEqual([1, 11, 111, 112, 12, 2, 21]);
  });

  it('应该支持转换函数', () => {
    const result = flattenTree(mockTree, node => ({
      value: node.id,
      label: node.name,
    }));

    expect(result).toHaveLength(7);
    expect(result[0]).toEqual({ value: 1, label: 'Node 1' });
    expect(result[2]).toEqual({ value: 111, label: 'Node 1-1-1' });
  });

  it('应该正确处理只有一个节点的树', () => {
    const singleNodeTree: TestNode[] = [{ id: 1, name: 'Single Node' }];
    const result = flattenTree(singleNodeTree);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(singleNodeTree[0]);
  });

  it('应该正确处理有空children的节点', () => {
    const treeWithEmptyChildren: TestNode[] = [
      {
        id: 1,
        name: 'Node 1',
        children: [],
      },
    ];
    const result = flattenTree(treeWithEmptyChildren);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it('应该支持复杂的转换函数', () => {
    const result = flattenTree(mockTree, (node, options) => ({
      id: node.id,
      name: node.name,
      level: options.level,
      isLeaf: !node.children?.length,
      parentId: options.paths[options.paths.length - 1]?.id || null,
    }));

    expect(result).toHaveLength(7);
    expect(result[0]).toEqual({
      id: 1,
      name: 'Node 1',
      level: 1,
      isLeaf: false,
      parentId: null,
    });
    expect(result[2]).toEqual({
      id: 111,
      name: 'Node 1-1-1',
      level: 3,
      isLeaf: true,
      parentId: 11,
    });
  });
});
