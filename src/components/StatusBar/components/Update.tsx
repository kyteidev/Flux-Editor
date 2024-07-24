/*
Copyright © 2024 The Flux Editor Contributors.

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

// the updater code is largely adapted from Tauri Docs: https://tauri.app/v1/guides/distribution/updater/#custom-dialog
// the updater code from Tauri Docs is licensed under MIT. License notice can be found in resources/THIRD-PARTY-LICENSES-JS.txt

import { relaunch } from "@tauri-apps/api/process";
import {
  checkUpdate,
  installUpdate,
  onUpdaterEvent,
} from "@tauri-apps/api/updater";
import { createSignal, onCleanup, onMount, Show } from "solid-js";
import { error, info } from "tauri-plugin-log-api";
import { getOS } from "../../../utils/os";
import { dialog } from "@tauri-apps/api";

const Update = () => {
  const [os, setOs] = createSignal("");
  const [hasUpdate, setHasUpdate] = createSignal(false);

  const unlisten = onUpdaterEvent(({ error, status }) => {
    info("Updater event: " + error + status);
  });

  onMount(async () => {
    setOs(await getOS());

    try {
      const { shouldUpdate } = await checkUpdate();

      if (shouldUpdate) {
        setHasUpdate(true);

        if (os() != "win32") {
          installUpdate();
        }
      }
    } catch (e) {
      error(e as string);
    }
  });

  onCleanup(async () => {
    const unlistenfn = await unlisten;
    unlistenfn();
  });

  const update = async () => {
    const restart = await dialog.ask("Do you want to restart now?", {
      title: "Restart required",
    });
    if (restart) {
      if (os() === "win32") {
        installUpdate();
      } else {
        relaunch();
      }
    }
  };

  return (
    <Show when={hasUpdate()}>
      <button
        class="flex items-center justify-center rounded bg-base-200 px-1 text-center hover:bg-base-100-hover active:brightness-125"
        onClick={update}
      >
        Click to apply update
      </button>
    </Show>
  );
};

export default Update;
