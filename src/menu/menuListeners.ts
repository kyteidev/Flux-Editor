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

import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { info } from "@tauri-apps/plugin-log";
import { saveFile } from "../components/Editor/EditorComponent";
import { toggleSearch } from "../components/Search/Search";
import {
  about,
  license,
  licenseFonts,
  licenseThirdPartyJS,
  licenseThirdPartyRust,
  settings,
  viewLogs,
} from "./menuActions";
import { invoke } from "@tauri-apps/api/core";
import { hideFB, hideTerm, setHideFB, setHideTerm } from "../App";
import { checkUpdates } from "../components/StatusBar/components/Update";
const appWindow = getCurrentWebviewWindow();

export const addListeners = () => {
  /*
  appWindow.listen("flux:menu:ls-test", async () => {
    send_request();
  });
  */

  // TODO: Add separate page for displaying this info, instead of dialog?
  appWindow.listen("flux:menu:about", () => {
    about();
  });
  appWindow.listen("flux:menu:update", () => {
    checkUpdates();
  });

  appWindow.listen("flux:menu:license", async () => {
    license();
  });
  appWindow.listen("flux:menu:licenses-third-party-js", async () => {
    licenseThirdPartyJS();
  });
  appWindow.listen("flux:menu:licenses-third-party-rust", async () => {
    licenseThirdPartyRust();
  });
  appWindow.listen("flux:menu:licenses-fonts", async () => {
    licenseFonts();
  });

  appWindow.listen("flux:menu:logs", async () => {
    viewLogs();
  });

  appWindow.listen("flux:menu:settings", () => {
    settings();
  });

  appWindow.listen("flux:menu:new_window", () => {
    console.log("hi");
    invoke("new_window");
  });

  appWindow.listen("flux:menu:save", () => {
    saveFile();
  });
  appWindow.listen("flux:menu:save_as", () => {
    saveFile(true);
  });

  appWindow.listen("flux:menu:search", () => {
    toggleSearch();
  });
  appWindow.listen("flux:menu:file_browser", () => {
    setHideFB(!hideFB());
  });
  appWindow.listen("flux:menu:menu:terminal", () => {
    setHideTerm(!hideTerm());
  });

  info("Initialized menu event listeners");
};
