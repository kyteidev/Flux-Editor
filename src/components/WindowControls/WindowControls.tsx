/*
Copyright © 2024 Narvik Contributors.

This file is part of Narvik Editor.

Narvik Editor is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Narvik Editor is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Narvik Editor. If not, see <https://www.gnu.org/licenses/>. 
*/

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

  onMount(() => getOS());

  return (
    <Show when={os() != ""} fallback={<WinControls />}>
      {os() === "darwin" && <MacControls />}
      {os() === "linux" && <GnomeControls />}
      {os() === "windows" && <WinControls />}
    </Show>
  );
}

export default WindowControls;
