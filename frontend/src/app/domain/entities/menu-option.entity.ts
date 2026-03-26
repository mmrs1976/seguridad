export interface MenuOptionEntity {
  id: number;
  name: string;
  route: string;
  icon: string | null;
  sortOrder: number;
  active: boolean;
  roleIds?: number[];
  roles?: Array<{
    id: number;
    name: string;
    code: string;
  }>;
}