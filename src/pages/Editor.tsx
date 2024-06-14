/*
Copyright © 2024 Narvik Contributors.

This file is part of Narvik Editor.

Narvik Editor is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Narvik Editor is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Narvik Editor. If not, see <https://www.gnu.org/licenses/>. 
*/

import EditorComponent from "../components/Editor/EditorComponent";
import FileBrowser from "../components/FileBrowser/FileBrowser";
import SplitPane from "../components/SplitPane/SplitPane";
import WindowControls from "../components/WindowControls/WindowControls";
import { useSearchParams } from "@solidjs/router";
import { createSignal, onMount } from "solid-js";
import { logger } from "../logger";

const Editor = () => {
  const [params] = useSearchParams();

  const [dir, setDir] = createSignal<string>("");

  onMount(() => {
    setDir(params.path ?? "");
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
        <SplitPane grow={true}>
          <SplitPane vertical={true} width={280}>
            <FileBrowser dir={dir()} />
          </SplitPane>
          <SplitPane vertical={true} grow={true}>
            <div class="h-full max-h-[66vh]">
              <EditorComponent lang="javascript" />
            </div>
            <div class="w-full flex-grow bg-base-200"></div>
          </SplitPane>
        </SplitPane>
        <div>
          <WindowControls />
        </div>
      </div>
    </div>
  );
};

export default Editor;
