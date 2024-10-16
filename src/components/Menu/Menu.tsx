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

// TODO: Optimize this, add keyboard shortcuts support

import { createSignal, JSX, Show, onMount, onCleanup } from "solid-js";
import Submenu from "./Submenu";
import {
  about,
  license,
  licenseFonts,
  licenseThirdPartyJS,
  licenseThirdPartyRust,
  newWindow,
  settings,
  viewLogs,
} from "../../menu/menuActions";
import { saveFile } from "../Editor/EditorComponent";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import Button from "../../ui/Button";
import { toggleSearch } from "../Search/Search";
import { IconMenu } from "../Icons/Icons";
import { hideFB, hideTerm, setHideFB, setHideTerm } from "../../App";
import { checkUpdates } from "../StatusBar/components/Update";
import { getOS } from "../../utils/os";
const appWindow = getCurrentWebviewWindow();

const [showMenu, setShowMenu] = createSignal(false);

const keysPressed: string[] = [];

export const MenuContainer = (props: { children: JSX.Element }) => {
  return <div class="mt-1 rounded shadow">{props.children}</div>;
};

const MenuItem = (props: {
  first?: boolean;
  last?: boolean;
  item: number;
  text: string;
  separator?: boolean;
  width?: string;
  action?: () => void;
  shortcut?: string;
}) => {
  return (
    <div
      class={`menu ${props.first && "rounded-t"} ${props.last && "rounded-b"} ${props.separator && "border-b-[1px] border-base-50"} ${props.width ? `${props.width}` : "w-32"} absolute z-[51] flex h-6 cursor-pointer items-center bg-base-100 px-2 align-middle text-sm text-content-main hover:bg-base-50`}
      style={{ top: `calc(${props.item} * 1.5rem + 0.5rem)` }}
      onClick={() => {
        setShowMenu(false);
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

const shortcuts: { [key: string]: () => void } = {
  "Control,Comma": () => {
    settings();
  },
  "Control,S": () => {
    saveFile();
  },
  "Control,Shift,S": () => {
    saveFile(true);
  },
  "Alt,Space": () => {
    toggleSearch();
  },
  "Control,1": () => {
    setHideFB(!hideFB());
  },
  "Control,2": () => {
    setHideTerm(!hideTerm());
  },
};

const runShortcut = () => {
  for (const shortcut of Object.keys(shortcuts)) {
    const shortcutKeys = shortcut.split(",");
    const filteredKeysPressed = keysPressed.map((key) =>
      key.replace("Left", "").replace("Right", ""),
    );
    if (shortcutKeys.every((key) => filteredKeysPressed.includes(key))) {
      shortcuts[shortcut]();
      setShowMenu(false);
      document.removeEventListener("mousedown", handleOutsideClick);
      break;
    }
  }
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (!keysPressed.includes(e.code)) {
    keysPressed.push(e.code);

    runShortcut();
  }
};

const handleKeyUp = (e: KeyboardEvent) => {
  keysPressed.splice(keysPressed.indexOf(e.code), 1);
};

const handleOutsideClick = (e: MouseEvent) => {
  if (e.target instanceof HTMLElement) {
    if (!e.target.className.includes("menu")) {
      setShowMenu(false);
      document.removeEventListener("mousedown", handleOutsideClick);
    }
  }
};

const Menu = () => {
  const [os, setOS] = createSignal();
  const [isFullscreen, setIsFullscreen] = createSignal(false);

  onMount(async () => {
    setOS(getOS());
    if (os() != "darwin") {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("keyup", handleKeyUp);
    } else if (os() === "darwin") {
      setIsFullscreen(await appWindow.isFullscreen());
      appWindow.listen("tauri://resize", async () => {
        setIsFullscreen(await appWindow.isFullscreen());
      });
    }
  });

  onCleanup(() => {
    if (os() != "darwin") {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("mousedown", handleOutsideClick);
    }
  });

  return (
    <Show
      when={os() != "darwin"}
      fallback={
        <Show when={!isFullscreen()}>
          <div class="w-[58px]" />
        </Show>
      }
    >
      <div>
        <Button
          colorBg={true}
          height="18px"
          text="Menu"
          class="menu bg-base-200 text-content-main"
          icon={<IconMenu />}
          action={() => {
            setShowMenu(!showMenu());
            if (showMenu()) {
              document.addEventListener("mousedown", handleOutsideClick);
            } else {
              document.removeEventListener("mousedown", handleOutsideClick);
            }
          }}
        />
        <Show when={showMenu()}>
          <MenuContainer>
            <Submenu text="File" item={1} main={true} first={true}>
              <MenuItem
                first={true}
                item={1}
                text="New File"
                shortcut="Ctrl+N"
                width="w-48"
              />
              <MenuItem
                item={2}
                text="New Project"
                shortcut="Ctrl+Shift+N"
                width="w-48"
              />
              <MenuItem
                item={3}
                text="New Window"
                separator={true}
                shortcut="Ctrl+W"
                action={() => newWindow()}
                width="w-48"
              />
              <MenuItem
                item={4}
                text="Open..."
                shortcut="Ctrl+O"
                width="w-48"
              />
              <MenuItem
                item={5}
                text="Save"
                shortcut="Ctrl+S"
                action={() => saveFile()}
                width="w-48"
              />
              <MenuItem
                item={6}
                text="Save As..."
                separator={true}
                shortcut="Ctrl+Shift+S"
                action={() => saveFile(true)}
                width="w-48"
              />
              <MenuItem
                item={7}
                text="Settings"
                action={() => settings()}
                width="w-48"
              />
              <MenuItem
                last={true}
                item={8}
                text="Quit"
                shortcut="Ctrl+,"
                action={() => appWindow.close()}
                width="w-48"
              />
            </Submenu>
            <Submenu text="Edit" item={2} main={true}>
              <MenuItem
                first={true}
                item={1}
                text="Undo"
                shortcut="Ctrl+Z"
                width="w-36"
              />
              <MenuItem
                item={2}
                text="Redo"
                shortcut="Ctrl+Shift+Z"
                separator={true}
                width="w-36"
              />
              <MenuItem item={3} text="Cut" shortcut="Ctrl+X" width="w-36" />
              <MenuItem item={4} text="Copy" shortcut="Ctrl+C" width="w-36" />
              <MenuItem item={5} text="Paste" shortcut="Ctrl+V" width="w-36" />
              <MenuItem
                item={6}
                text="Select All"
                shortcut="Ctrl+A"
                separator={true}
                width="w-36"
              />
              <MenuItem item={7} text="Find" shortcut="Ctrl+F" width="w-36" />
              <MenuItem
                last={true}
                item={8}
                text="Replace"
                shortcut="Ctrl+Alt+F"
                width="w-36"
              />
            </Submenu>
            <Submenu text="View" item={3} main={true}>
              <MenuItem first={true} item={1} text="Themes" />
              <MenuItem item={2} text="Focus Mode" />
              <MenuItem last={true} item={3} text="Fullscreen" />
            </Submenu>
            <Submenu text="Modules" item={4} main={true}>
              <MenuItem
                first={true}
                item={1}
                text="Search"
                shortcut="Alt+Space"
                width="w-44"
              />
              <MenuItem
                item={2}
                text="File Browser"
                shortcut="Ctrl+1"
                width="w-44"
                action={() => setHideFB(!hideFB())}
              />
              <MenuItem
                last={true}
                item={3}
                text="Terminal"
                shortcut="Ctrl+2"
                width="w-44"
                action={() => setHideTerm(!hideTerm())}
              />
            </Submenu>
            <Submenu text="Help" item={5} main={true} last={true}>
              <MenuItem
                first
                item={1}
                text="About"
                width="w-60"
                action={() => about()}
              />
              <MenuItem
                item={2}
                text="Check for Updates"
                width="w-60"
                action={() => checkUpdates()}
              />
              <MenuItem
                item={3}
                text="View Logs"
                width="w-60"
                separator
                action={() => viewLogs()}
              />
              <MenuItem
                item={4}
                text="Flux Editor License"
                width="w-60"
                action={() => license()}
              />
              <MenuItem
                item={5}
                text="JS Third Party Licenses"
                width="w-60"
                action={() => licenseThirdPartyJS()}
              />
              <MenuItem
                item={6}
                text="Rust Third Party Licenses"
                width="w-60"
                action={() => licenseThirdPartyRust()}
              />
              <MenuItem
                last={true}
                item={7}
                text="Font Licenses and Legal Notices"
                width="w-60"
                action={() => licenseFonts()}
              />
            </Submenu>
          </MenuContainer>
        </Show>
      </div>
    </Show>
  );
};

export default Menu;
