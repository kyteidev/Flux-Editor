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

import { appWindow } from "@tauri-apps/api/window";
import {
  about,
  license,
  licenseThirdPartyJS,
  licenseThirdPartyRust,
  settings,
} from "../../menu/menuActions";
import { emit } from "@tauri-apps/api/event";

export const cmdFlux: { [key: string]: () => void } = {
  "Flux: About": () => about(),
  "Flux: Check updates": () => emit("tauri://update"),
  "Flux: Fullscreen": async () =>
    appWindow.setFullscreen(!(await appWindow.isFullscreen())),
  "Flux: Maximize": async () => {
    if (await appWindow.isMaximized()) {
      appWindow.unmaximize();
    } else {
      appWindow.maximize();
    }
  },
  "Flux: Minimize": () => appWindow.minimize(),
  "Flux: Open license": () => license(),
  "Flux: Open JS third party licenses": () => licenseThirdPartyJS(),
  "Flux: Open Rust third party licenses": () => licenseThirdPartyRust(),
  "Flux: Open settings": () => settings(),
  "Flux: Quit": () => appWindow.close(),
};
