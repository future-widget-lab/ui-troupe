import { html } from "lit-html";
import { css } from "@emotion/css";

import { typographyStyles } from "../styles";

const titleStyles = css`
  ${typographyStyles}
  margin-top: 0;
  margin-bottom: 3em;
  text-align: center;
`;

function TitleTemplate() {
  return html`<h1 class=${titleStyles}>XState + lit-html + emotion</h1>`;
}

export default TitleTemplate;
