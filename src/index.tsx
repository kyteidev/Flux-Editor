/* @refresh reload */
import { render } from "solid-js/web";
import App from "./App";
import "./globals.css";

render(() => <App />, document.getElementById("root") as HTMLElement);
