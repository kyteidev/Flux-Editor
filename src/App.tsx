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

import { createSignal, onMount, Show } from "solid-js";
import EditorComponent from "./components/Editor/EditorComponent";
import EditorTabs, {
  addTab,
  getTabs,
} from "./components/Editor/components/EditorTabs";
import { initSettings } from "./settingsManager";
import { info } from "tauri-plugin-log-api";
import { basename, initPathOS } from "./utils/path";
import { addListeners } from "./menuListeners";
import SplitPane from "./components/SplitPane/SplitPane";
import FileBrowser, { loadDir } from "./components/FileBrowser/FileBrowser";
import EditorFallback from "./pages/EditorFallback";
import WindowControls from "./components/WindowControls/WindowControls";
import Menu from "./components/Menu/Menu";
import Search from "./components/Search/Search";
import StatusBar from "./components/StatusBar/StatusBar";

export const [dir, setDir] = createSignal<string>("");

export const [loaded, setLoaded] = createSignal(false);

const [projectName, setProjectName] = createSignal<string>();

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
    return;
  }

  setProjectName(basename(dirPath)); // sets project name to be directory name

  info("Editor loaded");
  setLoaded(true);
};

export default function App() {
  onMount(async () => {
    initPathOS().then(() => {
      initSettings();
    });
    info("Initialized application");

    addListeners();
  });

  return (
    <div class="flex h-screen max-h-screen w-screen flex-col">
      <header
        data-tauri-drag-region
        class="header flex w-full flex-shrink-0 border-b-2 border-base-100 bg-base-200 p-[5px]"
        style={{
          "min-height": `calc(1.75rem + 2px)`,
          "max-height": `calc(1.75rem + 2px)`,
        }}
      >
        {/* <div class="w-[79px]" /> */}
        <Menu />
      </header>
      <div
        style={{
          "max-height": `calc(100vh - 3.25em - 2px)`,
          "min-height": `calc(100vh - 3.25em - 2px)`,
        }}
      >
        <SplitPane
          grow={true}
          size={200}
          firstMinSize={180}
          secondMinSize={480}
          canFirstHide={true}
        >
          <div
            style={{
              height: `calc(100vh - 1.75em)`,
              "max-height": `calc(100vh - 1.75em)`,
              "min-height": `calc(100vh - 1.75em)`,
            }}
          >
            <FileBrowser
              dir={dir()}
              rootDirName={projectName()}
              loaded={loaded()}
            />
          </div>
          {/* Due to a bug, the second pane in vertical split panes glitch when hidden, so temporarily set canSecondHide to false */}
          <SplitPane
            vertical={true}
            grow={true}
            size={250}
            firstMinSize={170}
            canFirstHide={true}
            secondMinSize={250}
            canSecondHide={false}
            swapPriority={true}
          >
            <Show when={getTabs().length != 0} fallback={<EditorFallback />}>
              <EditorComponent />
            </Show>
            <div class="h-full w-full bg-base-200"></div>
            <Show when={getTabs().length != 0}>
              <div class="max-w-full">
                <EditorTabs />
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
    </div>
  );
}
