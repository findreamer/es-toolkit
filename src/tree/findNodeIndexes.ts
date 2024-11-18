import type { TreeNode, Iterator, CacheOptions } from './tree.type'
import { findTree } from './findTree'

/**
 * 在树中查找满足条件的节点的索引。
 * @param tree 
 * @param iterator 
 * @param options 
 * @returns 
 */
export function findNodeIndexes<T extends TreeNode>(tree: Array<T>, iterator: Iterator<T, boolean>, options?: Omit<CacheOptions<T>, 'foundEffect'>): Array<number> | null {
    let indexes: number[] = [];
    const foundEffect: CacheOptions<T>['foundEffect'] = (item, { index, paths, indexes }) => {
        indexes = [index];
        paths = paths.concat();
        paths.unshift({
            children: tree
        } as any);

        for (let i = paths.length - 1; i > 0; i--) {
            const prev = paths[i - 1];
            const current = paths[i];
            indexes.unshift(prev.children!.indexOf(current));
        }
        console.log('idx ==> ', indexes, 'indexes ==> ', indexes)
    }

    findTree(
        tree,
        (item, opts) => {
            if (iterator(item, opts)) {
                foundEffect(item, opts);
                return true;
            }
            return false;
        },
        !options
            ? undefined
            : {
                ...options,
                foundEffect
            }
    );


    return indexes.length ? indexes : null;
}