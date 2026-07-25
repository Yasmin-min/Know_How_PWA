import { BrowserRouter, Route, Routes } from "react-router-dom";
import BaseGeral from "./base/BaseGeral";
import RotaProtegida from "./base/RotaProtegida";
import Inicio from "./pages/Inicio";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Professores from "./pages/Professores";
import rotas from "./config/rotas";
import { TipoUsuario } from "./types/auth";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Login />} path={rotas.login} />
        <Route element={<Cadastro />} path={rotas.cadastroPerfil} />

        <Route element={<BaseGeral />}>
          <Route element={<Inicio />} path={rotas.inicio} />

          <Route element={<RotaProtegida tiposPermitidos={[TipoUsuario.Aluno]} />}>
            <Route element={<Professores />} path={rotas.professores} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
