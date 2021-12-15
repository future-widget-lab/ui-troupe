import { createModel } from "xstate/lib/model";
import {
  createRequestRenderAction,
  sendApp,
  withRenderRequest
} from "../../../../dist";

import { IAppEvent, ITodo } from "../../app";

interface IToDosListItemContext extends ITodo {
  temporalTitle: string;
}

interface IToggleEditionEvent {
  type: "TOGGLE_EDITION";
}

interface IDeletionEvent {
  type: "TODO_DELETION_REQUEST";
}

interface ITitleUpdatedEvent {
  type: "TITLE_UPDATED";
  payload: {
    title: string;
  };
}

interface ISaveEvent {
  type: "SAVE";
}

interface ICancelEvent {
  type: "CANCEL";
}

interface ITodoEditedEvent {
  type: "TODO_EDITED";
}

type IToDosListItemEvent =
  | IToggleEditionEvent
  | IDeletionEvent
  | ITitleUpdatedEvent
  | ISaveEvent
  | ICancelEvent
  | ITodoEditedEvent;

function ToDoListItemMachine(todo: ITodo) {
  const model = createModel<IToDosListItemContext, IToDosListItemEvent>({
    ...todo,
    temporalTitle: ""
  });

  const machine = model.createMachine(
    {
      id: `todo-list-item-${todo.id}`,
      initial: "idle",
      context: model.initialContext,
      states: {
        idle: {
          on: {
            TOGGLE_EDITION: {
              target: "editing",
              actions: withRenderRequest(["setTemporalTitle"])
            },
            TODO_DELETION_REQUEST: {
              target: "deleting",
              actions: withRenderRequest(["notifyDeletionRequest"])
            }
          }
        },
        deleting: {},
        editing: {
          entry: ["autofocus"],
          on: {
            TITLE_UPDATED: {
              actions: withRenderRequest(["saveTemporalTitle"])
            },
            SAVE: {
              target: "saving",
              actions: withRenderRequest(["notifyEditionRequest"])
            },
            CANCEL: {
              target: "idle",
              actions: withRenderRequest(["clearTemporalTitle"])
            }
          }
        },
        saving: {
          on: {
            TODO_EDITED: {
              target: "idle",
              actions: withRenderRequest(["clearTemporalTitle"])
            }
          }
        }
      }
    },
    {
      actions: {
        ...createRequestRenderAction(),
        setTemporalTitle: model.assign({
          temporalTitle: (context) => {
            return context.title;
          }
        }),
        clearTemporalTitle: model.assign({
          temporalTitle: () => {
            return "";
          }
        }),
        autofocus: (context) => {
          requestAnimationFrame(() => {
            window.document
              .getElementById(`todos-list-item-${context.id}`)
              .focus();
          });
        },
        saveTemporalTitle: model.assign({
          temporalTitle: (_context, event) => {
            return (event as ITitleUpdatedEvent).payload.title;
          }
        }),
        notifyEditionRequest: sendApp<
          IToDosListItemContext,
          IToDosListItemEvent,
          IAppEvent
        >((context) => {
          return {
            type: "TODO_EDITION_REQUESTED",
            payload: {
              id: context.id,
              title: context.temporalTitle
            }
          };
        }),
        notifyDeletionRequest: sendApp<
          IToDosListItemContext,
          IToDosListItemEvent,
          IAppEvent
        >((context) => {
          return {
            type: "TODO_DELETION_REQUEST",
            payload: {
              id: context.id
            }
          };
        })
      }
    }
  );

  return machine;
}

export default ToDoListItemMachine;

export { IToDosListItemContext, IToDosListItemEvent };
