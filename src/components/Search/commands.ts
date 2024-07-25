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
  licenseFonts,
  licenseThirdPartyJS,
  licenseThirdPartyRust,
  settings,
  viewLogs,
} from "../../menu/menuActions";
import { hideFB, hideTerm, setHideFB, setHideTerm } from "../../App";
import { checkUpdates } from "../StatusBar/components/Update";

export const cmdFlux: { [key: string]: () => void } = {
  "Flux: About": () => about(),
  "Flux: Check updates": () => checkUpdates(),
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
  "Flux: Open Font Licenses and Legal Notices": () => licenseFonts(),
  "Flux: Open settings": () => settings(),
  "Flux: View logs": () => viewLogs(),
  "Flux: Quit": () => appWindow.close(),
};

export const cmdModules: { [key: string]: () => void } = {
  "Modules: Toggle file browser": () => setHideFB(!hideFB()),
  "Modules: Toggle terminal": () => setHideTerm(!hideTerm()),
};
