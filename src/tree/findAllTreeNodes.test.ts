import { describe, expect, it } from 'vitest';
import { findAllTreeNodes } from './findAllTreeNodes';
import type { TreeNode } from './tree.type';

interface TestNode extends TreeNode {
  id: number;
  name: string;
}

describe('findAllTreeNodes', () => {
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

  it('应该返回空数组当传入空树时', () => {
    const result = findAllTreeNodes([], () => true);
    expect(result).toEqual([]);
  });

  it('应该能找到所有匹配 id 的节点', () => {
    const result = findAllTreeNodes(mockTree, node => node.id > 100);
    expect(result).toHaveLength(2);
    expect(result.map(node => node.id)).toEqual([111, 112]);
  });

  it('应该能找到指定层级的所有节点', () => {
    const result = findAllTreeNodes(mockTree, (_, { level }) => level === 2);
    expect(result).toHaveLength(3);
    expect(result.map(node => node.id)).toEqual([11, 12, 21]);
  });

  it('应该能根据路径信息找到节点', () => {
    const result = findAllTreeNodes(mockTree, (_, { paths }) => paths.some(p => (p as TestNode).id === 11));
    expect(result).toHaveLength(2);
    expect(result.map(node => node.id)).toEqual([111, 112]);
  });

  it('应该能根据索引路径找到节点', () => {
    const result = findAllTreeNodes(mockTree, (_, { indexes }) => indexes[0] === 0);
    expect(result).toHaveLength(4); // Node 1 及其所有子节点
    expect(result.map(node => node.id)).toEqual([1, 11, 111, 112, 12]);
  });

  it('应该能处理单层树结构', () => {
    const flatTree: TestNode[] = [
      { id: 1, name: 'Node 1' },
      { id: 2, name: 'Node 2' },
      { id: 3, name: 'Node 3' },
    ];
    const result = findAllTreeNodes(flatTree, node => node.id > 1);
    expect(result).toHaveLength(2);
    expect(result.map(node => node.id)).toEqual([2, 3]);
  });

  it('当所有节点都不匹配时应该返回空数组', () => {
    const result = findAllTreeNodes(mockTree, () => false);
    expect(result).toEqual([]);
  });

  it('当所有节点都匹配时应该返回所有节点', () => {
    const result = findAllTreeNodes(mockTree, () => true);
    expect(result).toHaveLength(7); // 总共7个节点
  });

  it('应该能正确处理节点属性为空的情况', () => {
    const treeWithEmpty: TestNode[] = [
      {
        id: 1,
        name: 'Node 1',
        children: [
          { id: 11, name: '' },
          { id: 12, name: undefined as unknown as string },
        ],
      },
    ];
    const result = findAllTreeNodes(treeWithEmpty, node => !node.name);
    expect(result).toHaveLength(2);
    expect(result.map(node => node.id)).toEqual([11, 12]);
  });

  it('应该抛出错误当传入非数组参数时', () => {
    // @ts-expect-error 测试非法输入
    expect(() => findAllTreeNodes({}, () => true)).toThrow('tree must be an array');
  });

  it('应该抛出错误当传入非函数断言时', () => {
    // @ts-expect-error 测试非法输入
    expect(() => findAllTreeNodes([], 'not a function')).toThrow('iterator must be a function');
  });
});
