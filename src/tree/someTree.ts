
import type { TreeNode, Iterator } from './tree.type'
import { everyTree } from '.';

/**
 * 判断树中是否有满足条件的节点
 * @param tree 
 * @param iteator 
 * @returns boolean
 */
export function someTree<T extends TreeNode>(tree: Array<T>, iteator: Iterator<T, boolean>): boolean {
    let result = false;
    everyTree(tree, (item, options) => {
        if (iteator(item, options)) {
            result = true;
            return false;
        }
        return true;
    });
    return result;
}