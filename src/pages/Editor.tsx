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
import EditorComponent from "../components/Editor/EditorComponent";
import EditorTabs, {
  addTab,
  getTabs,
} from "../components/Editor/components/EditorTabs";
import logo from "../assets/narvik-logo.svg";
import Welcome from "./Welcome";
import path from "path-browserify";
import { fs } from "@tauri-apps/api";
import { error, info } from "tauri-plugin-log-api";

const [dir, setDir] = createSignal<string>("");

export const [loaded, setLoaded] = createSignal(false);

const [workspaceName, setWorkspaceName] = createSignal<string>();
const [projectName, setProjectName] = createSignal<string>();

export const loadEditor = (
  dirPath: string,
  openFile?: boolean,
  fileName?: string,
) => {
  setDir(dirPath);

  if (openFile && fileName) {
    addTab([fileName, dirPath]);
    return;
  }

  const configPath = path.join(dirPath, ".narvik", "config.json");

  const filteredDirPath = dirPath.endsWith(path.sep)
    ? dirPath.substring(0, dirPath.length - 1)
    : dirPath; // the user shouldn't be able to get a dirPath that doesn't end in a / or \ unless it's a file. This filters out the last / or \

  fs.exists(configPath).then(async (exists) => {
    // checks if /.narvik/config.json exists
    if (!exists) {
      const type = { type: "Project" }; // if doesn't exist, assume the opened directory is a project.
      const typeJSON = JSON.stringify(type, null, 2);

      await fs.createDir(path.join(dirPath, ".narvik"));
      fs.writeFile(path.join(dirPath, ".narvik", "config.json"), typeJSON);

      setProjectName(
        filteredDirPath.substring(filteredDirPath.lastIndexOf(path.sep) + 1),
      ); // sets project name to be directory name
    } else {
      fs.readTextFile(configPath) // reads the config.json for directory type (Project or Workspace)
        .then(async (data) => {
          const parsedData = JSON.parse(data);

          if (parsedData.type === "Workspace") {
            setWorkspaceName(
              dirPath.substring(dirPath.lastIndexOf(path.sep) + 1), // sets workspace name to be parent directory
            );
          } else if (parsedData.type === "Project") {
            const lastSlashIndex = dirPath.lastIndexOf(path.sep);
            const secondLastSlashIndex = dirPath.lastIndexOf(
              path.sep,
              lastSlashIndex - 1,
            );
            const thirdLastSlashIndex = dirPath.lastIndexOf(
              path.sep,
              secondLastSlashIndex - 1,
            );

            if (
              await fs
                .exists(
                  path.join(
                    filteredDirPath.substring(0, secondLastSlashIndex),
                    ".narvik",
                    "config.json",
                  ),
                ) // checks if parent directory has .narvik folder with config.json inside
                .catch((e) => {
                  error(e as string);
                })
            ) {
              fs.readTextFile(
                // if it has, then read contents of config.json
                path.join(
                  filteredDirPath.substring(0, secondLastSlashIndex),
                  ".narvik",
                  "config.json",
                ),
              )
                .then((data) => {
                  const parsedData = JSON.parse(data);

                  if (parsedData.type === "Workspace") {
                    setWorkspaceName(
                      filteredDirPath.substring(
                        thirdLastSlashIndex + 1,
                        secondLastSlashIndex,
                      ),
                    );
                  }
                })
                .catch((e) => {
                  error(e as string);
                });
            }

            setProjectName(
              filteredDirPath.substring(
                filteredDirPath.lastIndexOf(path.sep) + 1,
              ),
            ); // sets project name to be directory name
          }
        })
        .catch((e) => {
          error(e as string);
        });
    }

    info("Editor loaded");
    setLoaded(true);
  });
};
const Editor = () => {
  onMount(() => {
    info("Editor mounted");
  });

  return (
    <div class="flex h-screen max-h-screen w-screen flex-col">
      <header
        data-tauri-drag-region
        class="header max-h-10 min-h-10 w-full flex-shrink-0 bg-base-200"
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
              <FileBrowser
                dir={dir()}
                workspaceName={workspaceName()}
                projectName={projectName()}
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
              <Show
                when={getTabs().length != 0}
                fallback={
                  <div class="flex min-h-full min-w-full select-none items-center justify-center space-x-10 bg-base-200">
                    <img
                      src={logo}
                      alt="Narvik Logo"
                      draggable="false"
                      style={{
                        width: "12rem",
                        height: "auto",
                        opacity: 0.2,
                        filter: "grayscale(100%)",
                      }}
                    />
                  </div>
                }
              >
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
        </Show>
      </div>
    </div>
  );
};

export default Editor;
