export interface UserCreate {
  nome: string;
  sobrenome: string;
  password?: string;
  email: string;
  is_provider?: boolean;
  provedor_info?: ProvedorInfo;
}

export interface ProvedorInfo {
  horario_inicio: string;
  horario_fim: string;
  inicio_intervalo: string;
  fim_intervalo: string;
}
