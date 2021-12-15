import { html } from "lit-html";
import { css } from "@emotion/css";
import { ActorRef, State } from "xstate";

import { ITodo } from "../../app";
import { buttonStyles, inputStyles, typographyStyles } from "../styles";
import {
  IToDosListItemEvent,
  IToDosListItemContext
} from "./todos-list-item.machine";
import SpinnerTemplate from "../spinner/spinner.template";

const todosListItemStyles = css`
  height: 3em;
  margin-bottom: 1em;
  display: flex;
  flex: 1;
  align-items: center;
  gap: 1em;

  &:last-child {
    margin-bottom: 0;
  }
`;

const todosListItemTitleStyles = css`
  ${typographyStyles}
  font-size: 1em;
  font-weight: normal;
  margin: 0;
  display: flex;
  flex: 1;
`;

const emojiContainerStyles = css`
  width: 72px;
`;

interface IIdleTodosListItemTemplateProps {
  todo: ITodo;
  todosListItemRef: ActorRef<
    IToDosListItemEvent,
    State<IToDosListItemContext, IToDosListItemEvent>
  >;
}

function IdleTodosListItemTemplate(props: IIdleTodosListItemTemplateProps) {
  const { todo, todosListItemRef } = props;

  function handleEdition() {
    todosListItemRef.send({ type: "TOGGLE_EDITION" });
  }

  function handleDeletion() {
    todosListItemRef.send({ type: "TODO_DELETION_REQUEST" });
  }

  return html`
    <li class=${todosListItemStyles}>
      <span class=${emojiContainerStyles}>❗️</span>
      <h3 class=${todosListItemTitleStyles}>
        <span> ${todo.title}</span>
      </h3>
      <button @click=${handleEdition} class=${buttonStyles}>Edit</button>
      <button @click=${handleDeletion} class=${buttonStyles}>Delete</button>
    </li>
  `;
}

const formStyles = css`
  ${todosListItemStyles}
  margin-bottom: 0;
  padding: 0 0.5em;
`;

const formInputStyles = css`
  ${inputStyles}
  display: flex;
  flex: 1;
`;

interface IEditingTodosListItemTemplateProps {
  todo: ITodo;
  todosListItemRef: ActorRef<
    IToDosListItemEvent,
    State<IToDosListItemContext, IToDosListItemEvent>
  >;
}

function EditingTodosListItemTemplate(
  props: IEditingTodosListItemTemplateProps
) {
  const { todo, todosListItemRef } = props;

  const state = todosListItemRef.getSnapshot();

  function handleInputChange(event: UIEvent) {
    todosListItemRef.send({
      type: "TITLE_UPDATED",
      payload: {
        title: (event.target as HTMLInputElement).value
      }
    });
  }

  function handleCancel() {
    todosListItemRef.send({
      type: "CANCEL"
    });
  }

  function handleSubmit(event: UIEvent) {
    event.preventDefault();

    todosListItemRef.send({
      type: "SAVE"
    });
  }

  function handleOnKeyDown(event: KeyboardEvent) {
    if (event.code === "Escape") {
      handleCancel();
    }
  }

  return html`
    <li class=${todosListItemStyles}>
      <form @submit=${handleSubmit} class=${formStyles}>
        <input
          @input=${handleInputChange}
          .value=${state.context.temporalTitle}
          @keydown=${handleOnKeyDown}
          id=${`todos-list-item-${todo.id}`}
          class=${formInputStyles}
        />
        <button type="button" @click=${handleCancel} class=${buttonStyles}>
          Cancel
        </button>
        <button type="submit" class=${buttonStyles}>Save</button>
      </form>
    </li>
  `;
}

interface ISavingTodosListItemTemplateProps {
  todo: ITodo;
  todosListItemRef: ActorRef<
    IToDosListItemEvent,
    State<IToDosListItemContext, IToDosListItemEvent>
  >;
}

function SavingTodosListItemTemplate(props: ISavingTodosListItemTemplateProps) {
  const { todo, todosListItemRef } = props;

  const state = todosListItemRef.getSnapshot();

  return html`
    <li class=${todosListItemStyles}>
      <span class=${emojiContainerStyles}>${SpinnerTemplate()}</span>

      <form class=${formStyles} disabled="true">
        <input
          .value=${state.context.temporalTitle}
          id=${`todos-list-item-${todo.id}`}
          class=${formInputStyles}
          disabled="true"
        />
        <button type="button" class=${buttonStyles} disabled="true">
          Cancel
        </button>
        <button type="submit" class=${buttonStyles} disabled="true">
          Save
        </button>
      </form>
    </li>
  `;
}

interface IDeletingTodosListItemTemplateProps {
  todo: ITodo;
}

function DeletingTodosListItemTemplate(
  props: IDeletingTodosListItemTemplateProps
) {
  const { todo } = props;

  return html`
    <li class=${todosListItemStyles}>
      <span class=${emojiContainerStyles}>${SpinnerTemplate()}</span>

      <h3 class=${todosListItemTitleStyles}>
        <span>${todo.title}</span>
      </h3>
      <button disabled="true" class=${buttonStyles}>Edit</button>
      <button disabled="true" class=${buttonStyles}>Delete</button>
    </li>
  `;
}

interface ITodosListItemTemplateProps {
  todo: ITodo;
  todosListItemRef: ActorRef<
    IToDosListItemEvent,
    State<IToDosListItemContext, IToDosListItemEvent>
  >;
}

function TodosListItemTemplate(props: ITodosListItemTemplateProps) {
  const { todosListItemRef } = props;

  const state = todosListItemRef.getSnapshot();

  if (state.matches("idle")) {
    return IdleTodosListItemTemplate(props);
  } else if (state.matches("editing")) {
    return EditingTodosListItemTemplate(props);
  } else if (state.matches("saving")) {
    return SavingTodosListItemTemplate(props);
  } else if (state.matches("deleting")) {
    return DeletingTodosListItemTemplate(props);
  }
}

export default TodosListItemTemplate;
