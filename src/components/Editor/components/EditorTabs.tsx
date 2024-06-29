import { For, Show, createSignal, onCleanup } from "solid-js";
import { IconCircle, IconClose } from "../../Icons/Icons";
import { closeFile, openFile } from "../EditorComponent";
import { fixEditorHeight } from "../../SplitPane/SplitPane";
import { dialog } from "@tauri-apps/api";
import { fileIcons, specialFileIcons } from "../../../utils/file";
import path from "path-browserify";
import { Default } from "../../Icons/FileIcons";
import { setIsValidFile } from "../EditorComponent";
import { logger } from "../../../logger";

const [tabs, setTabs] = createSignal<string[][]>([]);
const [activeTab, setActiveTab] = createSignal(0);

export const [savedTabs, setSavedTabs] = createSignal<string[]>([]);

export const addTab = (tab: string[]) => {
  if (tabs().length === 0) {
    fixEditorHeight(true);
  }
  if (!tabs().flat().includes(tab[1])) {
    // checks if the tab is already open.
    setTabs([...tabs(), tab]);
    openFile(tabs()[tabs().length - 1][1]);
  }
  setActiveTab(tabs().findIndex((t) => t[1] === tab[1]));
  openFile(tabs()[activeTab()][1]);
};

export const getTabs = () => {
  return tabs();
};

const EditorTabs = () => {
  return (
    <div class="flex h-[40px] w-full max-w-full flex-col overflow-auto bg-base-200 p-1">
      <div class="flex w-full max-w-full select-none space-x-1">
        <For each={tabs().map((t) => t[0])}>
          {(tabName, index) => {
            const [isClosed, setIsClosed] = createSignal(false);

            const open = () => {
              openFile(tabs()[index()][1]);
            };

            const closeTab = async () => {
              setIsValidFile(true);
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
              setIsClosed(true);
              setTabs(tabs().filter((t) => t !== tabs()[index()]));
              closeFile();
              if (tabs().length === 0) {
                fixEditorHeight(false); // tabs add height to editor pane, this fixes it by adding height because tabs row is hidden when all tabs are closed
              } else {
                try {
                  openFile(tabs()[index() - 1][1]); // opens the previous tab
                  setActiveTab(index() - 1);
                } catch {
                  try {
                    openFile(tabs()[index()][1]); // opens the next tab if no tabs are before closed tab
                    setActiveTab(index());
                  } catch (error) {
                    console.error(error);
                    logger(true, "EditorTabs.tsx", error as string);
                  }
                }
              }
            };

            let FileIconComponent =
              specialFileIcons[tabName.toLowerCase()] || undefined;
            if (FileIconComponent === undefined) {
              // checks file extension
              const fileExtension = path.extname(tabName);
              FileIconComponent =
                fileIcons[fileExtension.toLowerCase()] || Default;
            }

            const [hasSaved, setHasSaved] = createSignal(true);

            // TODO: optimize this, the signals won't rerender the close button when updated for some reason. This is a temporary fix.
            const checkHasSaved = setInterval(() => {
              setHasSaved(savedTabs().includes(tabs()[index()][1]));
            }, 250);

            onCleanup(() => clearInterval(checkHasSaved)); // deletes the setInterval after tab is closed.

            return (
              <div
                class={`${activeTab() === index() ? "bg-base-100" : "bg-base-200"} flex h-8 max-w-52 items-center rounded-xl p-1 pl-2 pr-2 text-center transition duration-300 ease-in-out hover:bg-base-100-hover active:scale-95`}
                onclick={() => {
                  if (!isClosed()) {
                    setActiveTab(index());
                    open();
                  }
                }}
              >
                <div class="min-h-[24px] min-w-[24px]">
                  <FileIconComponent />
                </div>
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
