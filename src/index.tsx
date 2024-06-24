/* @refresh reload */
import { render } from "solid-js/web";
import App from "./App";
import "./globals.css";
import { invoke } from "@tauri-apps/api";

document.addEventListener("DOMContentLoaded", () => {
  invoke("close_splash");
});

render(() => <App />, document.getElementById("root") as HTMLElement);
