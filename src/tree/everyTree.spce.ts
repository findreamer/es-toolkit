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
    iterator.mockImplementationOnce(node => typeof node.id === 'number');
    const result = everyTree(tree, iterator);
    expect(result).toBe(true);
    expect(iterator).toHaveBeenCalledTimes(6);
  });

  it('存在不满足条件的节点时应返回 false', () => {
    iterator.mockImplementationOnce(node => node.id < 100);
    const result = everyTree(tree, iterator);
    expect(result).toBe(false);
    expect(iterator).toHaveBeenCalledTimes(6);
  });

  it('空树应返回 true', () => {
    iterator.mockImplementationOnce(() => true);
    const result = everyTree([], iterator);
    expect(result).toBe(true);
    expect(iterator).toHaveBeenCalledTimes(1);
  });

  it('非数组输入应返回 false', () => {
    iterator.mockImplementationOnce(() => true);
    const result = everyTree(null as any, iterator);
    expect(result).toBe(false);
    expect(iterator).toHaveBeenCalledTimes(1);
  });

  it('迭代器应接收正确的参数', () => {
    iterator.mockImplementationOnce(() => true);
    everyTree(tree, iterator);

    // 检查第一次调用的参数
    const firstCall = iterator.mock.calls[0]!;
    expect(firstCall[0]?.id).toBe(1);
    expect(firstCall[1]).toEqual({
      index: 0,
      level: 0,
      paths: [],
      indexes: [0],
    });

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
});
