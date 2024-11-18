import type { TreeNode, Iterator } from './tree.type'
import { eachTree } from './eachTree'

/**
 * 查找所有符合条件的节点
 * @param tree 数组
 * @param iterator 迭代函数
 * @returns 
 */
export function findTreeAll<T extends TreeNode>(tree: Array<T>, iterator: Iterator<T, boolean>): Array<T> {
    let result: Array<T> = [];
    eachTree(tree, (item, options) => {
        if (iterator(item, options)) {
            result.push(item!);
        }
    });

    return result;
}