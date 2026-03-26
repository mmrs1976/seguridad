import { MenuOptionEntity } from './menu-option.entity';

export interface RoleEntity {
  id: number;
  name: string;
  code: string;
  description: string | null;
  active: boolean;
  optionIds: number[];
  options?: MenuOptionEntity[];
}