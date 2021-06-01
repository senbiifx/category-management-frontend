export interface CategoryNode{
    categoryId: number | null;
    name: string;
    parentId: number | null;
    children: CategoryNode[];
}