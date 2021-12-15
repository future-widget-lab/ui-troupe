import { EventObject } from "xstate";

type IActionName = string;

interface ICreatePayload<
  TSourceContext extends unknown,
  TSourceEvent extends EventObject,
  TTargetEvent extends EventObject
> {
  (context: TSourceContext, event: TSourceEvent): TTargetEvent;
}

export { IActionName, ICreatePayload };
