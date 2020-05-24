export interface UsuarioModel {
  id?: number;
  nome?: string;
  sobrenome?: string;
  email?: string;
  is_provider?: boolean;
  password_hash?: string;
}
