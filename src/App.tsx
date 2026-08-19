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
import ProfessorDashboard from "./pages/ProfessorDashboard";
import ProfessorNovaAula from "./pages/ProfessorNovaAula";
import ProfessorEmBreve from "./pages/ProfessorEmBreve";
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
        <Route element={<Cadastro />} path={rotas.cadastroPerfil} />
        <Route element={<CadastroAluno />} path={rotas.cadastroAluno} />
        <Route element={<CadastroProfessor />} path={rotas.cadastroProfessor} />

        <Route element={<BaseGeral />}>
          <Route element={<RotaProtegida tiposPermitidos={[TipoUsuario.Aluno]} />}>
            <Route element={<Professores />} path={rotas.professores} />
          </Route>
        </Route>

        <Route element={<RotaProtegida tiposPermitidos={[TipoUsuario.Professor]} />}>
          <Route element={<BaseProfessor />}>
            <Route element={<ProfessorDashboard />} path={rotas.professorPainel} />
            <Route element={<ProfessorEmBreve />} path={rotas.professorAulas} />
            <Route element={<ProfessorNovaAula />} path={rotas.professorAulaNova} />
            <Route element={<ProfessorEmBreve />} path={rotas.professorAlunos} />
            <Route element={<ProfessorEmBreve />} path={rotas.professorAgenda} />
            <Route element={<ProfessorEmBreve />} path={rotas.professorMensagens} />
            <Route element={<ProfessorEmBreve />} path={rotas.professorPlanos} />
            <Route element={<ProfessorEmBreve />} path={rotas.professorAvaliacoes} />
            <Route element={<ProfessorEmBreve />} path={rotas.professorConfiguracoes} />
            <Route element={<ProfessorEmBreve />} path={rotas.professorPerfil} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
