/*
Copyright © 2024 Narvik Contributors.

This file is part of Narvik Editor.

Narvik Editor is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Narvik Editor is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Narvik Editor. If not, see <https://www.gnu.org/licenses/>. 
*/

import FileBrowser from "../components/FileBrowser/FileBrowser";
import SplitPane from "../components/SplitPane/SplitPane";
import WindowControls from "../components/WindowControls/WindowControls";
import { Show, createSignal, onMount } from "solid-js";
import { logger } from "../logger";
import EditorComponent from "../components/Editor/EditorComponent";
import EditorTabs, {
  getTabs,
} from "../components/Editor/components/EditorTabs";
import logo from "../assets/narvik-logo.svg";
import Welcome from "./Welcome";

const [dir, setDir] = createSignal<string>("");
const [loaded, setLoaded] = createSignal(false);

export const loadEditor = (
  path: string,
  type?: string,
  projectName?: string,
  workspaceName?: string,
) => {
  setDir(path);
  logger(false, "Editor.tsx", "Editor loaded");
  setLoaded(true);
};

const Editor = () => {
  onMount(() => {
    logger(false, "Editor.tsx", "Editor mounted");
  });

  return (
    <div class="flex h-screen max-h-screen w-screen flex-col">
      <header
        data-tauri-drag-region
        class="header min-h-10 w-full flex-shrink-0 bg-base-200"
      />
      <div
        style={{
          "max-height": `calc(100vh - 2.5em)`,
          "min-height": `calc(100vh - 2.5em)`,
        }}
      >
        <Show when={loaded()} fallback={<Welcome />}>
          <SplitPane
            grow={true}
            size={280}
            firstMinSize={200}
            secondMinSize={500}
            canFirstHide={true}
          >
            <div
              style={{
                height: `calc(100vh - 2.5em)`,
                "max-height": `calc(100vh - 2.5em)`,
                "min-height": `calc(100vh - 2.5em)`,
              }}
            >
              <FileBrowser dir={dir()} />
            </div>
            {/* Due to a bug, the second pane in vertical split panes glitch when hidden, so temporarily set canSecondHide to false */}
            <SplitPane
              vertical={true}
              grow={true}
              size={350}
              firstMinSize={300}
              canFirstHide={false}
              secondMinSize={250}
              canSecondHide={false}
            >
              <Show
                when={getTabs().length != 0}
                fallback={
                  <div class="flex min-h-full min-w-full select-none items-center justify-center space-x-20 bg-base-200">
                    <img
                      src={logo}
                      alt="Narvik Logo"
                      draggable="false"
                      style={{ width: "15em", height: "auto" }}
                    />
                    <div class="flex flex-col space-y-1">
                      <h1 class="text-3xl">Open a file to get started.</h1>
                      <p class="text-normal text-center">
                        Click on a file in the File Browser to open it.
                      </p>
                    </div>
                  </div>
                }
              >
                <EditorComponent lang="javascript" />
              </Show>
              <div class="h-full w-full bg-base-200"></div>
              <Show when={getTabs().length != 0}>
                <div>
                  <EditorTabs />
                </div>
              </Show>
            </SplitPane>
          </SplitPane>
          <div>
            <WindowControls />
          </div>
        </Show>
      </div>
    </div>
  );
};

export default Editor;
