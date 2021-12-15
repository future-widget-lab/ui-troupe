import { html } from "lit-html";
import { css } from "@emotion/css";

const spinnerStyles = css`
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 2.25em;
  height: 2.25em;
  border-radius: 50%;
  border-left-color: white;

  animation: spin 1s ease infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }
`;

function SpinnerTemplate() {
  return html` <div class=${spinnerStyles}></div> `;
}

export default SpinnerTemplate;
