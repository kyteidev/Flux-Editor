/*
Copyright © 2024 kyteidev.

This file is part of Flux Editor.

Flux Editor is free software: you can redistribute it and/or modify it under the terms of the GNU General
Public License as published by the Free Software Foundation, either version 3 of the License, or (at your
option) any later version.

Flux Editor is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even
the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Flux Editor. If not, see
<https://www.gnu.org/licenses/>.
*/

import { invoke } from "@tauri-apps/api/tauri";
import { createSignal, onCleanup, onMount, Show } from "solid-js";
import { dir, loaded } from "../../../App";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { error } from "tauri-plugin-log-api";

const GitBranch = () => {
  const [currentBranch, setCurrentBranch] = createSignal("");
  let interval: number;
  let unlisten: UnlistenFn;

  onMount(async () => {
    unlisten = await listen("flux:editor-loaded", async () => {
      let branch = "";
      try {
        branch = await invoke("current_branch", { dir: dir() });
      } catch (e) {
        error("Failed to get current git branch: " + e);
      }
      setCurrentBranch(branch);
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
