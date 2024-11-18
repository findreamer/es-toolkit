
export interface TreeItem {
    id: number | string;
    children?: Array<TreeItem>;
    [property: string]: unknown;
}

/**
 * 将列表转换为树结构
 * @param list 一个包含 TreeItem 类型元素的数组
 * @param resolveId 一个可选的函数，用于从 TreeItem 中提取唯一标识。默认情况下，使用元素本身的 id 属性。
 * @param iterator 一个可选的函数，用于将 TreeItem 转换为另一种数据格式。默认情况下，不进行转换。
 */
export function listToTree<T extends TreeItem>(list: T[]): T[];
export function listToTree<T extends TreeItem>(list: T[], resolveId: (item: T) => number | string): T[];
export function listToTree<T extends TreeItem, R extends TreeItem>(list: T[], resolveId: (item: T) => number | string, iterator: (item: T) => R): R[];
export function listToTree<T extends TreeItem>(list: T[], resolveId?: (item: T) => number | string): T[];
export function listToTree<T extends TreeItem, R extends TreeItem>(list: T[], resolveId?: (item: T) => number | string, iterator?: (item: T) => R): R[] {
    const map = new Map<number | string, T | R>();
    const result: R[] = [];

    list.forEach((item) => {
        const id = resolveId ? resolveId(item) : item.id;
        const node = iterator ? iterator(item) : item;

        isValidateKey(id) && map.set(id, node);

        if (id === 0 || id === -1 || id == '0' || id == '-1') {
            result.push(node as R);
        } else {
            const parent = map.get(id);
            if (parent) {
                (parent.children || (parent.children = [])).push(node as R);
            } else {
                result.push(node as R);
            }
        }

    });

    return result;
}