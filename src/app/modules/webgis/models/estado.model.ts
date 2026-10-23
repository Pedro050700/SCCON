export interface Estado {
  id: number;
  sigla: string;
  nome: string;
  regiao: {
    id: number;
    sigla: string;
    nome: string;
  };
}

export interface PropriedadesEstado {
  codarea: string;
  nome: string;
  sigla: string;
  regiao: string;
}
