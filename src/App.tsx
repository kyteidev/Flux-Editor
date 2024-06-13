import { Router, Route } from "@solidjs/router";
import Welcome from "./pages/Welcome";
import Editor from "./pages/Editor";
import { onMount } from "solid-js";
import { initLogger, logger } from "./logger";

export default function App() {
  onMount(() => {
    initLogger();
    logger(false, "App.tsx", "Initialized application");
  });

  return (
    <Router>
      <Route path="/" component={Welcome} />
      <Route path="/editor" component={Editor} />
    </Router>
  );
}
