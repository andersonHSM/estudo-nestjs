export interface UserCreate {
  nome: string;
  sobrenome: string;
  password?: string;
  email: string;
  is_provider?: boolean;
}
