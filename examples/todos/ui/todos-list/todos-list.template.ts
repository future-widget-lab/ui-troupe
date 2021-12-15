import { html } from "lit-html";
import { css } from "@emotion/css";
import { ActorRef, State } from "xstate";
import { ISystemState } from "../../../../dist";

import { IAppContext, IAppEvent, ITodosContext, ITodosEvent } from "../../app";
import { IUiContext, IUiEvent } from "../root";
import { typographyStyles } from "../styles";
import TodoListItemTemplate, {
  IToDosListItemContext,
  IToDosListItemEvent
} from "../todos-list-item";

const todosListTemplateStyles = css`
  height: 18.75em;
  overflow: scroll;
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */

  &::-webkit-scrollbar {
    display: none;
  }
`;

const emptyTodosMessageStyles = css`
  ${typographyStyles}
  opacity: 0.5;
  height: 18.75em;
  text-align: center;
`;

const todosListStyles = css`
  padding-left: 0;
  margin: 0;
`;

function EmptyTodosListTemplate() {
  return html`
    <section class=${todosListTemplateStyles}>
      <p class=${emptyTodosMessageStyles}>
        <em>Your ToDos will appear here!</em>
      </p>
    </section>
  `;
}

interface INonEmptyTodosListTemplateProps {
  todosRef: ActorRef<ITodosEvent, State<ITodosContext, ITodosEvent>>;
  todosListItemsRefs: Record<
    string,
    ActorRef<
      IToDosListItemEvent,
      State<IToDosListItemContext, IToDosListItemEvent>
    >
  >;
}

function NonEmptyTodosListTemplate(props: INonEmptyTodosListTemplateProps) {
  const { todosRef, todosListItemsRefs } = props;

  const todos = todosRef.getSnapshot().context.todos;

  return html`
    <section class=${todosListTemplateStyles}>
      <ul class=${todosListStyles}>
        ${Object.values(todos).map((todo) => {
          const todosListItemRef = todosListItemsRefs[todo.id];

          if (typeof todosListItemRef === "undefined") {
            return html``;
          }

          return TodoListItemTemplate({
            todo,
            todosListItemRef
          });
        })}
      </ul>
    </section>
  `;
}

function ToDosListTemplate(
  props: ISystemState<IUiContext, IUiEvent, IAppContext, IAppEvent>
) {
  const {
    ui: {
      context: { todosListItemsRefs }
    },
    app: {
      context: { todosRef }
    }
  } = props;

  const todos = todosRef.getSnapshot().context.todos;

  const hasTodos =
    todosListItemsRefs !== null && todos !== null && todos.length !== 0;

  if (!hasTodos) {
    return EmptyTodosListTemplate();
  }

  return NonEmptyTodosListTemplate({
    todosRef,
    todosListItemsRefs
  });
}

export default ToDosListTemplate;
