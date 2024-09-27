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

import { createSignal, Match, onMount, Show, Switch } from "solid-js";
import { newItem } from "../FileBrowser/FileBrowser";

const [show, setShow] = createSignal(false);
const [xPos, setXPos] = createSignal(0);
const [yPos, setYPos] = createSignal(0);

const [menuID, setMenuID] = createSignal(-1);

export const isContextMenuShown = () => {
  return show();
};

const handleContextMenu = (e: MouseEvent) => {
  e.preventDefault();

  if (e.target instanceof HTMLElement) {
    const className = e.target.className;

    const match = className.match(/context-(\d+)/);

    if (match) {
      const id = parseInt(match[1], 10);
      setMenuID(id);
    } else {
      setMenuID(-1);
    }
  }

  document.addEventListener("mousedown", handleOutsideClick);
  setShow(true);

  setXPos(e.clientX);
  setYPos(e.clientY);
};

const handleOutsideClick = (e: MouseEvent) => {
  if (e.target instanceof HTMLElement) {
    if (!e.target.className.includes("context-menu")) {
      setShow(false);
      document.removeEventListener("mousedown", handleOutsideClick);
    }
  }
};

const MenuItem = (props: {
  first?: boolean;
  last?: boolean;
  text: string;
  separator?: boolean;
  width?: string;
  action?: () => void;
  shortcut?: string;
}) => {
  return (
    <div
      class={`context-menu ${props.first && "rounded-t"} ${props.last && "rounded-b"} ${props.separator && "border-b-[1px] border-base-100-hover"} ${props.width ? `${props.width}` : "w-32"} z-[51] flex h-6 cursor-pointer items-center bg-base-100 px-2 align-middle text-sm text-content-main hover:bg-base-100-hover`}
      onClick={() => {
        setShow(false);
        document.removeEventListener("mousedown", handleOutsideClick);
        if (props.action) {
          props.action();
        }
      }}
    >
      {props.text}
      <p class="ml-auto text-xs opacity-50">{props.shortcut}</p>
    </div>
  );
};

const ContextMenu = () => {
  onMount(() => {
    window.addEventListener("contextmenu", handleContextMenu);
  });

  return (
    <Show when={show()}>
      <div
        class="absolute z-[51] shadow"
        style={{ top: `${yPos()}px`, left: `${xPos()}px` }}
      >
        <Switch>
          <Match when={menuID() === 0}>
            <MenuItem first text="New File" action={() => newItem("file")} />
            <MenuItem last text="New Folder" action={() => newItem("folder")} />
          </Match>
        </Switch>
      </div>
    </Show>
  );
};

export default ContextMenu;
