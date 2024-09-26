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
import { onMount } from "solid-js";
import { appWindow } from "@tauri-apps/api/window";
import { fileSaved, saveFile } from "./components/Editor/EditorComponent";
import { dialog } from "@tauri-apps/api";
import { getTabs } from "./components/Editor/components/EditorTabs";
import { initSettings } from "./settingsManager";
import { info } from "tauri-plugin-log-api";
import { about, license, licenseThirdParty, settings } from "./menuActions";
import Editor from "./pages/Editor";
import { initPathOS } from "./utils/path";

export default function App() {
  initPathOS();
  onMount(() => {
    initSettings();
    info("Initialized application");

    appWindow.listen("tauri://close-requested", async () => {
      if (fileSaved().length === getTabs().length) {
        appWindow.close();
      } else {
        const closeEditor = await dialog.ask(
          "Your changes will not be saved.",
          {
            title: "Are you sure you want to close Flux Editor?",
            type: "warning",
          },
        );
        if (closeEditor) {
          appWindow.close();
        }
      }
    });

    /*
    appWindow.listen("flux:ls-test", async () => {
      send_request();
    });
    */

    // TODO: Add separate page for displaying this info, instead of dialog?
    appWindow.listen("flux:about", () => {
      about();
    });

    appWindow.listen("flux:license", async () => {
      license();
    });

    appWindow.listen("flux:licenses-third-party", async () => {
      licenseThirdParty();
    });

    appWindow.listen("flux:settings", () => {
      settings();
    });

    appWindow.listen("flux:save", () => {
      saveFile();
    });
    appWindow.listen("flux:save_as", () => {
      saveFile(true);
    });

    info("Initialized menu event listeners");
  });

  return <Editor />;
}
