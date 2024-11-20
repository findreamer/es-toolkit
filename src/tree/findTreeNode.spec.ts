import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearTreeCache, findTreeNode, getTreeCache } from './findTreeNode';
import type { TreeNode, TreeOptions } from './tree.type';

interface TestNode extends TreeNode {
  key: string;
  id: number;
}

describe('findTreeNode', () => {
  // 在每个测试用例前重置缓存
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
      const result = findTreeNode([], () => true);
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

      const result = findTreeNode(tree, () => false, {
        cacheKey: 111,
        resolveCacheKey: node => node.id as number,
        effect: effectFn,
      });

      expect(result).toBeDefined();
      expect(result?.id).toBe(111);
      expect(effectFn).toHaveBeenCalledTimes(1);
    });

    it('应该使用字符串类型的缓存键查找节点', () => {
      const result = findTreeNode(tree, () => false, {
        cacheKey: 'node221',
        resolveCacheKey: node => node.key as string,
      });

      expect(result).toBeDefined();
      expect(result?.id).toBe(221);
    });

    it('应该处理无效的缓存键', () => {
      const result = findTreeNode(tree, () => false, {
        cacheKey: '',
        resolveCacheKey: node => node.id as number,
      });

      expect(result).toBeNull();
    });

    it('应该使用treeNode 对象查找节点', () => {
      const node = tree[0].children![0].children![0];
      const result = findTreeNode(tree, () => false, {
        cacheKey: node,
        resolveCacheKey: node => node,
      });

      expect(result).toBeDefined();
      expect(result?.id).toBe(111);
    });

    it('应该使用对象类型的缓存键（WeakMap）', () => {
      const objKey = { id: 'test' };
      const result = findTreeNode(tree, () => false, {
        cacheKey: objKey,
        resolveCacheKey: () => objKey,
      });

      expect(result).toBeNull(); // WeakMap 中没有对应的值
    });
  });

  describe('迭代器选项测试', () => {
    it('应该提供正确的层级信息', () => {
      let capturedLevel: number | undefined;
      findTreeNode(tree, (_, options) => {
        if (options.level === 3) {
          capturedLevel = options.level;
          return true;
        }
        return false;
      });
      expect(capturedLevel).toBe(3);
    });

    it('应该提供正确的路径信息', () => {
      let capturedPaths: TreeNode[] | undefined;
      findTreeNode(tree, (node, options) => {
        if (node.id === 111) {
          capturedPaths = options.paths;
          return true;
        }
        return false;
      });
      expect(capturedPaths?.length).toBe(2);
      expect(capturedPaths?.map(n => n.id)).toEqual([1, 11]);
    });

    it('应该提供正确的索引信息', () => {
      let capturedIndexes: number[] | undefined;
      findTreeNode(tree, (node, options) => {
        if (node.id === 221) {
          capturedIndexes = options.indexes;
          return true;
        }
        return false;
      });
      expect(capturedIndexes).toEqual([1, 1, 0]);
    });
  });

  describe('缓存持久性测试', () => {
    it('应该在树变化时重建缓存', () => {
      // 第一次查找建立缓存
      findTreeNode(tree, () => false, {
        cacheKey: 111,
        resolveCacheKey: node => node.id as number,
      });

      // 使用不同的树进行查找
      const newTree = [{ id: 1, children: [{ id: 2 }] }];
      findTreeNode(newTree, () => false, {
        cacheKey: 2,
        resolveCacheKey: node => node.id as number,
      });

      const cache = getTreeCache();
      expect(cache.cachedTree).toBe(newTree);
    });
  });
});
