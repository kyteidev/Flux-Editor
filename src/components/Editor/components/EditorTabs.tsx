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

import { For, Show, createSignal, onCleanup, onMount } from "solid-js";
import { IconCircle, IconClose, IconSettings } from "../../Icons/Icons";
import { closeFile, openFile } from "../EditorComponent";
import { fixEditorHeight } from "../../SplitPane/SplitPane";
import { dialog } from "@tauri-apps/api";
import { fileIcons, specialFileIcons } from "../../../utils/file";
import { Default } from "../../Icons/FileIcons";
import { getSetting, getSettingsPath } from "../../../settingsManager";
import { error } from "tauri-plugin-log-api";
import { extname } from "../../../utils/path";
import { invoke } from "@tauri-apps/api/tauri";
import { updateLang } from "../../StatusBar/components/Lang";

let activeInterval: number;

const [tabs, setTabs] = createSignal<string[][]>([]);
const [activeTab, setActiveTab] = createSignal(0);

const [showFileIcons, setShowFileIcons] = createSignal(true);

export const [savedTabs, setSavedTabs] = createSignal<string[]>([]);

export const loadEditorTabsSettings = () => {
  if (
    getSetting("showFileIcons") === "both" ||
    getSetting("showFileIcons") === "EditorTabs"
  ) {
    setShowFileIcons(true);
  } else {
    setShowFileIcons(false);
  }
};

export const addTab = async (tab: string[]) => {
  if (tabs().length === 0) {
    fixEditorHeight(true);
  }
  if (!tabs().flat().includes(tab[1])) {
    // checks if the tab is already open.
    setTabs([...tabs(), tab]);
  }
  setActiveTab(tabs().findIndex((t) => t[1] === tab[1]));
};

export const clearTabs = () => {
  setTabs([]);
  setActiveTab(0);
  clearInterval(activeInterval);
  fixEditorHeight(false);
};

export const getTabs = () => {
  return tabs();
};

const EditorTabs = () => {
  onMount(() => {
    loadEditorTabsSettings();
  });

  return (
    <div class="flex h-9 max-h-9 min-h-9 w-full max-w-full flex-col items-center justify-center overflow-hidden bg-base-200">
      <div class="flex max-h-full min-h-full w-full max-w-full select-none space-x-1 overflow-x-auto overflow-y-hidden p-1 pb-0">
        <For each={tabs().map((t) => t[0])}>
          {(tabName, index) => {
            const [isClosed, setIsClosed] = createSignal(false);

            const open = () => {
              openFile(tabs()[index()][1]);
            };

            const closeTab = async () => {
              if (!savedTabs().includes(tabs()[index()][1])) {
                // checks if there are unsaved changes.
                if (
                  (await dialog.ask("Your changes will not be saved.", {
                    title: "Are you sure you want to close this file?",
                    type: "warning",
                  })) === false
                ) {
                  savedTabs().splice(
                    savedTabs().indexOf(tabs()[index()][1]),
                    1,
                  ); // for some reason file gets saved when closing, no matter the result of this ask dialog. This removes the path from savedTabs() array
                  return;
                }
              }
              if (savedTabs().length != tabs().length) {
                invoke("set_doc_edited", { edited: false });
              }
              savedTabs().splice(savedTabs().indexOf(tabs()[index()][1]), 1);
              setTabs(tabs().filter((t) => t !== tabs()[index()]));

              setIsClosed(true);

              closeFile();

              if (tabs().length === 0) {
                fixEditorHeight(false); // tabs add height to editor pane, this fixes it by adding height because tabs row is hidden when all tabs are closed
                updateLang(true);
              } else {
                try {
                  openFile(tabs()[index() - 1][1]); // opens the previous tab
                  setActiveTab(index() - 1);
                } catch {
                  try {
                    openFile(tabs()[index()][1]); // opens the next tab if no tabs are before closed tab
                    setActiveTab(index());
                  } catch (e) {
                    error(e as string);
                  }
                }
              }
            };

            let FileIconComponent =
              specialFileIcons[tabName.toLowerCase()] || undefined;
            if (FileIconComponent === undefined) {
              if (
                tabs().flat().includes(getSettingsPath()) &&
                tabName === "Settings"
              ) {
                FileIconComponent = IconSettings;
              } else {
                // checks file extension
                const fileExtension = extname(tabName);
                FileIconComponent =
                  fileIcons[fileExtension.toLowerCase()] || Default;
              }
            }

            const [hasSaved, setHasSaved] = createSignal(true);

            // TODO: optimize this, the signals won't rerender the close button when updated for some reason. This is a temporary fix.
            const checkHasSaved = setInterval(() => {
              setHasSaved(savedTabs().includes(tabs()[index()][1]));
            }, 250);
            activeInterval = checkHasSaved;

            onCleanup(() => clearInterval(checkHasSaved)); // deletes the setInterval after tab is closed.

            return (
              <div
                class={`${activeTab() === index() ? "bg-base-100" : "bg-base-200"} mr-1 flex h-8 max-w-52 items-center rounded px-2 py-1 text-center hover:bg-base-100-hover active:brightness-125`}
                onclick={() => {
                  if (!isClosed()) {
                    setActiveTab(index());
                    open();
                  }
                }}
              >
                <Show when={showFileIcons()}>
                  <div class="min-h-[24px] min-w-[24px]">
                    <FileIconComponent />
                  </div>
                </Show>
                <div class="block max-h-8 max-w-52 overflow-hidden overflow-ellipsis whitespace-nowrap">
                  {tabName}
                </div>
                <button
                  class="ml-2 h-4 min-h-4 w-4 min-w-4 hover:opacity-50"
                  onclick={closeTab}
                >
                  <Show
                    when={hasSaved()}
                    fallback={
                      <div class="relative left-[2px]">
                        <IconCircle />
                      </div>
                    }
                  >
                    <IconClose />
                  </Show>
                </button>
              </div>
            );
          }}
        </For>
      </div>
    </div>
  );
};

export default EditorTabs;
