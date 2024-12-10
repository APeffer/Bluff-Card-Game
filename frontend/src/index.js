import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import React from "react";
import ReactDOM from "react-dom";
import HomePage from "./components/homepage/HomePage";
import NavBar from "./components/navbar/NavBar";
import Login from "./components/login/Login";
import SignUp from "./components/signup/SignUp";
import Scene from "./components/Scene";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GameBoard from "./components/gameboard/Gameboard";

const App = () => {
  return (
    <Router>
      <div>
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/scene" element={<Scene />} />
          <Route path="/game-board" element={<GameBoard />} />
        </Routes>
      </div>
    </Router>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
