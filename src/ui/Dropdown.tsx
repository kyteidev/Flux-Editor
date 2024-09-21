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

import { For, onCleanup, onMount, Show } from "solid-js";
import { createSignal } from "solid-js";

import { IconExpand, IconUnexpand } from "../components/Icons/Icons";

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

  onMount(() => {
    document.addEventListener("mousedown", handleOutsideClick);
  });

  onCleanup(() => {
    document.removeEventListener("mousedown", handleOutsideClick);
  });

  const handleOutsideClick = (e: MouseEvent) => {
    if (e.target instanceof HTMLElement) {
      if (!e.target.className.includes("dropdown")) {
        setOpen(false);
      }
    }
  };

  const handleItemClick = (item: string) => {
    setSelected(item);
    setOpen(false);
    props.selectedItem(item);
  };

  return (
    <div class="relative inline-block">
      <button
        class={`dropdown ${isOpen() ? "rounded-t" : "rounded"} group flex cursor-pointer items-center border-none bg-base-100 px-2 hover:bg-base-100-hover`}
        onClick={toggle}
        style={{
          width: props.width,
          height: props.height,
        }}
      >
        <div class="group-hover:text-content-main justify-start text-content">
          {selected()}
        </div>
        <div class="group-hover:stroke-content-main absolute right-2 stroke-content">
          <Show when={isOpen()} fallback={<IconExpand />}>
            <IconUnexpand />
          </Show>
        </div>
      </button>
      <Show when={isOpen()}>
        <div id="dropdown-container" class="absolute w-full rounded-b shadow">
          <div class="h-[1px] w-full bg-base-100-hover" />
          <ul
            id="dropdown-menu"
            class="hover:text-content-main w-full text-content last:rounded-b"
          >
            <For each={props.items}>
              {(item) => (
                <li
                  class="dropdown hover:text-content-main flex w-full items-center justify-start bg-base-100 px-2 text-content last:rounded-b hover:bg-base-100-hover"
                  style={{ height: props.height }}
                  onClick={() => handleItemClick(item)}
                >
                  {item}
                </li>
              )}
            </For>
          </ul>
        </div>
      </Show>
    </div>
  );
};

export default Dropdown;
