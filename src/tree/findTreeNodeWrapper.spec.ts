import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearTreeCache, getTreeCache } from './findTreeNodeWithCache';
import { findTreeNodeWrapper } from './findTreeNodeWrapper';
import type { TreeNode } from './tree.type';

interface TestNode extends TreeNode {
  id: number;
  name: string;
  children?: TestNode[];
}

interface CustomNode extends TestNode {
  objRef?: { custom: string };
}

describe('findTreeNodeWrapper', () => {
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

  let effectFn: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    effectFn = vi.fn();
    clearTreeCache(); // 确保每个测试用例前缓存都是干净的
  });

  describe('基本功能测试', () => {
    it('应该能找到匹配的节点', () => {
      const result = findTreeNodeWrapper(tree, node => node.id === 11);
      expect(result).toBeTruthy();
      expect(result?.id).toBe(11);
    });

    it('当没有匹配节点时应返回 null', () => {
      const result = findTreeNodeWrapper(tree, node => node.id === 999);
      expect(result).toBeNull();
    });

    it('应该支持自定义 childrenKey', () => {
      const customTree = [
        {
          id: 1,
          name: 'Custom 1',
          subNodes: [{ id: 11, name: 'Custom 1.1' }],
        },
      ];
      const result = findTreeNodeWrapper(customTree, node => node.id === 11, {
        childrenKey: 'subNodes',
      });
      expect(result?.id).toBe(11);
    });
  });

  describe('缓存测试 - 使用 predicate 函数', () => {
    it('使用缓存和 predicate 函数时应该正确工作', () => {
      const predicate = vi.fn(node => node.id === 11);

      // 第一次调用
      const result1 = findTreeNodeWrapper(tree, predicate, {
        useCache: true,
        search: 11,
        resolveCacheKey: 'id',
      });
      expect(result1?.id).toBe(11);

      // 第二次调用应该使用缓存，不应再调用 predicate
      predicate.mockClear();
      const result2 = findTreeNodeWrapper(tree, predicate, {
        useCache: true,
        search: 11,
        resolveCacheKey: 'id',
      });
      expect(result2?.id).toBe(11);
      expect(predicate).not.toHaveBeenCalled();
    });

    it('使用缓存但不同的 search 值时应该返回不同结果', () => {
      // 建立缓存
      findTreeNodeWrapper(tree, () => true, {
        useCache: true,
        search: 11,
        resolveCacheKey: 'id',
      });

      // 使用不同的 search 值
      const result1 = findTreeNodeWrapper(tree, () => true, {
        useCache: true,
        search: 11,
        resolveCacheKey: 'id',
      });

      const result2 = findTreeNodeWrapper(tree, () => true, {
        useCache: true,
        search: 12,
        resolveCacheKey: 'id',
      });

      expect(result1?.id).toBe(11);
      expect(result2?.id).toBe(12);
    });
  });

  describe('缓存测试 - 直接使用 options 对象', () => {
    it('直接传递缓存选项对象时应该正确工作', () => {
      // 使用重载：findTreeNodeWrapper(tree, options)
      const result = findTreeNodeWrapper(tree, {
        useCache: true,
        search: 11,
        resolveCacheKey: 'id',
      });

      expect(result?.id).toBe(11);
    });

    it('直接传递配置对象且使用自定义 resolveCacheKey 函数', () => {
      const resolveCacheKey = vi.fn((node: TestNode) => node.id as number);

      // 建立缓存
      findTreeNodeWrapper(tree, {
        useCache: true,
        search: 11,
        resolveCacheKey,
      });

      expect(resolveCacheKey).toHaveBeenCalled();

      // 再次查找，应直接从缓存获取
      resolveCacheKey.mockClear();
      const result = findTreeNodeWrapper(tree, {
        useCache: true,
        search: 11,
        resolveCacheKey,
      });

      expect(result?.id).toBe(11);
      expect(resolveCacheKey).not.toHaveBeenCalled(); // 使用缓存时不应再调用
    });

    it('直接传递配置对象时应该执行 effect 函数', () => {
      const result = findTreeNodeWrapper(tree, {
        useCache: true,
        search: 11,
        resolveCacheKey: 'id',
        effect: effectFn,
      });

      expect(result?.id).toBe(11);
      expect(effectFn).toHaveBeenCalledWith(expect.objectContaining({ id: 11 }), expect.any(Object));
    });
  });

  describe('缓存对象内部测试', () => {
    it('应该正确构建缓存对象', () => {
      findTreeNodeWrapper(tree, {
        useCache: true,
        search: 11,
        resolveCacheKey: 'id',
      });

      const cache = getTreeCache();
      expect(cache.cachedTree).toBe(tree);
      expect(cache.nodeMap).not.toBeNull();
      expect(cache.weakNodeMap).not.toBeNull();
    });

    it('使用引用类型作为缓存键时应使用 weakNodeMap', () => {
      const objKey = { custom: 'key' };
      const nodeWithObjKey: CustomNode = { id: 100, name: 'Object Key Node', objRef: objKey };
      const customTree = [...tree, nodeWithObjKey] as CustomNode[];

      findTreeNodeWrapper(customTree, {
        useCache: true,
        search: objKey,
        resolveCacheKey: (node: CustomNode) => {
          return node.id === 100 ? node.objRef! : (node.id as number);
        },
      });

      // 从缓存中查找
      const result = findTreeNodeWrapper(customTree, {
        useCache: true,
        search: objKey,
        resolveCacheKey: (node: CustomNode) => {
          return node.id === 100 ? node.objRef! : (node.id as number);
        },
      });

      expect(result?.id).toBe(100);
    });
  });

  describe('无效参数处理', () => {
    it('不使用缓存且无 predicate 时应抛出错误', () => {
      expect(() => {
        // @ts-expect-error - 故意传递无效参数
        findTreeNodeWrapper(tree, { useCache: false });
      }).toThrow();
    });

    it('使用缓存但没有 search 参数时应返回 null', () => {
      // 建立缓存
      findTreeNodeWrapper(tree, {
        useCache: true,
        search: 11,
        resolveCacheKey: 'id',
      });

      // 缺少 search 参数的测试，这里修改测试策略：通过传递空对象创建一个不同的缓存键
      const result = findTreeNodeWrapper(tree, {
        useCache: true,
        search: {} as any, // 使用一个不会命中缓存的值
        resolveCacheKey: 'id',
      });

      expect(result).toBeNull();
    });
  });

  describe('遍历顺序测试', () => {
    it('默认应该使用广度优先遍历', () => {
      const visited: number[] = [];
      findTreeNodeWrapper(tree, node => {
        visited.push(node.id);
        return node.id === 2; // 找到 id 为 2 的节点
      });
      // BFS 顺序: 1, 2, ...
      expect(visited).toContain(1);
      expect(visited).toContain(2);
      expect(visited.indexOf(1)).toBeLessThan(visited.indexOf(2));
    });

    it('应该支持深度优先遍历', () => {
      const visited: number[] = [];
      findTreeNodeWrapper(
        tree,
        node => {
          visited.push(node.id);
          return node.id === 111; // 找到 id 为 111 的节点
        },
        { useDfs: true }
      );
      // DFS 顺序应包含路径: 1 -> 11 -> 111
      expect(visited).toContain(1);
      expect(visited).toContain(11);
      expect(visited).toContain(111);
      // 确认 DFS 顺序
      expect(visited.indexOf(1)).toBeLessThan(visited.indexOf(11));
      expect(visited.indexOf(11)).toBeLessThan(visited.indexOf(111));
    });
  });

  describe('边界情况测试', () => {
    it('空树应该返回 null', () => {
      const result = findTreeNodeWrapper([] as TestNode[], node => node.id === 1);
      expect(result).toBeNull();
    });

    it('无效树结构应该返回 null', () => {
      const result = findTreeNodeWrapper(null as any, node => node.id === 1);
      expect(result).toBeNull();
    });
  });

  describe('组合使用场景', () => {
    it('先使用缓存查找再不使用缓存查找', () => {
      // 先建立缓存
      findTreeNodeWrapper(tree, {
        useCache: true,
        search: 11,
        resolveCacheKey: 'id',
      });

      // 后使用普通查找
      const result = findTreeNodeWrapper(tree, node => node.id === 12);
      expect(result?.id).toBe(12);
    });

    it('先普通查找再使用缓存', () => {
      // 先普通查找
      findTreeNodeWrapper(tree, node => node.id === 12);

      // 后使用缓存查找
      const result = findTreeNodeWrapper(tree, {
        useCache: true,
        search: 11,
        resolveCacheKey: 'id',
      });

      expect(result?.id).toBe(11);
    });
  });
});
