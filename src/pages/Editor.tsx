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
import { useSearchParams } from "@solidjs/router";
import { createSignal, onMount } from "solid-js";
import { logger } from "../logger";
import EditorComponent from "../components/Editor/EditorComponent";
import EditorTabs from "../components/Editor/components/EditorTabs";

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
          <SplitPane vertical={true} grow={true} size={500}>
            <EditorComponent lang="javascript" />
            <div class="h-full w-full bg-base-200"></div>
            <div>
              <EditorTabs />
            </div>
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
