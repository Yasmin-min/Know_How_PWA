import { BrowserRouter, Route, Routes } from "react-router-dom";
import BaseGeral from "./base/BaseGeral";
import BaseProfessor from "./base/BaseProfessor";
import RotaProtegida from "./base/RotaProtegida";
import Inicio from "./pages/Inicio";
import Login from "./pages/Login";
import RecuperarSenha from "./pages/RecuperarSenha";
import Cadastro from "./pages/Cadastro";
import CadastroAluno from "./pages/CadastroAluno";
import CadastroProfessor from "./pages/CadastroProfessor";
import Professores from "./pages/Professores";
import AlunoConfiguracoes from "./pages/AlunoConfiguracoes";
import AlunoConversas from "./pages/AlunoConversas";
import AlunoAulas from "./pages/AlunoAulas";
import Chamada from "./pages/Chamada";
import ProfessorPerfilPublico from "./pages/ProfessorPerfilPublico";
import ProfessorDashboard from "./pages/ProfessorDashboard";
import ProfessorNovaAula from "./pages/ProfessorNovaAula";
import ProfessorConfiguracoes from "./pages/ProfessorConfiguracoes";
import ProfessorMensagens from "./pages/ProfessorMensagens";
import ProfessorAvaliacoes from "./pages/ProfessorAvaliacoes";
import ProfessorMinhasAulas from "./pages/ProfessorMinhasAulas";
import ProfessorAgenda from "./pages/ProfessorAgenda";
import ProfessorCatalogo from "./pages/ProfessorCatalogo";
import ProfessorMeuPerfil from "./pages/ProfessorMeuPerfil";
import ProfessorAlunos from "./pages/ProfessorAlunos";
import ProfessorPlanos from "./pages/ProfessorPlanos";
import Termos from "./pages/Legal/Termos";
import Privacidade from "./pages/Legal/Privacidade";
import rotas from "./config/rotas";
import { TipoUsuario } from "./types/auth";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Inicio />} path={rotas.inicio} />
        <Route element={<Login />} path={rotas.login} />
        <Route element={<RecuperarSenha />} path={rotas.recuperarSenha} />
        <Route element={<Termos />} path={rotas.termos} />
        <Route element={<Privacidade />} path={rotas.privacidade} />
        <Route element={<Cadastro />} path={rotas.cadastroPerfil} />
        <Route element={<CadastroAluno />} path={rotas.cadastroAluno} />
        <Route element={<CadastroProfessor />} path={rotas.cadastroProfessor} />

        <Route element={<RotaProtegida tiposPermitidos={[TipoUsuario.Aluno, TipoUsuario.Professor]} />}>
          <Route element={<Chamada />} path={rotas.chamada} />
        </Route>

        <Route element={<BaseGeral />}>
          <Route element={<RotaProtegida tiposPermitidos={[TipoUsuario.Aluno]} />}>
            <Route element={<Professores />} path={rotas.professores} />
            <Route element={<ProfessorPerfilPublico />} path={rotas.professorPerfilPublico} />
            <Route element={<AlunoConversas />} path={rotas.conversas} />
            <Route element={<AlunoAulas />} path={rotas.aulasAluno} />
            <Route element={<AlunoConfiguracoes />} path={rotas.configuracoes} />
          </Route>
        </Route>

        <Route element={<RotaProtegida tiposPermitidos={[TipoUsuario.Professor]} />}>
          <Route element={<BaseProfessor />}>
            <Route element={<ProfessorDashboard />} path={rotas.professorPainel} />
            <Route element={<ProfessorMinhasAulas />} path={rotas.professorAulas} />
            <Route element={<ProfessorCatalogo />} path={rotas.professorCatalogo} />
            <Route element={<ProfessorNovaAula key="nova" />} path={rotas.professorAulaNova} />
            <Route element={<ProfessorNovaAula key="editar" />} path={rotas.professorAulaEditar} />
            <Route element={<ProfessorAlunos />} path={rotas.professorAlunos} />
            <Route element={<ProfessorAgenda />} path={rotas.professorAgenda} />
            <Route element={<ProfessorMensagens />} path={rotas.professorMensagens} />
            <Route element={<ProfessorPlanos />} path={rotas.professorPlanos} />
            <Route element={<ProfessorAvaliacoes />} path={rotas.professorAvaliacoes} />
            <Route element={<ProfessorConfiguracoes />} path={rotas.professorConfiguracoes} />
            <Route element={<ProfessorMeuPerfil />} path={rotas.professorPerfil} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
