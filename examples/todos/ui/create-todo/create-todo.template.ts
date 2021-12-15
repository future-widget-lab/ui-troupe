import { html } from "lit-html";
import { css } from "@emotion/css";
import { ISystemState } from "../../../../dist";

import { IAppContext, IAppEvent } from "../../app";
import { IUiContext, IUiEvent } from "../root";
import { buttonStyles, inputStyles } from "../styles";
import SpinnerTemplate from "../spinner/spinner.template";

const sectionStyles = css`
  margin-bottom: 3em;
`;

const formStyles = css`
  display: flex;
  flex-direction: row;
  margin-bottom: 0;
  height: 2.5em;
`;

const formInputStyles = css`
  ${inputStyles}
  margin-right: 1em;
  display: flex;
  flex: 1;
`;

function IdleCreateTodoTemplate(
  props: ISystemState<IUiContext, IUiEvent, IAppContext, IAppEvent>
) {
  const {
    ui: {
      context: { createTodoRef }
    }
  } = props;

  const actor = createTodoRef;
  const state = actor.getSnapshot();
  const send = actor.send;

  function handleInput(event: UIEvent) {
    send({
      type: "TITLE_UPDATED",
      payload: {
        title: (event.target as HTMLInputElement).value
      }
    });
  }

  function handleSubmission(event: UIEvent) {
    event.preventDefault();

    send({
      type: "SUBMIT"
    });
  }

  function handleFormReset() {
    send({
      type: "RESET"
    });
  }

  function handleOnKeyDown(event: KeyboardEvent) {
    if (event.code === "Escape") {
      handleFormReset();
    }
  }

  return html`
    <section class=${sectionStyles}>
      <form @submit=${handleSubmission} class=${formStyles}>
        <input
          @input=${handleInput}
          @keydown=${handleOnKeyDown}
          .value=${state.context.title}
          placeholder="🐶 Walk the dog"
          class=${formInputStyles}
        />

        <button type="button" @click=${handleFormReset} class=${buttonStyles}>
          Clear
        </button>
      </form>
    </section>
  `;
}

const spinnerContainerStyles = css`
  width: 72px;
`;

function WaitingForAdditionCreateTodoTemplate(
  props: ISystemState<IUiContext, IUiEvent, IAppContext, IAppEvent>
) {
  const {
    ui: {
      context: { createTodoRef }
    }
  } = props;

  const actor = createTodoRef;
  const state = actor.getSnapshot();

  return html`
    <section class=${sectionStyles}>
      <form disabled="true" class=${formStyles}>
        <input
          .value=${state.context.title}
          placeholder="🐶 Walk the dog"
          disabled="true"
          class=${formInputStyles}
        />

        <div class=${spinnerContainerStyles}>${SpinnerTemplate()}</div>
      </form>
    </section>
  `;
}

function CreateTodoTemplate(
  props: ISystemState<IUiContext, IUiEvent, IAppContext, IAppEvent>
) {
  const {
    ui: {
      context: { createTodoRef }
    }
  } = props;

  const state = createTodoRef.getSnapshot();

  if (state.matches("idle")) {
    return IdleCreateTodoTemplate(props);
  } else if (state.matches("waitingForAddition")) {
    return WaitingForAdditionCreateTodoTemplate(props);
  }
}

export default CreateTodoTemplate;
