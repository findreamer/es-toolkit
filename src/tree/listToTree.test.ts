import { describe, expect, it } from 'vitest';
import { listToTree } from '@tree/listToTree';
import type { TreeNode } from '@tree/tree.type';

describe('listToTree', () => {
  // 基础节点接口
  interface TestNode extends TreeNode {
    id: number | string;
    parentId: number | string | null;
    name: string;
    children?: TestNode[];
  }

  describe('基础功能测试', () => {
    it('应该正确转换基础列表到树结构', () => {
      const list: TestNode[] = [
        { id: '1', parentId: null, name: '节点1' },
        { id: '1-1', parentId: '1', name: '节点1-1' },
        { id: '1-2', parentId: '1', name: '节点1-2' },
        { id: '2', parentId: null, name: '节点2' },
      ];

      const tree = listToTree(list);

      expect(tree).toHaveLength(2);
      expect(tree[0].children).toHaveLength(2);
      expect(tree[1].children).toBeUndefined();
    });

    it('应该处理空列表', () => {
      const list: TestNode[] = [];
      const tree = listToTree(list);
      expect(tree).toEqual([]);
    });
  });

  describe('自定义 key 测试', () => {
    interface CustomNode extends TreeNode {
      nodeId: number;
      pid: number | null;
      title: string;
      subNodes?: CustomNode[];
    }

    it('应该支持自定义 id 和 parentId 字段', () => {
      const list: CustomNode[] = [
        { nodeId: 1, pid: null, title: '节点1' },
        { nodeId: 2, pid: 1, title: '节点2' },
      ];

      const tree = listToTree(list, {
        resolveId: 'nodeId',
        resolveParentId: 'pid',
        childrenKey: 'subNodes',
      });

      expect(tree[0].nodeId).toBe(1);
      expect(tree[0].subNodes?.[0].nodeId).toBe(2);
    });

    it('应该支持函数形式的 id 和 parentId 解析', () => {
      const list: CustomNode[] = [
        { nodeId: 1, pid: null, title: '节点1' },
        { nodeId: 2, pid: 1, title: '节点2' },
      ];

      const tree = listToTree(list, {
        resolveId: node => node.nodeId,
        resolveParentId: node => node.pid,
        childrenKey: 'subNodes',
      });

      expect(tree[0].nodeId).toBe(1);
      expect(tree[0].subNodes?.[0].nodeId).toBe(2);
    });
  });

  describe('节点转换测试', () => {
    it('应该支持节点转换函数', () => {
      const list: TestNode[] = [
        { id: '1', parentId: null, name: '节点1' },
        { id: '1-1', parentId: '1', name: '节点1-1' },
      ];

      interface TransformedNode {
        value: string;
        label: string;
        children?: TransformedNode[];
      }

      const tree = listToTree<TestNode, TransformedNode>(list, {
        transform: node =>
          ({
            value: node.id,
            label: node.name,
          }) as TransformedNode,
      });

      expect(tree[0].value).toBe('1');
      expect(tree[0].label).toBe('节点1');
      expect(tree[0].children?.[0].value).toBe('1-1');
    });
  });

  describe('特殊场景测试', () => {
    it('应该处理无效的父节点引用', () => {
      const list: TestNode[] = [
        { id: '1', parentId: null, name: '节点1' },
        { id: '2', parentId: '999', name: '节点2' }, // 父节点不存在
        { id: '3', parentId: '2', name: '节点3' }, // 父节点存在但其父节点无效
      ];

      const tree = listToTree(list);
      // 检查树的基本结构
      expect(tree).toBeDefined();
      expect(tree).toHaveLength(3);
      // 检查节点都在根级
      const rootIds = tree.map(node => node.id);
      expect(rootIds).toContain('1');
      expect(rootIds).toContain('2');
      expect(rootIds).toContain('3');
    });

    it('应该处理循环引用', () => {
      const list: TestNode[] = [
        { id: '1', parentId: '2', name: '节点1' },
        { id: '2', parentId: '1', name: '节点2' }, // 形成循环引用
      ];

      const tree = listToTree(list);
      expect(tree).toBeDefined();
      expect(tree).toHaveLength(2);
      // 检查是否避免了循环引用
      tree.forEach(node => {
        expect(node.children || []).toHaveLength(0);
      });
    });

    it('应该处理无效的 id 或 parentId', () => {
      const list = [
        { id: undefined, parentId: null, name: '节点1' },
        { id: '2', parentId: undefined, name: '节点2' },
        { id: '3', parentId: null, name: '节点3' },
      ] as unknown as TestNode[];

      const tree = listToTree(list);
      expect(tree).toBeDefined();
      // 检查有效节点是否被正确处理
      const validNodes = tree.filter(node => node.id && typeof node.id !== 'undefined');
      expect(validNodes.length).toBeGreaterThan(0);
      // 检查节点结构完整性
      validNodes.forEach(node => {
        expect(node).toHaveProperty('name');
        expect(node.children === undefined || Array.isArray(node.children)).toBeTruthy();
      });
    });

    it('应该正确处理 transform 函数在特殊场景下的行为', () => {
      const list: TestNode[] = [
        { id: '1', parentId: null, name: '节点1' },
        { id: '2', parentId: '999', name: '节点2' }, // 无效父节点
      ];

      interface TransformedNode {
        value: string;
        label: string;
        depth: number;
        children?: TransformedNode[];
      }

      const tree = listToTree<TestNode, TransformedNode>(list, {
        transform: ({ node, level }) => ({
          value: node.id,
          label: node.name,
          depth: level,
        }),
      });

      expect(tree).toHaveLength(2);
      // 检查转换结果
      tree.forEach(node => {
        expect(node).toHaveProperty('value');
        expect(node).toHaveProperty('label');
        expect(node).toHaveProperty('depth');
        expect(node.depth).toBe(1); // 应该都是根节点
      });
    });

    it('应该处理多层级的无效引用', () => {
      const list: TestNode[] = [
        { id: '1', parentId: null, name: '节点1' },
        { id: '2', parentId: '1', name: '节点2' },
        { id: '3', parentId: '999', name: '节点3' }, // 无效父节点
        { id: '4', parentId: '3', name: '节点4' }, // 父节点是无效引用的节点
      ];

      const tree = listToTree(list);
      expect(tree).toBeDefined();

      // 检查节点1和节点2的关系正确
      const node1 = tree.find(node => node.id === '1');
      expect(node1?.children).toBeDefined();
      expect(node1?.children?.[0].id).toBe('2');

      // 检查无效引用的节点是否在根级
      const rootIds = tree.map(node => node.id);
      expect(rootIds).toContain('3');
      expect(rootIds).toContain('4');
    });
  });

  describe('复杂场景测试', () => {
    it('应该正确处理多层级树结构', () => {
      const list: TestNode[] = [
        { id: '1', parentId: null, name: '层级1' },
        { id: '1-1', parentId: '1', name: '层级1-1' },
        { id: '1-1-1', parentId: '1-1', name: '层级1-1-1' },
        { id: '1-2', parentId: '1', name: '层级1-2' },
        { id: '2', parentId: null, name: '层级2' },
      ];

      const tree = listToTree(list);

      expect(tree).toHaveLength(2);
      expect(tree[0].children?.[0].children?.[0].name).toBe('层级1-1-1');
      expect(tree[0].children).toHaveLength(2);
    });

    it('应该支持混合类型的 id 和 parentId', () => {
      const list: TestNode[] = [
        { id: 1, parentId: null, name: '节点1' },
        { id: '2', parentId: 1, name: '节点2' },
      ] as unknown as TestNode[];

      const tree = listToTree(list);
      expect(tree[0].children?.[0].name).toBe('节点2');
    });
  });

  describe('性能测试', () => {
    it('应该能处理大量数据', () => {
      const list: TestNode[] = Array.from({ length: 1000 }, (_, i) => ({
        id: i.toString(),
        parentId: i === 0 ? null : Math.floor((i - 1) / 2).toString(),
        name: `节点${i}`,
      }));

      const startTime = performance.now();
      const tree = listToTree(list);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // 应该在100ms内完成
      expect(tree).toBeDefined();
    });
  });

  describe('应该支持自定义业务规则处理', () => {
    const options = [
      {
        label: '非产品类合同',
        value: '1',
      },
      {
        label: '融资类合同',
        value: '1-1',
      },
      {
        label: 'ABS项目',
        value: '1-2',
      },
      {
        label: '金融债项目',
        value: '1-3',
      },
      {
        label: '银团项目',
        value: '1-3-1',
      },
      {
        label: '非产品类',
        value: '2',
      },
      {
        label: '保险类',
        value: '1-1',
      },
      {
        label: '担保类',
        value: '1-2',
      },
    ];
    it('支持自定义查找parentId', () => {
      const treeOptions: typeof options = listToTree(options, {
        resolveId: 'value',
        resolveParentId: node => {
          const idx = node.value.lastIndexOf('-');
          return node.value.substring(0, idx);
        },
      });

      expect(treeOptions).toBeDefined();
      expect(treeOptions.map(node => node.value)).toEqual(['1', '2']);
    });
  });

  describe('应该支持自定义节点转换函数', () => {
    const menus = [
      {
        label: '主页',
        path: '/home',
      },
      {
        label: '合同列表',
        path: '/contract',
      },
      {
        label: '新建合同',
        path: '/contract/create',
      },
      {
        label: '合同详情',
        path: '/contract/:id',
      },
      {
        label: '编辑合同',
        path: '/contract/:id/edit',
      },
      {
        label: '系统设置',
        path: '/setting',
      },
    ];
    it('支持自定义节点转换', () => {
      const menusTree: typeof any = listToTree(menus, {
        resolveId: 'path',
        resolveParentId: node => {
          const dynamicRoute = /\/:([^\/\s]+)/g.exec(node.path);
          // 将动态路由菜单归为耳机
          if (dynamicRoute) {
            return node.path.substring(0, dynamicRoute.index) as string;
          }

          const idx = node.path.lastIndexOf('/');
          return node.path.substring(0, idx) as string;
        },

        transform: nodeInfo => {
          const { node, ...rest } = nodeInfo;
          return {
            ...node,
            breadcampName: rest.paths.reduce<string[]>((acc, cur) => acc.concat(cur.label), []).join(),
          };
        },
      });

      expect(menusTree).toBeDefined();
      console.table(menusTree);
      expect(menusTree.map((node: any) => node.label)).toEqual(['主页', '合同列表', '系统设置']);
      expect(menusTree[1].children.length).toEqual(3);
      expect(menusTree[1][1].breadcampName).toEqual('合同列表/新建合同');
    });
  });
});
