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

import { For, Show, createSignal, onMount } from "solid-js";
import { IconLineVertical } from "../Icons/Icons";
import * as FI from "../Icons/FileIcons";
import { fileIcons, specialFileIcons } from "../../utils/file";
import { getSetting } from "../../settingsManager";
import { error } from "tauri-plugin-log-api";
import { openFile } from "../Editor/EditorComponent";
import { addTab, getTabs } from "../Editor/components/EditorTabs";
import { extname, joinPath, pathSep } from "../../utils/path";
import Startup from "./Startup";
import { dialog, invoke } from "@tauri-apps/api";

interface Props {
  dir: string;
  rootDirName?: string;
  loaded: boolean;
}

const [showIcon, setShowIcon] = createSignal(true);
const [dirContents, setDirContents] = createSignal<string[][]>([]);

export const loadFBSettings = () => {
  if (
    getSetting("showFileIcons") === "both" ||
    getSetting("showFileIcons") === "FileBrowser"
  ) {
    setShowIcon(true);
  } else {
    setShowIcon(false);
  }
};

export const loadDir = async (dir: string) => {
  const contents = await getPathContents(dir);
  setDirContents(contents);
};

const getPathContents = async (dirPath: string): Promise<string[][]> => {
  try {
    const contents = await invoke<{ dirs: string[]; files: string[] }>(
      "get_dir_contents",
      {
        path: dirPath,
      },
    );

    // sort items alphabetically without considering case
    const dirs = contents.dirs.sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" }),
    );
    const files = contents.files.sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" }),
    );

    return [dirs, files];
  } catch (e) {
    error(`Error fetching directory contents: ${e}`);
    dialog.message(e as string, { title: "Error fetching directory contents" });
    return [[], []];
  }
};

const FileBrowser = (props: Props) => {
  onMount(async () => {
    // load settings
    loadFBSettings();
  });

  const renderItem = (
    contents: string[][],
    parentDir: string,
    firstRender: boolean,
    howNested: number, // how nested it is, e.g. root=0, nested=1, nested-in-nested=2, ...
  ) => {
    const nestedFiles: string[] = [];
    const nestedDirs: string[] = [];

    const sep = pathSep();

    const [nestedContent, setNestedContent] = createSignal<string[]>();

    for (let i = 0; i < contents.flat().length; i++) {
      nestedDirs.push(parentDir + contents[0][i]);
      nestedFiles.push(parentDir + contents[1][i]);
    }
    setNestedContent(contents.flat());

    return (
      <For each={nestedContent()}>
        {(itemName) => {
          const [open, setOpen] = createSignal(false);
          const [isDir, setIsDir] = createSignal();
          const [dirNestedContents, setDirNestedContents] = createSignal<
            string[][]
          >([]);

          const itemPath = joinPath(parentDir, itemName);

          if (nestedDirs.includes(itemPath)) {
            setIsDir(true);
          } else {
            setIsDir(false);
          }

          // if file name matches special file name, set special icon. Otherwise check file extension
          let FileIconComponent =
            specialFileIcons[itemName.toLowerCase()] || undefined;
          if (FileIconComponent === undefined) {
            // checks file extension
            const fileExtension = isDir() ? "" : extname(itemName);
            FileIconComponent =
              fileIcons[fileExtension.toLowerCase()] || FI.Default;
          }

          return (
            <div class="relative block min-w-fit">
              <div
                class="min-w-fit cursor-pointer select-none px-1 text-content hover:bg-base-100 active:bg-base-100-hover"
                onclick={() => {
                  if (isDir()) {
                    setOpen(!open());
                    getPathContents(itemPath)
                      .then((contents) => setDirNestedContents(contents))
                      .catch((e) => {
                        setDirNestedContents([]);
                        error("Error fetching nested contents: " + e);
                      });
                  } else {
                    if (getTabs().length === 0) {
                      addTab([itemName, itemPath]);
                    }
                    openFile(itemPath);
                  }
                }}
              >
                <div
                  class="flex items-center"
                  style={{
                    "padding-left": `${howNested * 1.5}rem`, // makes the nested items look nested
                  }}
                >
                  <Show when={!firstRender}>
                    <div
                      class="absolute opacity-80"
                      style={{
                        left: `calc(${howNested * 1.5}rem - 0.75rem)`, // makes the nested items look nested
                      }}
                    >
                      <IconLineVertical />
                    </div>
                  </Show>
                  <Show when={showIcon()}>
                    <div class="opacity-80">
                      <Show
                        when={isDir()}
                        fallback={
                          <div id="fileicon">
                            <FileIconComponent />
                          </div>
                        }
                      >
                        <Show when={open()} fallback={<FI.IconFolder />}>
                          <FI.IconFolderOpen />
                        </Show>
                      </Show>
                    </div>
                  </Show>
                  <span
                    class={`${!showIcon() && isDir() ? "underline" : ""} whitespace-nowrap`}
                    style={{ "margin-left": `${!showIcon() ? "0.5rem" : "0"}` }}
                  >
                    {itemName}
                  </span>
                </div>
              </div>
              <div class="block">
                <Show when={open()}>
                  <div class="">
                    {renderItem(
                      dirNestedContents(),
                      itemPath + sep,
                      false,
                      howNested + 1,
                    )}
                  </div>
                </Show>
              </div>
            </div>
          );
        }}
      </For>
    );
  };

  return (
    <div class="h-full min-h-full w-full min-w-full max-w-full bg-base-200">
      <Show when={props.loaded} fallback={<Startup />}>
        <div class="z-10 block h-6 w-full select-none items-center overflow-hidden overflow-ellipsis bg-base-200 px-2 font-bold text-content">
          {`${props.rootDirName}`}
        </div>
        <div
          class="min-w-full max-w-full overflow-y-auto overflow-x-hidden"
          style={{ "max-height": `calc(100% - 1.5rem)` }}
        >
          {renderItem(dirContents(), props.dir, true, 0)}
        </div>
      </Show>
    </div>
  );
};

export default FileBrowser;
