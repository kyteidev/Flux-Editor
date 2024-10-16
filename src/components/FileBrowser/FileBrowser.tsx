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

import {
  For,
  Show,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";
import { IconLineVertical } from "../Icons/Icons";
import * as FI from "../Icons/FileIcons";
import { fileIcons, specialFileIcons } from "../../utils/file";
import { getSetting } from "../../settingsManager";
import { error } from "@tauri-apps/plugin-log";
import { closeFile, openFile } from "../Editor/EditorComponent";
import {
  addTab,
  closeTabGlobal,
  getTabs,
  isTabOpen,
} from "../Editor/components/EditorTabs";
import {
  basename,
  dirname,
  extname,
  joinPath,
  normalizePath,
  pathSep,
} from "../../utils/path";
import Startup from "./Startup";
import { invoke } from "@tauri-apps/api/core";
import { updateBreadcrumbs } from "../Editor/components/EditorBreadcrumbs";
import { isContextMenuShown } from "../ContextMenu/ContextMenu";
import "../../utils/array";
import { emit, once, UnlistenFn } from "@tauri-apps/api/event";
import { throttle } from "../../utils/timing";
import * as dialog from "@tauri-apps/plugin-dialog";
import * as fs from "@tauri-apps/plugin-fs";

interface Props {
  dir: string;
  rootDirName?: string;
  loaded: boolean;
}

let checkMustOpenDir: UnlistenFn[] = [];

let selectedItem = "";
let selectedDir = false;

const [rootDir, setRootDir] = createSignal("");

const [showIcon, setShowIcon] = createSignal(true);
const [dirContents, setDirContents] = createSignal<string[][]>([]);

const [newItemDir, setNewItemDir] = createSignal(""); // dir where the new file/project will be created
const [newItemType, setNewItemType] = createSignal("");

const forceUnlisten = async () => {
  if (checkMustOpenDir.length > 0) {
    for (let i = 0; i < checkMustOpenDir.length; i++) {
      checkMustOpenDir[i]();
      checkMustOpenDir.splice(0, 1);
    }
  }
};

export const newItem = (type: string) => {
  const parentDir = selectedDir ? selectedItem : dirname(selectedItem);
  if (selectedItem === "") {
    setNewItemDir(normalizePath(rootDir()));
  } else {
    setNewItemDir(normalizePath(parentDir));
  }
  setNewItemType(type);

  emit("flux:event:contextMenuClicked", { type: "newItem" });
};

export const removeItem = throttle((trash: boolean) => {
  invoke("remove_file", { trash: trash, path: selectedItem });
  emit("flux:event:contextMenuClicked", { type: "removeItem" });

  if (!selectedDir && isTabOpen(selectedItem)) {
    closeFile();
    closeTabGlobal(selectedItem);
  }
}, 500);

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
    const dirs = contents.dirs.sortInsensitive();
    const files = contents.files.sortInsensitive();

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

  createEffect(() => {
    if (props.loaded === true) {
      setRootDir(props.dir);
    }
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
      if (contents[0][i] != undefined) {
        nestedDirs.push(parentDir + contents[0][i]);
      }
      if (contents[1][i]) {
        nestedFiles.push(parentDir + contents[1][i]);
      }
    }
    setNestedContent(contents.flat());

    const updateContent = () => {
      setNestedContent(
        [
          nestedDirs.map((dir) => basename(dir)),
          nestedFiles.map((file) => basename(file)),
        ].flat(),
      );
    };

    return (
      <>
        {() => {
          let input: HTMLInputElement | undefined;

          onMount(() => {
            input?.addEventListener("keydown", handleKeyDown);
            document.addEventListener("mousedown", handleOutsideClick);

            if (input && newItemDir() === parentDir) {
              input.scrollIntoView({ behavior: "instant", block: "nearest" });
              input.focus();
            }
          });

          onCleanup(() => {
            input?.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("mousedown", handleOutsideClick);
          });

          const handleHide = () => {
            setNewItemDir("");
            setNewItemType("");
            input?.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("mousedown", handleOutsideClick);
          };

          const handleOutsideClick = (e: MouseEvent) => {
            if (e.target instanceof HTMLElement) {
              if (
                !e.target.className.includes("fb-input") &&
                !e.target.className.includes("context-menu")
              ) {
                handleHide();
              }
            }
          };

          const handleKeyDown = async (e: KeyboardEvent) => {
            if (e.code === "Enter") {
              const newItemPath = joinPath(newItemDir(), input?.value || "");

              if (newItemType() === "folder") {
                fs.mkdir(newItemPath, { recursive: true })
                  .then(() => {
                    nestedDirs.push(newItemPath);
                    nestedDirs.sortInsensitive();

                    updateContent();
                    handleHide();
                  })
                  .catch(async (e: any) => {
                    error("Error creating folder: " + e.toString());
                    await dialog.message(e, {
                      title: "Error creating folder",
                      kind: "error",
                    });
                    return;
                  });
              } else {
                fs.writeTextFile(newItemPath, "")
                  .then(() => {
                    nestedFiles.push(newItemPath);
                    nestedFiles.sortInsensitive();

                    addTab([basename(newItemPath), newItemPath]);
                    openFile(newItemPath);
                    updateBreadcrumbs(newItemPath);

                    updateContent();
                    handleHide();
                  })
                  .catch(async (e: any) => {
                    error("Error creating file: " + e.toString());
                    await dialog.message(e, {
                      title: "Error creating file",
                      kind: "error",
                    });
                    return;
                  });
              }
            }
          };

          return (
            <Show when={newItemDir() === parentDir}>
              <div class="fb-input relative block h-6 select-none overflow-hidden text-content">
                <input
                  ref={input}
                  class="fb-input bg-base-100 px-2 text-content-main caret-accent"
                  height="1.5rem"
                  autocorrect="off"
                  autocomplete="off"
                  autofocus
                  style={{
                    "padding-left": `calc(${howNested * 1.5}rem + 4px + 1px + ${showIcon() ? "24px" : "7px"})`,
                  }}
                />
              </div>
            </Show>
          );
        }}
        <For each={nestedContent()}>
          {(itemName) => {
            const [open, setOpen] = createSignal(false);
            const [isDir, setIsDir] = createSignal(false);
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

            const openDir = () => {
              setOpen(!open());
              getPathContents(itemPath)
                .then((contents) => setDirNestedContents(contents))
                .catch((e) => {
                  setDirNestedContents([]);
                  error("Error fetching nested contents: " + e);
                });
            };

            // IMPORTANT: DO NOT SET A HEIGHT! IT BREAKS THE FILE BROWSER
            return (
              <div class="relative block min-w-fit">
                <div
                  class="group min-w-fit cursor-pointer select-none px-1 hover:bg-base-100 active:bg-base-50"
                  onMouseEnter={async () => {
                    if (!isContextMenuShown()) {
                      selectedItem = normalizePath(itemPath);
                      selectedDir = isDir();

                      let normalizedItemPath = selectedItem; // reusing normalized item path in selectedItem
                      const id = await once<{ type: string }>(
                        "flux:event:contextMenuClicked",
                        (e) => {
                          switch (e.payload.type) {
                            case "newItem":
                              if (
                                isDir() &&
                                normalizedItemPath === newItemDir() &&
                                normalizedItemPath != ""
                              ) {
                                if (!open()) {
                                  openDir();
                                }
                                normalizedItemPath = "";
                              }
                              break;
                            case "removeItem":
                              console.log(selectedItem);
                              const item = selectedItem.slice(
                                0,
                                selectedItem.length - 1,
                              );
                              if (selectedDir) {
                                nestedDirs.splice(nestedDirs.indexOf(item), 1);
                              } else {
                                nestedFiles.splice(
                                  nestedFiles.indexOf(item),
                                  1,
                                );
                              }
                              updateContent();
                              break;
                          }
                        },
                      );
                      checkMustOpenDir.push(id);
                    }
                  }}
                  onMouseLeave={() => {
                    if (!isContextMenuShown() && checkMustOpenDir.length > 0) {
                      checkMustOpenDir[0]();
                      checkMustOpenDir.splice(0, 1);
                    }
                  }}
                  onclick={() => {
                    if (isDir()) {
                      openDir();
                    } else {
                      if (getTabs().length === 0) {
                        addTab([itemName, itemPath]);
                      }
                      openFile(itemPath);
                      updateBreadcrumbs(itemPath);
                    }
                  }}
                >
                  <div
                    class="context-0 flex items-center"
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
                      class={`${!showIcon() && isDir() ? "underline" : ""} context-0 whitespace-nowrap text-content group-hover:text-content-main`}
                      style={{
                        "margin-left": `${!showIcon() ? "0.5rem" : "0"}`,
                      }}
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
      </>
    );
  };

  return (
    <div
      class={`${props.loaded && "context-0"} h-full min-h-full w-full min-w-full max-w-full bg-base-200`}
      onMouseLeave={() => {
        if (!isContextMenuShown()) {
          selectedItem = "";
          selectedDir = false;

          if (!isContextMenuShown() && checkMustOpenDir.length > 0) {
            checkMustOpenDir[0]();
            checkMustOpenDir.splice(0, 1);

            forceUnlisten();
          }
        }
      }}
    >
      <Show when={props.loaded} fallback={<Startup />}>
        <div class="z-10 block h-6 w-full select-none items-center overflow-hidden overflow-ellipsis bg-base-200 px-2 font-bold text-content-main">
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
