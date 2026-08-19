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
  areaInteresse?: string;
  areaEspecialidade?: string;
  anosExperiencia?: string;
  miniBiografia?: string;
  fotoPerfilBase64?: string;
}

export interface EditarUsuarioRequest {
  usuarioId: number;
  userEditado: UsuarioDTO;
}

export interface SolicitarRecuperacaoSenhaRequest {
  email: string;
}

export interface SolicitarRecuperacaoSenhaResponse {
  mensagem: string;
}

export interface ConfirmarCodigoRecuperacaoRequest {
  email: string;
  codigo: string;
}

export interface ConfirmarCodigoRecuperacaoResponse {
  tokenRedefinicao: string;
}

export interface RedefinirSenhaRequest {
  email: string;
  tokenRedefinicao: string;
  novaSenha: string;
}

export interface RedefinirSenhaResponse {
  mensagem: string;
}
