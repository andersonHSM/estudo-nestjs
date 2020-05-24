export interface UserPatch {
  nome?: string;
  sobrenome?: string;
  password?: string;
  email?: string;
  is_provider?: boolean;
  avatar_id?: number;
}
