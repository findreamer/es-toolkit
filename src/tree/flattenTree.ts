import { eachTree } from '.';
import type { TreeNode, Iterator } from './tree.type';

/**
 * 扁平化树,将树打平变成一维数组，可以传入第二个参数实现打平节点中的其他属性
 * @param tree
 * @param iterator
 * @returns
 */
export function flatternTree<T extends TreeNode>(tree: Array<T>): Array<T>;
export function flatternTree<T extends TreeNode, R>(tree: Array<T>, iterator: Iterator<T, R>): Array<R>;
export function flatternTree<T extends TreeNode, R>(tree: Array<T>, iterator?: Iterator<T, R>): Array<R> {
    let flattenArray: Array<any> = [];
    eachTree(tree, (item, opts) => {
        flattenArray.push(iterator?.(item, opts) ?? item);
    })
    return flattenArray
}