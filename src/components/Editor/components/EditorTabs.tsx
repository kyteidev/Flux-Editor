import { For, createSignal } from "solid-js";
import { IconClose } from "../../Icons/Icons";
import { openFile } from "../EditorComponent";

const [tabs, setTabs] = createSignal<string[][]>([]);
const [activeTab, setActiveTab] = createSignal(0);

export const addTab = (tab: string[]) => {
  if (!tabs().flat().includes(tab[1])) {
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
    <div class="h-[40px] w-full max-w-full overflow-auto bg-base-200 p-1">
      <div class="flex w-full max-w-full select-none space-x-1">
        <For each={tabs().map((t) => t[0])}>
          {(tabName, index) => {
            const [isClosed, setIsClosed] = createSignal(false);

            const open = () => {
              openFile(tabs()[index()][1]);
            };

            const closeTab = () => {
              setIsClosed(true);
              setTabs(tabs().filter((t) => t !== tabs()[index()]));
              if (tabs().length === 0) {
                openFile("blank");
              } else {
                setActiveTab(index() - 1);
                openFile(tabs()[index() - 1][1]);
              }
            };

            return (
              <div
                class={`${activeTab() === index() ? "bg-base-100" : "bg-base-200"} flex h-8 max-w-36 items-center rounded-xl p-1 pl-2 pr-2 text-center transition duration-300 ease-in-out hover:bg-base-100-hover active:scale-95`}
                onclick={() => {
                  if (!isClosed()) {
                    setActiveTab(index());
                    open();
                  }
                }}
              >
                <div class="block max-h-8 max-w-32 overflow-hidden overflow-ellipsis whitespace-nowrap">
                  {tabName}
                </div>
                <button
                  class="ml-2 h-4 min-h-4 w-4 min-w-4 hover:opacity-50"
                  onclick={closeTab}
                >
                  <IconClose />
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
