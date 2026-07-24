import { BrowserRouter, Route, Routes } from "react-router-dom";
import BaseGeral from "./base/BaseGeral";
import Inicio from "./pages/Inicio";
import Login from "./pages/Login";
import rotas from "./config/rotas";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Login />} path={rotas.login} />

        <Route element={<BaseGeral />}>
          <Route element={<Inicio />} path={rotas.inicio} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
