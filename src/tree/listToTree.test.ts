import { describe, expect, it } from 'vitest';
import { listToTree } from './listToTree';
import type { TreeNode } from './tree.type';

interface TestNode extends TreeNode {
  id: number | string;
  name: string;
  parentId?: number | string;
}

describe('listToTree', () => {
  // 基础测试数据
  const mockList: TestNode[] = [
    { id: 1, name: 'Node 1' },
    { id: 11, name: 'Node 1-1', parentId: 1 },
    { id: 12, name: 'Node 1-2', parentId: 1 },
    { id: 2, name: 'Node 2' },
    { id: 21, name: 'Node 2-1', parentId: 2 },
    { id: 111, name: 'Node 1-1-1', parentId: 11 },
  ];

  describe('基本功能测试', () => {
    it('应该正确处理空数组', () => {
      const result = listToTree([]);
      expect(result).toEqual([]);
    });

    it('应该正确处理单层列表', () => {
      const list = [
        { id: 1, name: 'Node 1' },
        { id: 2, name: 'Node 2' },
      ];
      const result = listToTree(list);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });

    it('应该正确构建多层树结构', () => {
      const result = listToTree(mockList, item => item.parentId as number);

      expect(result).toHaveLength(2);
      expect(result[0].children).toBeDefined();
      expect(result[0].children?.length).toBe(2);
      expect(result[0].children?.[0].children?.[0].id).toBe(111);
    });
  });

  describe('自定义 getId 函数测试', () => {
    it('应该支持自定义 getId 函数', () => {
      const customList = [
        { id: 1, key: 'root', name: 'Root' },
        { id: 2, key: 'child', parentKey: 'root', name: 'Child' },
      ];

      const result = listToTree(customList, item => item.parentKey || item.key);

      expect(result).toHaveLength(1);
      expect(result[0].children).toBeDefined();
      expect(result[0].children?.[0].name).toBe('Child');
    });

    it('应该处理无效的 getId 返回值', () => {
      const result = listToTree(
        mockList,
        // @ts-expect-error 测试无效返回值
        () => undefined
      );
      expect(result).toHaveLength(mockList.length);
    });
  });

  describe('transform 函数测试', () => {
    interface TransformedNode extends TreeNode {
      id: number | string;
      title: string;
      value: number | string;
    }

    it('应该正确转换节点格式', () => {
      const result = listToTree<TestNode, TransformedNode>(
        mockList,
        item => item.parentId as number,
        item => ({
          id: item.id,
          title: item.name,
          value: item.id,
        })
      );

      expect(result[0].title).toBeDefined();
      expect(result[0].name).toBeUndefined();
      expect(result[0].value).toBe(result[0].id);
    });
  });

  describe('特殊情况处理', () => {
    it('应该正确处理根节点 id 为 0 的情况', () => {
      const listWithZeroRoot = [
        { id: 0, name: 'Root' },
        { id: 1, name: 'Child', parentId: 0 },
      ];

      const result = listToTree(listWithZeroRoot, item => item.parentId as number);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(0);
      expect(result[0].children?.[0].id).toBe(1);
    });

    it('应该正确处理根节点 id 为 -1 的情况', () => {
      const listWithNegativeRoot = [
        { id: -1, name: 'Root' },
        { id: 1, name: 'Child', parentId: -1 },
      ];

      const result = listToTree(listWithNegativeRoot, item => item.parentId as number);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(-1);
    });

    it('应该正确处理字符串类型的 id', () => {
      const listWithStringIds = [
        { id: '1', name: 'Root' },
        { id: '1-1', name: 'Child', parentId: '1' },
      ];

      const result = listToTree(listWithStringIds, item => item.parentId as string);
      expect(result).toHaveLength(1);
      expect(result[0].children?.[0].id).toBe('1-1');
    });

    it('应该正确处理循环引用', () => {
      const circularList = [
        { id: 1, name: 'Node 1', parentId: 2 },
        { id: 2, name: 'Node 2', parentId: 1 },
      ];

      const result = listToTree(circularList, item => item.parentId as number);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBeTruthy();
    });
  });

  describe('边界情况测试', () => {
    it('应该处理无效的父节点引用', () => {
      const listWithInvalidParent = [
        { id: 1, name: 'Node 1' },
        { id: 2, name: 'Node 2', parentId: 999 },
      ];

      const result = listToTree(listWithInvalidParent, item => item.parentId as number);
      expect(result).toHaveLength(2);
    });

    it('应该处理空字符串 id', () => {
      const listWithEmptyId = [
        { id: '', name: 'Empty ID' },
        { id: '1', name: 'Valid ID' },
      ];

      const result = listToTree(listWithEmptyId);
      expect(result).toHaveLength(2);
    });

    it('应该正确处理重复的 id', () => {
      const listWithDuplicateIds = [
        { id: 1, name: 'First Node' },
        { id: 1, name: 'Duplicate Node' },
      ];

      const result = listToTree(listWithDuplicateIds);
      expect(result).toBeDefined();
    });
  });

  describe('性能测试', () => {
    it('应该能处理大量数据', () => {
      const largeList: TestNode[] = Array.from({ length: 1000 }, (_, index) => ({
        id: index,
        name: `Node ${index}`,
        parentId: index > 0 ? Math.floor((index - 1) / 2) : undefined,
      }));

      const result = listToTree(largeList, item => item.parentId as number);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBeTruthy();
    });
  });
});
