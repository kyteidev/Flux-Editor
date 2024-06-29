/*
Copyright © 2024 Narvik Contributors.

This file is part of Narvik Editor.

Narvik Editor is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Narvik Editor is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Narvik Editor. If not, see <https://www.gnu.org/licenses/>.
*/

import Editor from "./pages/Editor";
import { onMount } from "solid-js";
import { initLogger, logger } from "./logger";
import { appWindow } from "@tauri-apps/api/window";
import { fileSaved, saveFile } from "./components/Editor/EditorComponent";
import { dialog } from "@tauri-apps/api";
import { invoke } from "@tauri-apps/api/tauri";
import { getTabs } from "./components/Editor/components/EditorTabs";

export default function App() {
  onMount(() => {
    initLogger();
    logger(false, "App.tsx", "Initialized application");

    appWindow.listen("tauri://close-requested", async () => {
      if (fileSaved().length === getTabs().length) {
        appWindow.close();
      } else {
        const closeEditor = await dialog.ask(
          "Your changes will not be saved.",
          {
            title: "Are you sure you want to close Narvik Editor?",
            type: "warning",
          },
        );
        if (closeEditor) {
          appWindow.close();
        }
      }
    });

    appWindow.listen("narvik:settings", () => {
      invoke("set_doc_edited", { edited: true });
    });
    appWindow.listen("narvik:save", () => {
      saveFile();
    });
    appWindow.listen("narvik:save_as", () => {
      saveFile(true);
    });

    logger(false, "App.tsx", "Initialized menu event listeners");
  });

  return <Editor />;
}
