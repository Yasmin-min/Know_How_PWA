const rotas = {
  login: "/login",
  inicio: "/",
  cadastroPerfil: "/cadastro/perfil",
  cadastroAluno: "/cadastro/aluno",
  cadastroProfessor: "/cadastro/professor",
  recuperarSenha: "/recuperar-senha",
  termos: "/termos",
  privacidade: "/privacidade",
  professores: "/professores",
  professorPerfilPublico: "/professores/:id",
  conversas: "/conversas",
  configuracoes: "/configuracoes",
  aulasAluno: "/aulas",
  professorPainel: "/professor",
  professorAulas: "/professor/aulas",
  professorCatalogo: "/professor/catalogo",
  professorAulaNova: "/professor/catalogo/nova",
  professorAulaEditar: "/professor/catalogo/:id/editar",
  professorAlunos: "/professor/alunos",
  professorAgenda: "/professor/agenda",
  professorMensagens: "/professor/mensagens",
  professorPlanos: "/professor/planos",
  professorAvaliacoes: "/professor/avaliacoes",
  professorConfiguracoes: "/professor/configuracoes",
  professorPerfil: "/professor/perfil",
  chamada: "/aula/:id/sala",
};

export default rotas;

export function rotaEditarAula(id: number): string {
  return rotas.professorAulaEditar.replace(":id", String(id));
}

export function rotaPerfilProfessor(id: string | number): string {
  return rotas.professorPerfilPublico.replace(":id", String(id));
}

export function rotaChamada(aulaId: string): string {
  return rotas.chamada.replace(":id", aulaId);
}
