/* @refresh reload */
import { render } from "solid-js/web";
import { attachConsole } from "tauri-plugin-log-api";
import App from "./App";
import "./globals.css";

attachConsole();

render(() => <App />, document.getElementById("root") as HTMLElement);
