export interface UserCreate {
  nome: string;
  sobrenome: string;
  password?: string;
  password_hash?: string;
  email: string;
}
