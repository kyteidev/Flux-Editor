import { For, Show } from "solid-js";
import { createSignal } from "solid-js";

import styles from "./css/Dropdown.module.css";
import { IconExpand, IconUnexpand } from "../utils/Icons";

interface Props {
  items: string[];
  placeholder: string;
  width: string;
  height: string;
  selectedItem: (item: string) => void;
}

const Dropdown = (props: Props) => {
  const [isOpen, setOpen] = createSignal(false);
  const [selected, setSelected] = createSignal<string>(props.placeholder);

  const toggle = () => setOpen(!isOpen());

  const handleItemClick = (item: string) => {
    setSelected(item);
    setOpen(false);
    props.selectedItem(item);
  };

  return (
    <div class="relative inline-block">
      <button
        class="flex cursor-pointer items-center rounded-xl border-none bg-base-100 p-2 pl-4 text-content transition duration-300 ease-in-out hover:bg-base-100-hover active:scale-100"
        onClick={toggle}
        style={{
          width: props.width,
          height: props.height,
          "border-bottom-left-radius": isOpen() ? "0" : "0.75rem",
          "border-bottom-right-radius": isOpen() ? "0" : "0.75rem",
        }}
      >
        <div class="justify-start">{selected()}</div>
        <div class="absolute right-2">
          <Show when={isOpen()} fallback={<IconExpand />}>
            <IconUnexpand />
          </Show>
        </div>
      </button>
      {isOpen() && (
        <div
          class="absolute w-full"
          style={{ "box-shadow": "0 2px 4px rgba(0, 0, 0, 0.1)" }}
        >
          <div class="h-[1px] w-full bg-content opacity-50" />
          <ul
            class={`${styles.dropdownItem} dropdown-menu w-full text-content`}
          >
            <For each={props.items}>
              {(item) => (
                <li
                  class={`${styles.dropdownItem} dropdown-item flex w-full justify-start bg-base-100 p-2 pl-4 transition duration-300 ease-in-out hover:bg-base-100-hover`}
                  onClick={() => handleItemClick(item)}
                >
                  {item}
                </li>
              )}
            </For>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
