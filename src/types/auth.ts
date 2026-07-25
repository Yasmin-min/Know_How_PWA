export const TipoUsuario = {
  Aluno: 0,
  Professor: 1,
} as const;

export type TipoUsuario = (typeof TipoUsuario)[keyof typeof TipoUsuario];

export interface UsuarioDTO {
  id: number;
  nome: string;
  email: string;
  tipoUsuario: TipoUsuario;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse extends UsuarioDTO {
  token: string;
}

export interface RegistroRequest {
  nome: string;
  email: string;
  senha: string;
  tipoUsuario: TipoUsuario;
  dataNascimento: string;
  cpf?: string;
}

export interface EditarUsuarioRequest {
  usuarioId: number;
  userEditado: UsuarioDTO;
}
