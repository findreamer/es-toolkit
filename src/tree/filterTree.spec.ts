import { describe, expect, it, vi } from 'vitest';
import { filterTree } from './filterTree';
import type { TreeNode } from './tree.type';

interface TestNode extends TreeNode {
  id: number;
  name: string;
}

describe('filterTree', () => {
  const basicTree: TestNode[] = [
    {
      id: 1,
      name: 'node1',
      children: [
        { id: 11, name: 'node1-1' },
        {
          id: 12,
          name: 'node1-2',
          children: [{ id: 121, name: 'node1-2-1' }],
        },
      ],
    },
    {
      id: 2,
      name: 'node2',
      children: [{ id: 21, name: 'node2-1' }],
    },
  ];

  it('应该正确过滤顶层节点', () => {
    const iterator = vi.fn((node: TestNode) => node.id === 1);

    const result = filterTree(basicTree, iterator);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
    expect(iterator).toHaveBeenCalledTimes(2); // 只调用顶层节点次数
  });

  it('应该正确过滤子节点（广度优先）', () => {
    const iterator = vi.fn((node: TestNode) => node.id !== 12);

    const result = filterTree(basicTree, iterator);

    expect(result[0].children).toHaveLength(1);
    expect(result[0].children![0].id).toBe(11);
    // @ts-expect-error 测试level值
    expect(iterator.mock.calls[0][1].level).toBe(1);
    // @ts-expect-error 测试level值
    expect(iterator.mock.calls[1][1].level).toBe(1);
    // @ts-expect-error 测试level值
    expect(iterator.mock.calls[2][1].level).toBe(2);
    // @ts-expect-error 测试level值
    expect(iterator.mock.calls[3][1].level).toBe(2);
  });

  it('应该正确处理深度优先遍历', () => {
    const iterator = vi.fn((node: TestNode) => node.id !== 121);

    const result = filterTree(basicTree, iterator, { useDfs: true });

    expect(result[0].children![1].children).toHaveLength(0);
    // 验证深度优先的调用顺序
    // @ts-expect-error 测试深度优先level值
    expect(iterator.mock.calls[0][1].level).toBe(3);
    // @ts-expect-error 测试深度优先level值
    expect(iterator.mock.calls[1][1].level).toBe(2);
    // @ts-expect-error 测试深度优先level值
    expect(iterator.mock.calls[2][1].level).toBe(2);
    // @ts-expect-error 测试深度优先level值
    expect(iterator.mock.calls[3][1].level).toBe(1);
  });

  it('应该正确传递路径信息', () => {
    const iterator = vi.fn(() => true);

    filterTree(basicTree, iterator);

    // 验证路径信息
    // @ts-expect-error 测试路径信息
    expect(iterator.mock.calls[3][1].paths).toHaveLength(1);
    // @ts-expect-error 测试路径信息
    expect(iterator.mock.calls[3][1].paths[0].id).toBe(1);
    // @ts-expect-error 测试路径信息
    expect(iterator.mock.calls[3][1].indexes).toEqual([0, 1]);
  });

  it('应该处理空子节点的情况', () => {
    const emptyTree: TestNode[] = [{ id: 1, name: 'empty', children: [] }];
    const iterator = vi.fn(() => true);

    const result = filterTree(emptyTree, iterator);

    expect(result).toHaveLength(1);
    expect(result[0].children).toHaveLength(0);
  });

  it('应该处理没有子节点的情况', () => {
    const noChildrenTree: TestNode[] = [{ id: 1, name: 'no-children' }];
    const iterator = vi.fn(() => true);

    const result = filterTree(noChildrenTree, iterator);

    expect(result).toHaveLength(1);
    expect(result[0].children).toBeUndefined();
  });

  it('应该处理空树的情况', () => {
    const iterator = vi.fn(() => true);

    const result = filterTree([], iterator);

    expect(result).toHaveLength(0);
    expect(iterator).not.toHaveBeenCalled();
  });
});
