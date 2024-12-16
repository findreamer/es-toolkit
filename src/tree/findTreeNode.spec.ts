// src/tree/findTreeNode.spec.ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearTreeCache, findTreeNode, findTreeNodeWithCache, getTreeCache } from './findTreeNode';
import type { TreeNode, TreeOptions } from './tree.type';

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

describe('findTreeNodeWithCache', () => {
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

  describe('缓存功能测试', () => {
    it('应该使用数字类型的缓存键查找节点', () => {
      const effectFn = vi.fn();

      effectFn.mockImplementation((node: TestNode, options: TreeOptions<TestNode>) => {
        expect(node.id).toBe(111);
        expect(options.index).toBe(0);
        expect(options.level).toBe(3);
        expect(options.paths).toEqual([tree[0], tree[0].children![0], tree[0].children![0].children![0]]);
        expect(options.indexes).toEqual([0, 0, 0]);
      });

      const result = findTreeNodeWithCache(tree, {
        search: 111,
        resolveCacheKey: node => node.id as number,
        effect: effectFn,
      });

      expect(result).toBeDefined();
      expect(result?.id).toBe(111);
      expect(effectFn).toHaveBeenCalledTimes(1);
    });

    it('应该使用字符串类型的缓存键查找节点', () => {
      const result = findTreeNodeWithCache(tree, {
        search: 'node221',
        resolveCacheKey: node => node.key as string,
      });

      expect(result).toBeDefined();
      expect(result?.id).toBe(221);
    });

    it('应该处理无效的缓存键', () => {
      const result = findTreeNodeWithCache(tree, {
        search: '',
        resolveCacheKey: node => node.id as number,
      });

      expect(result).toBeNull();
    });

    it('应该使用treeNode 对象查找节点', () => {
      const node = tree[0].children![0].children![0];
      const result = findTreeNodeWithCache(tree, {
        search: node,
        resolveCacheKey: node => node,
      });

      expect(result).toBeDefined();
      expect(result?.id).toBe(111);
    });

    it('应该使用对象类型的缓存键（WeakMap）', () => {
      const objKey = { id: 'test' };
      const result = findTreeNodeWithCache(tree, {
        search: objKey,
        resolveCacheKey: () => objKey,
      });

      expect(result).toBeNull(); // WeakMap 中没有对应的值
    });

    it('应该在树变化时重建缓存', () => {
      // 第一次查找建立缓存
      findTreeNodeWithCache(tree, {
        search: 111,
        resolveCacheKey: node => node.id as number,
      });

      // 使用不同的树进行查找
      const newTree = [{ id: 1, children: [{ id: 2 }] }];
      findTreeNodeWithCache(newTree, {
        search: 2,
        resolveCacheKey: node => node.id as number,
      });

      const cache = getTreeCache();
      expect(cache.cachedTree).toBe(newTree);
    });
  });
});
