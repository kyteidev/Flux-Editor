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
import { info } from "tauri-plugin-log-api";
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
import { emit } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/tauri";
import { hideFB, hideTerm, setHideFB, setHideTerm } from "../App";

export const addListeners = () => {
  /*
  appWindow.listen("flux:ls-test", async () => {
    send_request();
  });
  */

  // TODO: Add separate page for displaying this info, instead of dialog?
  appWindow.listen("flux:about", () => {
    about();
  });
  appWindow.listen("flux:update", () => {
    emit("tauri://update");
  });

  appWindow.listen("flux:license", async () => {
    license();
  });
  appWindow.listen("flux:licenses-third-party-js", async () => {
    licenseThirdPartyJS();
  });
  appWindow.listen("flux:licenses-third-party-rust", async () => {
    licenseThirdPartyRust();
  });
  appWindow.listen("flux:licenses-fonts", async () => {
    licenseFonts();
  });

  appWindow.listen("flux:logs", async () => {
    viewLogs();
  });

  appWindow.listen("flux:settings", () => {
    settings();
  });

  appWindow.listen("flux:new_window", () => {
    console.log("hi");
    invoke("new_window");
  });

  appWindow.listen("flux:save", () => {
    saveFile();
  });
  appWindow.listen("flux:save_as", () => {
    saveFile(true);
  });

  appWindow.listen("flux:search", () => {
    toggleSearch();
  });
  appWindow.listen("flux:file_browser", () => {
    setHideFB(!hideFB());
  });
  appWindow.listen("flux:terminal", () => {
    setHideTerm(!hideTerm());
  });

  info("Initialized menu event listeners");
};
