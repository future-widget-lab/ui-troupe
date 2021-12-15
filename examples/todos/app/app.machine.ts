import { ActorRef, send, spawn, State } from "xstate";
import { createModel } from "xstate/lib/model";
import { sendUi } from "../../../dist";

import { ITodo } from "./types";
import ToDosMachine, {
  ITodoAditionRequestEvent,
  ITodoDeletionRequestEvent,
  ITodosEvent,
  ITodosContext
} from "./todos.machine";
import { IUiEvent } from "../ui";
import { ITodoEditedEvent, ITodoEditionRequestEvent } from "./todos.machine";

interface IAppContext {
  todosRef: ActorRef<ITodosEvent, State<ITodosContext, ITodosEvent>>;
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

type IAppEvent =
  | ITodoAditionRequestEvent
  | ITodoDeletionRequestEvent
  | ITodoEditionRequestEvent
  | ITodoAddedEvent
  | ITodoDeletedEvent
  | ITodoEditedEvent;

function AppMachine() {
  const model = createModel<IAppContext, IAppEvent>({
    todosRef: null
  });

  const machine = model.createMachine(
    {
      id: "app",
      initial: "setup",
      states: {
        setup: {
          always: {
            target: "idle",
            actions: ["registerTodosRef"]
          }
        },
        idle: {
          on: {
            TODO_ADDITION_REQUEST: {
              actions: ["notifyTodoAditionRequest"]
            },
            TODO_ADDED: {
              actions: ["notifyTodoAddition"]
            },
            TODO_DELETION_REQUEST: {
              actions: ["notifyTodoDeletionRequest"]
            },
            TODO_DELETED: {
              actions: ["notifyTodoDeletion"]
            },
            TODO_EDITION_REQUESTED: {
              actions: ["notifyTodoEditionRequest"]
            },
            TODO_EDITED: {
              actions: ["notifyTodoEdition"]
            }
          }
        }
      }
    },
    {
      actions: {
        registerTodosRef: model.assign({
          todosRef: () => {
            const actor = spawn(ToDosMachine(), {
              name: "todosRef"
            });

            return actor;
          }
        }),
        notifyTodoAditionRequest: send<IAppContext, IAppEvent>(
          (_context, event) => {
            return {
              type: "TODO_ADDITION_REQUEST",
              payload: event.payload
            };
          },
          { to: "todosRef" }
        ),
        notifyTodoAddition: sendUi<IAppContext, IAppEvent, IUiEvent>(
          (_context, event) => {
            return {
              type: "TODO_ADDED",
              payload: (event as ITodoAddedEvent).payload
            };
          }
        ),
        notifyTodoDeletionRequest: send<IAppContext, IAppEvent>(
          (_context, event) => {
            return {
              type: "TODO_DELETION_REQUEST",
              payload: event.payload
            };
          },
          { to: "todosRef" }
        ),
        notifyTodoDeletion: sendUi<IAppContext, IAppEvent, IUiEvent>(
          (_context, event) => {
            return {
              type: "TODO_DELETED",
              payload: (event as ITodoDeletedEvent).payload
            };
          }
        ),
        notifyTodoEditionRequest: send<IAppContext, IAppEvent>(
          (_context, event) => {
            return {
              type: "TODO_EDITION_REQUESTED",
              payload: event.payload
            };
          },
          { to: "todosRef" }
        ),
        notifyTodoEdition: sendUi<IAppContext, IAppEvent, IUiEvent>(
          (_context, event) => {
            return {
              type: "TODO_EDITED",
              payload: (event as ITodoEditedEvent).payload
            };
          }
        )
      }
    }
  );

  return machine;
}

export default AppMachine;

export { IAppContext, IAppEvent };
