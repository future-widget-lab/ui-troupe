import "requestidlecallback-polyfill";
import { EventObject, State } from "xstate";
import { createModel } from "xstate/lib/model";

import { FirstRenderRequestEventType, RenderRequestEventType } from "./helpers";

const SetupState = "setup";
const IdleState = "idle";

const FirstRenderActionName = "renderForTheFirstTime";
const ScheduleRenderActionName = "scheduleRender";

interface IRenderContext {}

type ISystemState<
  TUiContext = unknown,
  TUiEvent extends EventObject = EventObject,
  TAppContext = unknown,
  TAppEvent extends EventObject = EventObject
> = {
  app: {
    state: State<TAppContext, TAppEvent>;
    context: TAppContext;
  };
  ui: {
    state: State<TUiContext, TUiEvent>;
    context: TUiContext;
  };
};

interface IFirstRenderRequestEvent {
  type: typeof FirstRenderRequestEventType;
  payload: {
    system: ISystemState;
  };
}

interface IRenderRequestEvent {
  type: typeof RenderRequestEventType;
  payload: {
    system: ISystemState;
  };
}

type IRenderEvent = IFirstRenderRequestEvent | IRenderRequestEvent;

interface IRenderCallback<
  TUiContext = unknown,
  TUiEvent extends EventObject = EventObject,
  TAppContext = unknown,
  TAppEvent extends EventObject = EventObject
> {
  (state: ISystemState<TUiContext, TUiEvent, TAppContext, TAppEvent>): void;
}

function createRenderer<
  TUiContext = unknown,
  TUiEvent extends EventObject = EventObject,
  TAppContext = unknown,
  TAppEvent extends EventObject = EventObject
>(render: IRenderCallback<TUiContext, TUiEvent, TAppContext, TAppEvent>) {
  return function () {
    const model = createModel<IRenderContext, IRenderEvent>({});

    const machine = model.createMachine(
      {
        id: "renderer",
        initial: SetupState,
        states: {
          [SetupState]: {
            on: {
              [FirstRenderRequestEventType]: {
                target: IdleState,
                actions: [FirstRenderActionName]
              }
            }
          },
          [IdleState]: {
            on: {
              [RenderRequestEventType]: {
                actions: [ScheduleRenderActionName]
              }
            }
          }
        }
      },
      {
        actions: {
          [FirstRenderActionName]: (_context, event) => {
            // @ts-ignore FIXME
            render(event.payload.system);
          },
          [ScheduleRenderActionName]: (_context, event) => {
            requestAnimationFrame(() => {
              // @ts-ignore FIXME
              render(event.payload.system);
            });
          }
        }
      }
    );

    return machine;
  };
}

export default createRenderer;

export {
  IFirstRenderRequestEvent,
  IRenderRequestEvent,
  IRenderEvent,
  ISystemState
};
