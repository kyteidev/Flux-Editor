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

import WinControls from "./WinControls";
import GnomeControls from "./GnomeControls";
import { Match, Switch, createSignal, onMount } from "solid-js";
import { getOS } from "../../utils/os";
function WindowControls() {
  const [currentOS, setCurrentOS] = createSignal("");

  onMount(async () => {
    setCurrentOS(await getOS());
  });

  return (
    <Switch>
      <Match when={currentOS() === "win32"}>
        <WinControls />
      </Match>
      <Match when={currentOS() === "linux"}>
        <GnomeControls />
      </Match>
      <Match when={currentOS() != "darwin" && true}>
        <WinControls />
      </Match>
    </Switch>
  );
}

export default WindowControls;
