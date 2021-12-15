import { css } from "@emotion/css";

const typographyStyles = css`
  font-family: Helvetica, Arial, sans-serif;
  color: white;
`;

const buttonStyles = css`
  ${typographyStyles}
  font-size: 0.875em;
  padding: 0.5em 1em;
  background-color: transparent;
  color: white;
  border: 1px solid transparent;
  outline: none;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.16s ease-in, color 0.16s ease-in,
    border-color 0.16s ease-in;

  &:hover:not(:disabled) {
    background-color: white;
    color: black;
  }

  &:focus {
    border-color: white;
  }

  &:active:and(:hover) {
    background-color: #ddd;
  }

  &:disabled {
    color: #ddd;
    cursor: not-allowed;
  }
`;

const inputStyles = css`
  ${typographyStyles}
  background-color: #1a1110;
  padding: 0.5em 1em;
  border-radius: 4px;
  border: none;
  outline: 1px solid transparent;
  transition: outline-color 0.16s ease-in;

  &:focus {
    outline-color: white;
  }
`;

export { typographyStyles, buttonStyles, inputStyles };
