export interface MenuOptionEntity {
  id: number;
  name: string;
  route: string | null;
  icon: string | null;
  isGroup?: boolean;
  parentId?: number | null;
  sortOrder: number;
  active: boolean;
  children?: MenuOptionEntity[];
  roleIds?: number[];
  roles?: Array<{
    id: number;
    name: string;
    code: string;
  }>;
}