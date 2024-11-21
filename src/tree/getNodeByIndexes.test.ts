import { describe, expect, it } from 'vitest';
import { getNodeByIndexes } from './getNodeByIndexes';
import type { TreeNode } from './tree.type';

interface TestNode extends TreeNode {
  id: number;
  name: string;
}

describe('getNodeByIndexes', () => {
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

  it('应该能获取根级节点', () => {
    const node = getNodeByIndexes(mockTree, 0);
    expect(node).toBeDefined();
    expect(node?.id).toBe(1);
  });

  it('应该能通过单个数字索引获取节点', () => {
    const node = getNodeByIndexes(mockTree, 1);
    expect(node?.id).toBe(2);
  });

  it('应该能通过索引数组获取深层节点', () => {
    const node = getNodeByIndexes(mockTree, [0, 0, 1]);
    expect(node?.id).toBe(112);
  });

  it('当索引无效时应返回 null', () => {
    const node = getNodeByIndexes(mockTree, [0, 0, 1, 1]);
    expect(node).toBeNull();
  });
});
