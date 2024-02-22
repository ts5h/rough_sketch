import React, { FC } from "react";
import { ReturnToHome } from "./components/ReturnToHome";
import { GitHub } from "./components/GitHub";
import { Curve } from "./components/Curve";
import "./scss/App.scss";

export const App: FC = () => (
  <div className="App">
    <ReturnToHome theme="light" />
    <GitHub theme="light" />
    <Curve />
  </div>
);
