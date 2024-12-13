import { beforeEach, describe, expect, it, vi } from 'vitest';
import { eachTree } from './eachTree';
import type { TreeNode } from './tree.type';

interface TestNode extends TreeNode {
  id: number;
}

describe('eachTree', () => {
  let iterator: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    iterator = vi.fn();
  });

  // 基础测试数据
  const basicTree: TestNode[] = [
    {
      id: 1,
      children: [
        { id: 2 },
        {
          id: 3,
          children: [{ id: 4 }],
        },
      ],
    },
    { id: 5 },
  ];

  it('应该正确遍历树结构', () => {
    const result: number[] = [];
    iterator.mockImplementationOnce((item: TestNode) => {
      result.push(item.id);
    });

    eachTree(basicTree, iterator);
    expect(result).toEqual([1, 2, 3, 4, 5]);
    expect(iterator).toHaveBeenCalledTimes(5);
  });

  it('应该提供正确的层级信息', () => {
    const levels: number[] = [];
    eachTree(basicTree, (_, options) => {
      levels.push(options.level);
    });
    expect(levels).toEqual([1, 2, 2, 3, 1]);
  });

  it('应该提供正确的索引路径', () => {
    const indexPaths: number[][] = [];
    eachTree(basicTree, (_, options) => {
      indexPaths.push(options.indexes);
    });
    expect(indexPaths).toEqual([[0], [0, 0], [0, 1], [0, 1, 0], [1]]);
  });

  it('当传入 break 时应该停止遍历', () => {
    const result: number[] = [];
    iterator.mockImplementationOnce((item: TestNode) => {
      result.push(item.id);
      if (item.id === 2) {
        return 'break';
      }
    });

    eachTree(basicTree, iterator);
    expect(result).toEqual([1, 2]);
  });

  it('当传入 continue 时应该跳过当前节点的子节点', () => {
    const result: number[] = [];
    iterator.mockImplementationOnce((item: TestNode) => {
      result.push(item.id);
      if (item.id === 3) {
        return 'continue';
      }
    });
    eachTree(basicTree, iterator);
    expect(result).toEqual([1, 2, 3, 5]);
    expect(iterator).toHaveBeenCalledTimes(4);
  });

  // 边界场景测试
  it('当传入空数组时不应该报错', () => {
    expect(() => eachTree([], iterator)).not.toThrow();
    expect(iterator).not.toBeCalled();
  });

  it('当传入非数组时应该抛出错误', () => {
    // @ts-expect-error 测试非法输入
    expect(() => eachTree({}, iterator)).toThrow('tree must be an array');
  });

  it('当传入非函数迭代器时应该抛出错误', () => {
    // @ts-expect-error 测试非法输入
    expect(() => eachTree([], 'not a function')).toThrow('iterator must be a function');
  });

  it('应该处理没有 children 属性的节点', () => {
    const treeWithoutChildren: TestNode[] = [{ id: 1 }, { id: 2, children: [] }];
    const result: number[] = [];
    eachTree(treeWithoutChildren, (item: TestNode) => {
      result.push(item.id);
    });
    expect(result).toEqual([1, 2]);
  });

  it('应该处理 children 为 null 的情况', () => {
    const treeWithNullChildren: TestNode[] = [
      {
        id: 1,
        // @ts-expect-error 测试非法输入
        children: null,
      },
    ];
    const result: number[] = [];
    expect(() => {
      eachTree(treeWithNullChildren, (item: TestNode) => {
        result.push(item.id);
      });
    }).not.toThrow();
    expect(result).toEqual([1]);
  });

  describe('childrenKey 配置测试', () => {
    const customTree = [
      {
        id: 1,
        subNodes: [
          { id: 2 },
          {
            id: 3,
            subNodes: [{ id: 4 }],
          },
        ],
      },
      { id: 5 },
    ];

    it('应该支持自定义子节点属性名', () => {
      const result: number[] = [];
      eachTree(
        customTree,
        item => {
          result.push(item.id);
        },
        { childrenKey: 'subNodes' }
      );
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('使用错误的子节点属性名时应该正常处理', () => {
      const result: number[] = [];
      eachTree(
        customTree,
        item => {
          result.push(item.id);
        },
        { childrenKey: 'wrongKey' }
      );
      expect(result).toEqual([1, 5]);
    });
  });

  it('应该正确使用深度优先遍历', () => {
    const result: number[] = [];
    iterator.mockImplementationOnce((item: TestNode) => {
      result.push(item.id);
    });

    eachTree(basicTree, iterator, { useDfs: true });
    expect(result).toEqual([1, 2, 3, 4, 5]); // 深度优先遍历的顺序
    expect(iterator).toHaveBeenCalledTimes(5);
  });

  it('应该提供正确的层级信息（深度优先遍历）', () => {
    const levels: number[] = [];
    eachTree(
      basicTree,
      (_, options) => {
        levels.push(options.level);
      },
      { useDfs: true }
    );
    expect(levels).toEqual([1, 2, 2, 3, 1]); // 深度优先遍历的层级信息
  });

  it('应该提供正确的索引路径（深度优先遍历）', () => {
    const indexPaths: number[][] = [];
    eachTree(
      basicTree,
      (_, options) => {
        indexPaths.push(options.indexes);
      },
      { useDfs: true }
    );
    expect(indexPaths).toEqual([[0], [0, 0], [0, 1], [0, 1, 0], [1]]); // 深度优先遍历的索引路径
  });

  it('当传入 break 时应该停止深度优先遍历', () => {
    const result: number[] = [];
    iterator.mockImplementationOnce((item: TestNode) => {
      result.push(item.id);
      if (item.id === 2) {
        return 'break';
      }
    });

    eachTree(basicTree, iterator, { useDfs: true });
    expect(result).toEqual([1, 2]); // 深度优先遍历时的结果
  });

  it('当传入 continue 时应该跳过当前节点的子节点（深度优先遍历）', () => {
    const result: number[] = [];
    iterator.mockImplementationOnce((item: TestNode) => {
      result.push(item.id);
      if (item.id === 3) {
        return 'continue';
      }
    });
    eachTree(basicTree, iterator, { useDfs: true });
    expect(result).toEqual([1, 2, 3, 5]); // 深度优先遍历时的结果
    expect(iterator).toHaveBeenCalledTimes(4);
  });
});
