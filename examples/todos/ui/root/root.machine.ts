import { ActorRef, send, spawn, State } from "xstate";
import { createModel } from "xstate/lib/model";
import {
  createAppUpdateRequestEvent,
  createAppUpdateRequestAction,
  withRenderRequest,
  createRequestRenderEvent,
  createRequestRenderAction
} from "../../../../dist";

import { ITodo } from "../../app";
import {
  CreateToDoMachine,
  ICreateTodoContext,
  ICreateTodoEvent
} from "../create-todo";
import {
  IToDosListItemContext,
  IToDosListItemEvent,
  ToDoListItemMachine
} from "../todos-list-item";

interface IUiContext {
  createTodoRef: ActorRef<
    ICreateTodoEvent,
    State<ICreateTodoContext, ICreateTodoEvent>
  > | null;
  todosListItemsRefs: Record<
    string,
    ActorRef<
      IToDosListItemEvent,
      State<IToDosListItemContext, IToDosListItemEvent>
    > | null
  >;
}

interface ITodoAddedEvent {
  type: "TODO_ADDED";
  payload: {
    todo: ITodo;
  };
}

interface ITodoDeletedEvent {
  type: "TODO_DELETED";
  payload: {
    id: ITodo["id"];
  };
}

interface ITodoEditedEvent {
  type: "TODO_EDITED";
  payload: {
    todo: ITodo;
  };
}

type IUiEvent = ITodoAddedEvent | ITodoDeletedEvent | ITodoEditedEvent;

function RootMachine() {
  const model = createModel<IUiContext, IUiEvent>({
    createTodoRef: null,
    todosListItemsRefs: null
  });

  const machine = model.createMachine(
    {
      id: "ui",
      initial: "setup",
      states: {
        setup: {
          always: {
            target: "idle",
            actions: ["registerCreateTodoRef"]
          }
        },
        idle: {
          on: {
            ...createRequestRenderEvent(),
            ...createAppUpdateRequestEvent(),
            TODO_ADDED: {
              actions: withRenderRequest([
                "registerTodosListItemRef",
                "notifyTodoAdition"
              ])
            },
            TODO_DELETED: {
              actions: withRenderRequest(["destroyTodosListItemRef"])
            },
            TODO_EDITED: {
              actions: withRenderRequest(["notifyTodoEdition"])
            }
          }
        }
      }
    },
    {
      actions: {
        ...createAppUpdateRequestAction(),
        ...createRequestRenderAction(),
        registerCreateTodoRef: model.assign({
          createTodoRef: () => {
            const actor = spawn(CreateToDoMachine(), {
              name: "createTodoRef",
              sync: true
            });

            return actor;
          }
        }),
        notifyTodoAdition: send(
          { type: "TODO_ADDED" },
          {
            to: "createTodoRef"
          }
        ),
        registerTodosListItemRef: model.assign({
          todosListItemsRefs: (context, event) => {
            const todo = (event as ITodoAddedEvent).payload.todo;

            const actor = spawn(ToDoListItemMachine(todo), {
              name: `todosListItemsRef-${todo.id}`
            });

            return {
              ...context.todosListItemsRefs,
              [todo.id]: actor
            };
          }
        }),
        destroyTodosListItemRef: model.assign({
          todosListItemsRefs: (context, event) => {
            const todoId = (event as ITodoDeletedEvent).payload.id;

            context.todosListItemsRefs[todoId].stop();

            delete context.todosListItemsRefs[todoId];

            return {
              ...context.todosListItemsRefs
            };
          }
        }),
        notifyTodoEdition: send(
          (_context, event) => {
            return {
              type: "TODO_EDITED",
              payload: {
                title: (event as ITodoEditedEvent).payload.todo.title
              }
            };
          },
          {
            to: (_context, event) => {
              const todoId = (event as ITodoEditedEvent).payload.todo.id;

              return `todosListItemsRef-${todoId}`;
            }
          }
        )
      }
    }
  );

  return machine;
}

export default RootMachine;

export { IUiEvent, IUiContext };
