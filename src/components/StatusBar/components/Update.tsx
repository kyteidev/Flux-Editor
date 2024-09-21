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
import { UnlistenFn } from "@tauri-apps/api/event";

const [os, setOs] = createSignal("");
const [show, setShow] = createSignal(true);

const [text, setText] = createSignal("");

let failed = false;
let errorMsg = "";

let unlisten: UnlistenFn;

export const checkUpdates = async () => {
  setShow(true);
  setText("Checking for updates");

  unlisten = await onUpdaterEvent(({ error, status }) => {
    info("Updater event: " + error + ", " + status);
    if (error) {
      setText("Failed to check updates");
      failed = true;
      errorMsg = error;
    }
  });

  try {
    const { shouldUpdate } = await checkUpdate();

    if (shouldUpdate) {
      if (os() != "win32") {
        await installUpdate();
      }
      setText("Click to apply update");
    } else {
      setShow(false);
    }
  } catch (e) {
    error(e as string);
  }
};

const Update = () => {
  onMount(async () => {
    setOs(await getOS());

    checkUpdates();
  });

  onCleanup(async () => {
    unlisten();
  });

  const handleClick = async () => {
    if (failed) {
      setShow(false);
      dialog.message(errorMsg, {
        title: "Failed to check updates",
        type: "error",
      });
    } else {
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
    }
  };

  return (
    <Show when={show()}>
      <button
        class="text-content-main flex items-center justify-center rounded bg-base-200 px-1 text-center hover:bg-base-100-hover active:brightness-125"
        onClick={handleClick}
      >
        {text()}
      </button>
    </Show>
  );
};

export default Update;
