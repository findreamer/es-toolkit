// src/tree/findTreeNode.spec.ts
import { beforeEach, describe, expect, it } from 'vitest';
import { findTreeNode } from './findTreeNode';
import type { TreeNode } from './tree.type';

interface TestNode extends TreeNode {
  key: string;
  id: number;
}

describe('findTreeNode', () => {
  beforeEach(() => {
    clearTreeCache();
  });

  const tree: TestNode[] = [
    {
      id: 1,
      key: 'node1',
      children: [
        { id: 11, key: 'node11', children: [{ id: 111, key: 'node111' }] },
        { id: 12, key: 'node12' },
      ],
    },
    {
      id: 2,
      key: 'node2',
      children: [
        { id: 21, key: 'node21' },
        { id: 22, key: 'node22', children: [{ id: 221, key: 'node221' }] },
      ],
    },
  ];

  describe('基本功能测试', () => {
    it('应该返回 null 当树为空数组时', () => {
      const result = findTreeNode([], node => true);
      expect(result).toBeNull();
    });

    it('应该返回 null 当没有找到匹配节点时', () => {
      const result = findTreeNode(tree, node => node.id === 999);
      expect(result).toBeNull();
    });

    it('应该找到根级节点', () => {
      const result = findTreeNode(tree, node => node.id === 2);
      expect(result).toEqual(tree[1]);
    });

    it('应该找到深层节点', () => {
      const result = findTreeNode(tree, node => node.id === 111);
      expect(result).toEqual(tree[0].children![0].children![0]);
    });
  });
});
