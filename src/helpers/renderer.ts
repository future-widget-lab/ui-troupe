import {
  TransitionConfig,
  EventObject,
  SendAction,
  sendParent,
  sendUpdate
} from "xstate";

import { IActionName } from "../types";

const FirstRenderRequestEventType = "FIRST_RENDER_REQUESTED";

const RenderRequestEventType = "RENDER_REQUESTED";

const RequestRenderUpdateActionName = "requestRenderUpdate";

function withRenderRequest<TContext, TEvent extends EventObject>(
  actions: Array<IActionName> = []
): TransitionConfig<TContext, TEvent>["actions"] {
  return [...actions, sendUpdate(), RequestRenderUpdateActionName];
}

interface IRequestRenderEvent {
  RENDER_REQUESTED: {
    actions: [typeof RequestRenderUpdateActionName];
  };
}

function createRequestRenderEvent(): IRequestRenderEvent {
  return {
    RENDER_REQUESTED: {
      actions: [RequestRenderUpdateActionName]
    }
  };
}

function createRequestRenderAction<
  TContext extends unknown,
  TEvent extends EventObject
>(): Record<
  string,
  SendAction<
    TContext,
    TEvent,
    {
      type: typeof RenderRequestEventType;
    }
  >
> {
  return {
    requestRenderUpdate: sendParent({
      type: RenderRequestEventType
    })
  };
}

export {
  FirstRenderRequestEventType,
  RenderRequestEventType,
  RequestRenderUpdateActionName,
  withRenderRequest,
  createRequestRenderEvent,
  createRequestRenderAction
};
