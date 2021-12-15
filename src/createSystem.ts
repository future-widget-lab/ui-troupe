import {
  interpret,
  spawn,
  send,
  EventObject,
  ActorRef,
  State,
  StateMachine
} from "xstate";
import { createModel } from "xstate/lib/model";
import { inspect } from "@xstate/inspect";

import {
  AppUpdateRequestEventType,
  RequestAppUpdateActionName,
  RequestUiUpdateActionName,
  UiUpdateRequestEventType,
  FirstRenderRequestEventType,
  RenderRequestEventType,
  RequestFirstRenderActionName,
  RequestRenderUpdateActionName
} from "./helpers";
import {
  IFirstRenderRequestEvent,
  IRenderEvent,
  IRenderRequestEvent
} from "./createRenderer";

const APP_ACTOR_NAME = "app";
const RENDERER_ACTOR_NAME = "renderer";
const UI_ACTOR_NAME = "ui";

const IdleState = "idle";
const RunningState = "running";

const ActorRegistrationActionName = "registerActor";

interface IUserProvidedActor
  extends ActorRef<EventObject, State<unknown, EventObject>> {}

interface IRenderActor extends ActorRef<IRenderEvent> {}

interface IInitialSystemContext {
  registry: {
    app: IUserProvidedActor | null;
    renderer: IRenderActor | null;
    ui: IUserProvidedActor | null;
  };
}

interface IRunningSystemContext extends IInitialSystemContext {
  registry: {
    app: IUserProvidedActor;
    renderer: IRenderActor;
    ui: IUserProvidedActor;
  };
}

type IActorName =
  | typeof APP_ACTOR_NAME
  | typeof RENDERER_ACTOR_NAME
  | typeof UI_ACTOR_NAME;

interface IActorFactory {
  (): StateMachine<any, any, any>;
}

interface IHookupEvent {
  type: "HOOKUP";
  payload: {
    name: IActorName;
    createActor: IActorFactory;
  };
}

interface IStartEvent {
  type: "START";
}

interface AppUpdateRequestEvent {
  type: typeof AppUpdateRequestEventType;
  payload: unknown;
}

interface UiUpdateRequestEvent {
  type: typeof UiUpdateRequestEventType;
  payload: unknown;
}

interface RenderRequestEvent {
  type: typeof RenderRequestEventType;
}

type ISystemEvent =
  | IHookupEvent
  | IStartEvent
  | AppUpdateRequestEvent
  | UiUpdateRequestEvent
  | RenderRequestEvent;

function createSystemSnapshot(opts: {
  context: IInitialSystemContext;
  firstRender: true;
}): IFirstRenderRequestEvent;
function createSystemSnapshot(opts: {
  context: IInitialSystemContext;
  firstRender: false;
}): IRenderRequestEvent;
function createSystemSnapshot(opts: {
  context: IInitialSystemContext;
}): IRenderRequestEvent;
function createSystemSnapshot(opts: {
  context: IInitialSystemContext;
  firstRender?: boolean;
}) {
  const { context, firstRender } = opts;

  const {
    registry: { [APP_ACTOR_NAME]: appActor, [UI_ACTOR_NAME]: uiActor }
  } = context as IRunningSystemContext;

  const uiState = uiActor.getSnapshot();
  const uiContext = uiState!.context;

  const appState = appActor.getSnapshot();
  const appContext = appState!.context;

  return {
    type: firstRender ? FirstRenderRequestEventType : RenderRequestEventType,
    payload: {
      system: {
        app: {
          state: appState,
          context: appContext
        },
        ui: {
          state: uiState,
          context: uiContext
        }
      }
    }
  } as IFirstRenderRequestEvent | IRenderRequestEvent;
}

interface ICreateSystemOptions {
  dev?: boolean;
}

interface ISystem {
  hookup: (actorName: IActorName, createActor: IActorFactory) => void;
  start: VoidFunction;
}

function createSystem(opts: ICreateSystemOptions = { dev: false }): ISystem {
  const { dev = false } = opts;

  const model = createModel<IInitialSystemContext, ISystemEvent>({
    registry: {
      [APP_ACTOR_NAME]: null,
      [RENDERER_ACTOR_NAME]: null,
      [UI_ACTOR_NAME]: null
    }
  });

  const machine = model.createMachine(
    {
      id: "system",
      initial: IdleState,
      context: model.initialContext,
      states: {
        [IdleState]: {
          on: {
            HOOKUP: {
              actions: [ActorRegistrationActionName]
            },
            START: {
              target: RunningState
            }
          }
        },
        [RunningState]: {
          entry: [RequestFirstRenderActionName],
          on: {
            [AppUpdateRequestEventType]: {
              actions: [RequestAppUpdateActionName]
            },
            [UiUpdateRequestEventType]: {
              actions: [RequestUiUpdateActionName]
            },
            [RenderRequestEventType]: {
              actions: [RequestRenderUpdateActionName]
            }
          }
        }
      }
    },
    {
      actions: {
        [ActorRegistrationActionName]: model.assign({
          registry: (context, event) => {
            const {
              payload: { name, createActor }
            } = event as IHookupEvent;

            const actor = spawn(createActor(), {
              name
            });

            return {
              ...context.registry,
              [name]: actor
            };
          }
        }),
        [RequestAppUpdateActionName]: send(
          (_context, event) => {
            return (event as AppUpdateRequestEvent).payload as EventObject;
          },
          { to: APP_ACTOR_NAME }
        ),
        [RequestUiUpdateActionName]: send(
          (_context, event) => {
            return (event as UiUpdateRequestEvent).payload as EventObject;
          },
          { to: UI_ACTOR_NAME }
        ),
        [RequestFirstRenderActionName]: send(
          (context) => {
            const systemSnapshot = createSystemSnapshot({
              context,
              firstRender: true
            });

            return systemSnapshot;
          },
          { to: RENDERER_ACTOR_NAME }
        ),
        [RequestRenderUpdateActionName]: send(
          (context) => {
            const systemSnapshot = createSystemSnapshot({
              context
            });

            return systemSnapshot;
          },
          { to: RENDERER_ACTOR_NAME }
        )
      }
    }
  );

  const service = interpret(machine, {
    devTools: dev
  });

  if (dev) {
    inspect({
      iframe: false
    });
  }

  service.start();

  function hookup(actorName: IActorName, createActor: IActorFactory) {
    service.send({
      type: "HOOKUP",
      payload: {
        name: actorName,
        createActor
      }
    });
  }

  function start() {
    service.send({
      type: "START"
    });
  }

  return {
    hookup,
    start
  };
}

export default createSystem;
