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

import { For, Show } from "solid-js";
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

  const handleItemClick = (item: string) => {
    setSelected(item);
    setOpen(false);
    props.selectedItem(item);
  };

  return (
    <div class="relative inline-block">
      <button
        class={`${isOpen() ? "" : "rounded-b"} flex cursor-pointer items-center rounded-t border-none bg-base-100 p-2 pl-4 text-content transition duration-100 ease-in-out hover:bg-base-100-hover`}
        onClick={toggle}
        style={{
          width: props.width,
          height: props.height,
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
        <div id="dropdown-container" class="absolute w-full rounded-b shadow">
          <div class="h-[1px] w-full bg-content opacity-50" />
          <ul id="dropdown-menu" class="w-full text-content last:rounded-b">
            <For each={props.items}>
              {(item) => (
                <li
                  class="dropdown-item flex w-full justify-start bg-base-100 p-2 pl-4 transition duration-100 ease-in-out last:rounded-b hover:bg-base-100-hover"
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
