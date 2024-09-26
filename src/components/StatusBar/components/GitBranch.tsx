import { invoke } from "@tauri-apps/api/tauri";
import { createSignal, onCleanup, onMount, Show } from "solid-js";
import { dir, loaded } from "../../../App";
import { listen, UnlistenFn } from "@tauri-apps/api/event";

const GitBranch = () => {
  const [currentBranch, setCurrentBranch] = createSignal("");
  let interval: number;
  let unlisten: UnlistenFn;

  onMount(async () => {
    unlisten = await listen("flux:editor-loaded", async () => {
      setCurrentBranch(await invoke("current_branch", { dir: dir() }));
      interval = setInterval(async () => {
        setCurrentBranch(await invoke("current_branch", { dir: dir() }));
      }, 3000);
    });
  });

  onCleanup(() => {
    clearInterval(interval);
    unlisten();
  });

  return (
    <Show when={loaded() && currentBranch() != ""}>
      <div class="flex items-center justify-center text-content-main">
        {currentBranch()}
      </div>
    </Show>
  );
};

export default GitBranch;
