export interface UserPatch {
  nome?: string;
  sobrenome?: string;
  password?: string;
  password_hash?: string;
  email?: string;
  is_provider?: boolean;
}
