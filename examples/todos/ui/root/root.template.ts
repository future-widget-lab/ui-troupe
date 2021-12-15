import { html } from "lit-html";
import { css } from "@emotion/css";
import { ISystemState } from "../../../../dist/createRenderer";

import "../normalize.css";
import { TitleTemplate } from "../title";
import { CreateToDoTemplate } from "../create-todo";
import { ToDosListTemplate } from "../todos-list";
import { IUiContext, IUiEvent } from "./root.machine";
import { IAppContext, IAppEvent } from "../../app";

const rootTemplateStyles = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: black;
  height: 100%;
`;

const wrapperStyles = css`
  width: 100%;
  max-width: 500px;
`;

function RootTemplate(
  props: ISystemState<IUiContext, IUiEvent, IAppContext, IAppEvent>
) {
  return html`<div class=${rootTemplateStyles}>
    <div class=${wrapperStyles}>
      ${TitleTemplate()} ${CreateToDoTemplate(props)}
      ${ToDosListTemplate(props)}
    </div>
  </div>`;
}

export default RootTemplate;
