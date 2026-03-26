export interface UserEntity {
  id: string;
  name: string;
  email: string;
  active?: boolean;
  emailVerifiedAt?: string | null;
  roleId?: number | null;
  roleName?: string | null;
  roleCode?: string | null;
  token?: string;
  roles?: string[];
}
