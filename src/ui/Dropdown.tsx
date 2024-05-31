import { For } from "solid-js";
import { createSignal } from "solid-js";

import styles from "./css/Dropdown.module.css";

interface Props {
  items: string[];
  width: string;
  height: string;
}

function Dropdown(props: Props) {
  const [isOpen, setOpen] = createSignal(false);
  const [selected, setSelected] = createSignal<string | null>(null);

  const toggle = () => setOpen(!isOpen());

  const handleItemClick = (item: string) => {
    setSelected(item);
    setOpen(false);
  };

  return (
    <div class="relative inline-block" tabIndex={-1}>
      <button
        class="p-2 pl-4 text-content border-none cursor-pointer transition ease-in-out rounded-xl bg-base-100 hover:bg-base-100-hover active:scale-100 duration-300"
        onClick={toggle}
        style={{
          width: props.width,
          height: props.height,
          "border-bottom-left-radius": isOpen() ? "0" : "0.75rem",
          "border-bottom-right-radius": isOpen() ? "0" : "0.75rem",
        }}
      >
        <div class="flex justify-start">{selected() || "Workspace"}</div>
      </button>
      {isOpen() && (
        <div class="absolute w-full">
          <div class="w-full h-[1px] bg-content opacity-50" />
          <ul
            class={`${styles.dropdownItem} dropdown-menu w-full text-content`}
          >
            <For each={props.items}>
              {(item) => (
                <li
                  class={`${styles.dropdownItem} dropdown-item transition ease-in-out duration-300 w-full flex justify-start p-2 pl-4 bg-base-100 hover:bg-base-100-hover`}
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
}

export default Dropdown;
