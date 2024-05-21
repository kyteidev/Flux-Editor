import { Router, Route } from "@solidjs/router";
import Welcome from "./pages/Welcome";
import Editor from "./pages/Editor";

export default function App() {
  return (
    <Router>
      <Route path="/" component={Welcome} />
      <Route path="/editor" component={Editor} />
    </Router>
  );
}
