import MacControls from "./MacControls";
import WinControls from "./WinControls";
import GnomeControls from "./GnomeControls";
import { platform } from "@tauri-apps/api/os";
import { Show, createSignal, onMount } from "solid-js";
function WindowControls() {
  const [os, setOs] = createSignal("");

  let osName: string = "";
  async function getOS() {
    osName = await platform();
    setOs(osName);
  }

  onMount(() => getOS())

  return (
    <Show when={os() != ""} fallback={<WinControls />}>
      {os() === "darwin" && <MacControls />}
      {os() === "linux" && <GnomeControls />}
      {os() === "windows" && <WinControls />}
    </Show>
  );
}

export default WindowControls;
