import { describe, expect, it } from 'vitest';
import { findNodeIndexes } from './findNodeIndexes';
import type { TreeNode } from './tree.type';

describe('findNodeIndexes', () => {
  // 测试数据
  const tree: TreeNode[] = [
    {
      id: 1,
      children: [{ id: 11, children: [{ id: 111 }] }, { id: 12 }],
    },
    {
      id: 2,
      children: [{ id: 21 }, { id: 22, children: [{ id: 221 }] }],
    },
  ];

  it('应该返回 null 当树为空数组时', () => {
    const result = findNodeIndexes([], () => true);
    expect(result).toBeNull();
  });

  it('应该返回 null 当没有找到匹配节点时', () => {
    const result = findNodeIndexes(tree, node => node.id === 999);
    expect(result).toBeNull();
  });

  it('应该返回根级节点的索引', () => {
    const result = findNodeIndexes(tree, node => node.id === 2);
    expect(result).toEqual([1]);
  });

  it('应该返回深层节点的索引路径', () => {
    const result = findNodeIndexes(tree, node => node.id === 111);
    expect(result).toEqual([0, 0, 0]);
  });

  it('应该支持使用缓存选项查找节点', () => {
    const result = findNodeIndexes(tree, node => node.id === 221, {
      cacheKey: 221,
      resolveCacheKey: node => node.id as number,
    });
    expect(result).toEqual([1, 1, 0]);
  });

  it('应该能处理平级树结构', () => {
    const flatTree: TreeNode[] = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const result = findNodeIndexes(flatTree, node => node.id === 2);
    expect(result).toEqual([1]);
  });

  it('应该能处理多层嵌套结构', () => {
    const result = findNodeIndexes(tree, node => node.id === 22);
    expect(result).toEqual([1, 1]);
  });

  it('应该正确处理自定义属性的节点', () => {
    const customTree: TreeNode[] = [
      {
        code: 'A',
        children: [{ code: 'A1' }, { code: 'A2' }],
      },
    ];
    const result = findNodeIndexes(customTree, node => node.code === 'A2');
    expect(result).toEqual([0, 1]);
  });

  it('应该能处理带缓存的复杂查询', () => {
    const result = findNodeIndexes(tree, node => node.id === 12, {
      cacheKey: '12',
      resolveCacheKey: node => String(node.id),
    });
    expect(result).toEqual([0, 1]);
  });
});
