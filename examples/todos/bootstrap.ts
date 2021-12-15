import { createSystem } from "../../dist";

import AppMachine from "./app";
import RendererMachine from "./renderer";
import UiMachine from "./ui";

function bootstrap() {
  const system = createSystem({ dev: true });

  system.hookup("app", AppMachine);
  system.hookup("renderer", RendererMachine);
  system.hookup("ui", UiMachine);

  system.start();
}

export default bootstrap;
