import { TransitionConfig, EventObject, SendAction, sendParent } from "xstate";

import { IActionName, ICreatePayload } from "../types";

const AppUpdateRequestEventType = "APP_UPDATE_REQUESTED";

const RequestAppUpdateActionName = "requestAppUpdate";

function withAppUpdateRequest<TContext, TEvent extends EventObject>(
  actions: Array<IActionName> = []
): TransitionConfig<TContext, TEvent>["actions"] {
  return [...actions, RequestAppUpdateActionName];
}

interface ICreateAppUpdateRequestEvent {
  APP_UPDATE_REQUESTED: {
    actions: [typeof RequestAppUpdateActionName];
  };
}

function createAppUpdateRequestEvent(): ICreateAppUpdateRequestEvent {
  return {
    [AppUpdateRequestEventType]: {
      actions: [RequestAppUpdateActionName]
    }
  };
}

function createAppUpdateRequestAction<
  TContext extends unknown,
  TEvent extends EventObject & { payload: unknown }
>(): Record<
  string,
  SendAction<
    TContext,
    TEvent,
    {
      type: typeof AppUpdateRequestEventType;
      payload: TEvent["payload"];
    }
  >
> {
  return {
    requestAppUpdate: sendParent((_context, event) => {
      return {
        type: AppUpdateRequestEventType,
        payload: event.payload
      };
    })
  };
}

function sendApp<
  TSourceContext extends unknown,
  TSourceEvent extends EventObject,
  TTargetEvent extends EventObject
>(
  createPayload?: ICreatePayload<TSourceContext, TSourceEvent, TTargetEvent>
): SendAction<
  TSourceContext,
  TSourceEvent,
  {
    type: typeof AppUpdateRequestEventType;
    payload: TTargetEvent | undefined;
  }
> {
  return sendParent((context, event) => {
    if (typeof createPayload === "undefined") {
      return {
        type: AppUpdateRequestEventType,
        payload: undefined
      };
    } else {
      return {
        type: AppUpdateRequestEventType,
        payload: createPayload(context, event)
      };
    }
  });
}

export {
  AppUpdateRequestEventType,
  RequestAppUpdateActionName,
  withAppUpdateRequest,
  createAppUpdateRequestEvent,
  createAppUpdateRequestAction,
  sendApp
};
