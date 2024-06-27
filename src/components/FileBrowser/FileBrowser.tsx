/*
Copyright © 2024 Narvik Contributors.

This file is part of Narvik Editor.

Narvik Editor is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Narvik Editor is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Narvik Editor. If not, see <https://www.gnu.org/licenses/>. 
*/

import { readDir } from "@tauri-apps/api/fs";
import path from "path-browserify";
import { For, Show, createSignal, onMount } from "solid-js";
import { IconFolder, IconFolderOpen, IconLineVertical } from "../Icons/Icons";
import { logger } from "../../logger";
import * as FI from "../Icons/FileIcons";
import { addTab } from "../Editor/components/EditorTabs";
import { fileIcons, specialFileIcons } from "../../utils/fileIcon";

interface Props {
  dir: string;
  workspaceName?: string;
  projectName?: string;
}

const FileBrowser = (props: Props) => {
  const [dirContents, setDirContents] = createSignal<string[]>([]);
  const files: string[] = [];
  const dirs: string[] = [];

  const [showIcon, setShowIcon] = createSignal(true);

  onMount(async () => {
    const contents = await getPathContents(
      path.join(props.dir, props.workspaceName ?? "", props.projectName ?? ""),
    );
    setDirContents(contents);
  });

  const getPathContents = async (dirPath: string): Promise<string[]> => {
    try {
      const contents = await readDir(dirPath);
      const nonEmptyContents = contents
        .map((content) => content.name)
        .filter(
          (content): content is string =>
            content !== undefined && content[0] != ".",
        );
      return nonEmptyContents.sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: "base" }),
      );
    } catch (error) {
      if (!(error as string).includes("Not a directory")) {
        console.error(`Error fetching directory contents: ${error}`);
        logger(true, "FileBrowser.tsx", error as string);
      }
      return [error as string]; // return error as string, so the error is like a nested file in a folder
    }
  };

  const renderItem = (
    contents: string[],
    parentDir: string,
    firstRender: boolean,
    howNested: number, // how nested it is, e.g. root=0, nested=1, nested-in-nested=2, ...
  ) => {
    const nestedFiles: string[] = [];
    const nestedDirs: string[] = [];

    const [nestedContent, setNestedContent] = createSignal<string[]>();

    // TODO: utilize the nested content obtained here to avoid fetching again later on?
    for (let i = 0; i < contents.length; i++) {
      getPathContents(path.join(parentDir, contents[i])).then((content) => {
        if (content[0] != undefined && content[0].includes("Not a directory")) {
          nestedFiles.push(path.join(parentDir, contents[i]));
        } else {
          nestedDirs.push(path.join(parentDir, contents[i]));
        }
        if ([...nestedDirs, ...nestedFiles].length === contents.length) {
          setNestedContent([
            ...nestedDirs
              .map((item) => {
                const parts = item.split(path.sep);
                return parts[parts.length - 1];
              })
              .sort(),
            ...nestedFiles
              .map((item) => {
                const parts = item.split(path.sep);
                return parts[parts.length - 1];
              })
              .sort(),
          ]);
        }
      });
    }

    return (
      <For each={nestedContent()}>
        {(itemName) => {
          const [open, setOpen] = createSignal(false);
          const [isDir, setIsDir] = createSignal();
          const [dirNestedContents, setDirNestedContents] = createSignal<
            string[]
          >([]);

          const itemPath = path.join(parentDir, itemName);

          if (dirs.includes(itemPath)) {
            setIsDir(true);
          } else if (files.includes(itemPath)) {
            setIsDir(false);
          }

          // TODO: This is rerun every time a folder is opened, so optimize this!
          /*
          if (itemName[0] != ".") {
            getPathContents(itemPath)
              .then((contents) => {
                setDirNestedContents(contents);

                if (!(files.includes(itemPath) || dirs.includes(itemPath))) {
                  if (
                    contents[0] !== undefined &&
                    contents[0].includes("Not a directory")
                  ) {
                    setIsDir(false); // if name includes "Not a directory", it's not a folder
                    files.push(itemPath);
                  } else {
                    setIsDir(true);
                    dirs.push(itemPath);
                  }
                }
              })
              .catch((error: string) => {
                setDirNestedContents([]);
                console.error(`Error fetching directory contents: ${error}`);
                logger(true, "FileBrowser.tsx", error as string);
              });
          }
          */

          if (!(files.includes(itemPath) || dirs.includes(itemPath))) {
            if (nestedDirs.includes(itemPath)) {
              dirs.push(itemPath);
              setIsDir(true);
            } else {
              files.push(itemPath);
              setIsDir(false);
            }
          }

          // if file name matches special file name, set special icon. Otherwise check file extension
          let FileIconComponent =
            specialFileIcons[itemName.toLowerCase()] || undefined;
          if (FileIconComponent === undefined) {
            // checks file extension
            const fileExtension = isDir() ? "" : path.extname(itemName);
            FileIconComponent =
              fileIcons[fileExtension.toLowerCase()] || FI.Default;
          }

          return (
            <div class="relative block min-w-fit">
              <div
                class="min-w-fit cursor-pointer select-none text-content hover:bg-base-100 active:bg-base-100-hover"
                onclick={() => {
                  if (isDir()) {
                    setOpen(!open());
                    getPathContents(itemPath)
                      .then((contents) => setDirNestedContents(contents))
                      .catch((error) => {
                        setDirNestedContents([]);
                        console.error(
                          `Error fetching directory contents: ${error}`,
                        );
                        logger(true, "FileBrowser.tsx", error as string);
                      });
                  } else {
                    addTab([itemName, itemPath]);
                  }
                }}
              >
                <div
                  class="flex items-center"
                  style={{
                    "padding-left": `${howNested * 1.5}rem`, // makes the nested items look nested
                  }}
                >
                  <Show when={!firstRender} fallback={<div class="w-4" />}>
                    <div class="absolute opacity-80">
                      <IconLineVertical />
                    </div>
                    <div class="w-4" />
                  </Show>
                  <Show when={showIcon()}>
                    <div class="opacity-80">
                      <Show when={isDir()} fallback={<FileIconComponent />}>
                        <Show when={open()} fallback={<IconFolder />}>
                          <IconFolderOpen />
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
                      itemPath,
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
    <div class="h-full min-h-full w-full min-w-full overflow-auto bg-base-200">
      <div class="absolute z-10 block w-full cursor-pointer select-none items-center overflow-hidden overflow-ellipsis bg-base-200 pl-6 font-bold text-content hover:bg-base-100 active:bg-base-100-hover">
        {props.projectName
          ? `${props.workspaceName}/${props.projectName}`
          : "No Project"}{" "}
        {/* if no project name, display "No Project" */}
      </div>
      <div class="h-6" />
      <div class="min-w-fit">
        {renderItem(dirContents(), props.dir, true, 0)}
      </div>
    </div>
  );
};

export default FileBrowser;
