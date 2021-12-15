import { EventObject, SendAction, sendParent } from "xstate";

import { ICreatePayload } from "../types";

const UiUpdateRequestEventType = "UI_UPDATE_REQUESTED";

const RequestFirstRenderActionName = "requestFirstRender";

const RequestUiUpdateActionName = "requestUiUpdate";

interface ISendUiUpdateRequestAction<
  TContext extends unknown,
  TEvent extends EventObject,
  TUiEvent extends EventObject
> extends SendAction<
    TContext,
    TEvent,
    {
      type: typeof UiUpdateRequestEventType;
      payload: TUiEvent | undefined;
    }
  > {}
{
}

function sendUi<
  TContext extends unknown,
  TEvent extends EventObject,
  TUiEvent extends EventObject
>(
  createPayload: ICreatePayload<TContext, TEvent, TUiEvent>
): ISendUiUpdateRequestAction<TContext, TEvent, TUiEvent> {
  return sendParent((context, event) => {
    if (typeof createPayload === "undefined") {
      return {
        type: UiUpdateRequestEventType,
        payload: undefined
      };
    } else {
      return {
        type: UiUpdateRequestEventType,
        payload: createPayload(context, event)
      };
    }
  });
}

export {
  UiUpdateRequestEventType,
  RequestFirstRenderActionName,
  RequestUiUpdateActionName,
  sendUi
};
