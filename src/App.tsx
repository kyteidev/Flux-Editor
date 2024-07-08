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

import Editor, { loaded } from "./pages/Editor";
import { onMount } from "solid-js";
import { appWindow } from "@tauri-apps/api/window";
import { fileSaved, saveFile } from "./components/Editor/EditorComponent";
import { dialog, shell } from "@tauri-apps/api";
import { addTab, getTabs } from "./components/Editor/components/EditorTabs";
import { getSettingsPath, initSettings } from "./settingsManager";
import { info } from "tauri-plugin-log-api";
import { getVersion } from "@tauri-apps/api/app";
import { getOS } from "./utils/os";
import { resolveResource } from "@tauri-apps/api/path";

export default function App() {
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
    appWindow.listen("flux:about", async () => {
      const appVersion = getVersion();

      let licensesLocation: string;
      if ((await getOS()) === "darwin") {
        licensesLocation = "Flux Editor > Legal Notices";
      } else {
        licensesLocation = "File > Legal Notices";
      }

      dialog.message(
        "Copyright © 2024 The Flux Editor Contributors.\nLicensed under the GNU General Public License v3.0.\nSee " +
          licensesLocation +
          " for license notices.",
        { title: "Flux Editor " + (await appVersion) },
      );
    });

    appWindow.listen("flux:license", async () => {
      const resourcePath = await resolveResource("../resources/LICENSE.txt");
      shell.open(resourcePath);
    });

    appWindow.listen("flux:licenses-third-party", async () => {
      const resourcePath = await resolveResource(
        "../resources/THIRD-PARTY-LICENSES.txt",
      );
      shell.open(resourcePath);
    });

    appWindow.listen("flux:settings", () => {
      if (loaded()) {
        addTab(["Settings", getSettingsPath()]);
      }
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
