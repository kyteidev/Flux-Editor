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
import { platform } from "@tauri-apps/api/os";
import { addListeners } from "./menuListeners";
import SplitPane from "./components/SplitPane/SplitPane";
import FileBrowser, { loadDir } from "./components/FileBrowser/FileBrowser";
import EditorFallback from "./pages/EditorFallback";
import WindowControls from "./components/WindowControls/WindowControls";
import Menu from "./components/Menu/Menu";

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
  console.log(projectName(), dirPath);

  info("Editor loaded");
  setLoaded(true);
};

export default function App() {
  initPathOS();
  const [OS, setOS] = createSignal();
  onMount(async () => {
    initSettings();
    setOS((await platform()).toString());
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
        <Show when={OS() != "darwin"} fallback={<div class="w-[68px]" />}>
          <Menu />
        </Show>
      </header>
      <div
        style={{
          "max-height": `calc(100vh - 1.75em)`,
          "min-height": `calc(100vh - 1.75em)`,
        }}
      >
        <SplitPane
          grow={true}
          size={280}
          firstMinSize={200}
          secondMinSize={500}
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
            size={350}
            firstMinSize={300}
            canFirstHide={false}
            secondMinSize={250}
            canSecondHide={true}
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
    </div>
  );
}
