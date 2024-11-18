import type { TreeNode, TreeOptions, Iterator } from './tree.type'
import { isString } from '../predicate/isString'
import { isNumber } from '../compat/predicate/isNumber'
import { eachTree } from './eachTree'
import { everyTree } from './everyTree'

/** 启用缓存 new Map(), 多次重复从一棵树中查找时可大幅提升性能 */
export type CacheOptions<T extends TreeNode> = {
    /** 从缓存 Map 中查找的key，使用 Map.get(value) 匹配 */
    value: number | string;
    /** 构建 Map 时，用户自定义缓存 key 的处理函数，如果不传，则默认取迭代对象的 id */
    resolve?: (item: T, options: Required<TreeOptions<T>>) => string | number;
    /** 匹配到 item 执行副作用函数 */
    foundEffect?: (item: T, options: Required<TreeOptions<T>>) => void;
}

export interface FindTreeCache<T> {
    tree: any | null;
    map: Map<string | number, { data: T, options: Required<TreeOptions<T>> }> | null;
}

const findTreeCache: FindTreeCache<any> = {
    tree: null,
    map: null
}

/**
 *  将迭代对象转换为字符串
 * @param obj - 要转换为字符串的对象。
 * @returns 
 */
function object2string(obj: any): string {
    if (obj === null || obj === undefined) {
        return '';
    }

    if (obj && obj.id !== undefined) {
        return obj.id.toString();
    } else {
        return JSON.stringify(obj);
    }
}
/**
 * 在树中查找满足条件的节点。
 * @param tree - 要搜索的树。
 * @param iterator - 用于测试树中每个节点的函数。
 * @param options - 可选的缓存选项。
 * @returns 找到的第一个满足条件的节点，如果没有找到则返回 null。
 */
export function findTree<T extends TreeNode>(tree: Array<T>, iterator: Iterator<T, boolean>, options?: CacheOptions<T>): T | null {
    const isValidateKey = (value: unknown) => value !== '' && (isString(value) || isNumber(value));

    // 缓存优化
    if (options && isValidateKey(options.value)) {
        const { resolve, value, foundEffect } = options;

        // 如果是第一次查找，初始化缓存
        if (tree !== findTreeCache.tree || !findTreeCache.map) {
            const map: FindTreeCache<T>['map'] = new Map();

            eachTree<T>(tree, (item, opts) => {
                const mapKey = resolve ? resolve(item!, opts!) : object2string(item);

                if (isValidateKey(mapKey)) {
                    map.set(mapKey, { data: item!, options: opts! });
                } else {
                    console.warn(`findTree: resolve 函数返回值必须是字符串或数字，当前返回值为 ${mapKey}`);
                }
            })
            findTreeCache.tree = tree;
            findTreeCache.map = map
        }

        // 从缓存结果中查找
        const cacheResult = findTreeCache.map!.get(value);
        if (cacheResult != null) {
            const { data, options } = cacheResult;

            if (foundEffect) {
                foundEffect(data, options);
            }

            return data;
        }
    }

    let result: T | null = null;
    everyTree<T>(tree, (item, options) => {
        if (iterator(item, options)) {
            result = item!;
            return false;
        }
        return true;
    })

    return result;

}
