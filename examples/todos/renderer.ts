import { render } from "lit-html";
import { createRenderer } from "../../dist";

import { IAppContext, IAppEvent } from "./app";
import { IUiContext, IUiEvent, RootTemplate } from "./ui";

const Renderer = createRenderer<IUiContext, IUiEvent, IAppContext, IAppEvent>(
  (props) => {
    const ui = RootTemplate(props);

    const element = window.document.getElementById("app");

    render(ui, element);
  }
);

export default Renderer;
