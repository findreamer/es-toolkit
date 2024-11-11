
export interface TreeItem {
    children?: TreeItem[];
    [property: string]: unknown;
}