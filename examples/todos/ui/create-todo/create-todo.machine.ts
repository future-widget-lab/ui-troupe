import { createModel } from "xstate/lib/model";
import {
  createRequestRenderAction,
  sendApp,
  withRenderRequest
} from "../../../../dist";
import { IAppEvent } from "../../app";

interface ICreateTodoContext {
  title: string;
}

interface ITitleUpdatedEvent {
  type: "TITLE_UPDATED";
  payload: {
    title: string;
  };
}

interface ITodoAddedEvent {
  type: "TODO_ADDED";
}

interface ISubmitEvent {
  type: "SUBMIT";
}

interface IResetEvent {
  type: "RESET";
}

type ICreateTodoEvent =
  | ITitleUpdatedEvent
  | ISubmitEvent
  | IResetEvent
  | ITodoAddedEvent;

function CreateTodoMachine() {
  const model = createModel<ICreateTodoContext, ICreateTodoEvent>({
    title: ""
  });

  const machine = model.createMachine(
    {
      id: "create-todo",
      initial: "idle",
      states: {
        idle: {
          on: {
            TITLE_UPDATED: {
              actions: withRenderRequest(["updateTodoTitle"])
            },
            SUBMIT: {
              target: "waitingForAddition",
              actions: withRenderRequest(["notifyTodoAdditionRequest"])
            },
            RESET: {
              actions: withRenderRequest(["clearInput"])
            }
          }
        },
        waitingForAddition: {
          on: {
            TODO_ADDED: {
              target: "cleanup"
            }
          }
        },
        cleanup: {
          always: {
            target: "idle",
            actions: withRenderRequest(["clearInput"])
          }
        }
      }
    },
    {
      actions: {
        ...createRequestRenderAction(),
        updateTodoTitle: model.assign({
          title: (_context, event) => {
            return (event as ITitleUpdatedEvent).payload.title;
          }
        }),
        clearInput: model.assign({
          title: () => {
            return "";
          }
        }),
        notifyTodoAdditionRequest: sendApp<
          ICreateTodoContext,
          ICreateTodoEvent,
          IAppEvent
        >((context) => {
          return {
            type: "TODO_ADDITION_REQUEST",
            payload: {
              title: context.title
            }
          };
        })
      }
    }
  );

  return machine;
}

export default CreateTodoMachine;

export { ICreateTodoContext, ICreateTodoEvent };
