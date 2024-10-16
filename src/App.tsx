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

import { createSignal, onMount, Show } from "solid-js";
import EditorComponent, {
  fileSaved,
} from "./components/Editor/EditorComponent";
import EditorTabs, {
  addTab,
  getTabs,
} from "./components/Editor/components/EditorTabs";
import { initSettings } from "./settingsManager";
import { info } from "@tauri-apps/plugin-log";
import { basename } from "./utils/path";
import { addListeners } from "./menu/menuListeners";
import SplitPane from "./components/SplitPane/SplitPane";
import FileBrowser, { loadDir } from "./components/FileBrowser/FileBrowser";
import WindowControls from "./components/WindowControls/WindowControls";
import Search from "./components/Search/Search";
import StatusBar from "./components/StatusBar/StatusBar";
import { FluxLogo } from "./components/Icons/FluxLogo";
import FluxTerminal from "./components/Terminal/Terminal";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { invoke } from "@tauri-apps/api/core";
import EditorBreadcrumbs from "./components/Editor/components/EditorBreadcrumbs";
import ContextMenu from "./components/ContextMenu/ContextMenu";
import TitleBar from "./components/TitleBar/TitleBar";
import { emit } from "@tauri-apps/api/event";
import * as dialog from "@tauri-apps/plugin-dialog";
const appWindow = getCurrentWebviewWindow();

export const [dir, setDir] = createSignal<string>("");

export const [loaded, setLoaded] = createSignal(false);

export const [hideFB, setHideFB] = createSignal(false); // whether to hide File Browser
export const [hideTerm, setHideTerm] = createSignal(true); // whether to hide Terminal

const [projectName, setProjectName] = createSignal("");

export const getProjectName = () => {
  return projectName();
};

export const getProjectPath = () => {
  if (dir() === "") {
    return undefined;
  } else {
    return dir();
  }
};

export const loadEditor = (
  dirPath: string,
  openFile?: boolean,
  fileName?: string,
) => {
  setDir(dirPath);
  loadDir(dirPath);

  if (openFile && fileName) {
    setLoaded(true);
    addTab([fileName, dirPath]);
    info("Editor loaded");
    emit("flux:event:editor-loaded");
    return;
  }

  setProjectName(basename(dirPath)); // sets project name to be directory name

  info("Editor loaded");
  setLoaded(true);
  emit("flux:event:editor-loaded");
};

export default function App() {
  onMount(async () => {
    initSettings();
    info("Initialized application");

    addListeners();

    appWindow.listen("tauri://close-requested", async () => {
      if (fileSaved().length === getTabs().length) {
        appWindow.destroy();
      } else {
        const closeEditor = await dialog.ask(
          "Your changes will not be saved.",
          {
            title: "Are you sure you want to close Flux Editor?",
            kind: "warning",
          },
        );
        if (closeEditor) {
          await invoke("abort_all_commands");
          appWindow.destroy();
        }
      }
    });
  });

  return (
    <div class="flex h-screen max-h-screen w-screen flex-col">
      <TitleBar />
      <div
        style={{
          "max-height": `calc(100vh - 3.25rem - 2px)`,
          "min-height": `calc(100vh - 3.25rem - 2px)`,
        }}
      >
        <SplitPane
          grow={true}
          size={200}
          firstMinSize={180}
          secondMinSize={480}
          canFirstHide={true}
          hideFirst={hideFB()}
        >
          <div
            style={{
              height: `calc(100vh - 3.25rem - 2px)`,
              "max-height": `calc(100vh - 3.25em - 2px)`,
              "min-height": `calc(100vh - 3.25em - 2px)`,
            }}
          >
            <FileBrowser
              dir={dir()}
              rootDirName={projectName()}
              loaded={loaded()}
            />
          </div>
          <SplitPane
            vertical={true}
            grow={true}
            size={250}
            firstMinSize={170}
            canFirstHide={true}
            secondMinSize={250}
            canSecondHide={false}
            swapPriority={true}
            hideSecond={hideTerm()}
          >
            <Show
              when={getTabs().length != 0}
              fallback={
                <div class="flex min-h-full min-w-full select-none items-center justify-center space-x-10 bg-base-200">
                  <div
                    style={{ width: "12rem", height: "auto", opacity: "0.8" }}
                  >
                    <FluxLogo color="base-100" />
                  </div>
                </div>
              }
            >
              <EditorComponent />
            </Show>
            <FluxTerminal />
            <Show when={getTabs().length != 0}>
              <div class="max-w-full">
                <EditorTabs />
                <EditorBreadcrumbs />
              </div>
            </Show>
          </SplitPane>
        </SplitPane>
        <div>
          <WindowControls />
        </div>
      </div>
      <StatusBar />
      <Search />
      <ContextMenu />
    </div>
  );
}
