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

import { fs } from "@tauri-apps/api";
import { loadFBSettings } from "./components/FileBrowser/FileBrowser";
import { loadEditorSettings } from "./components/Editor/EditorComponent";
import { loadEditorTabsSettings } from "./components/Editor/components/EditorTabs";
import { warn } from "tauri-plugin-log-api";
import { appDataDir, joinPath } from "./utils/path";

let settingsDir: string;
let settingsFile: string;

export const settings: { [key: string]: any } = {
  "editor:fontSize": 16,
  showFileIcons: "FileBrowser",
  tabSize: 4,
};

export const initSettings = async () => {
  settingsDir = joinPath(await appDataDir(), "settings");
  settingsFile = joinPath(settingsDir, "settings.json");

  if (!(await fs.exists(await appDataDir()))) {
    await fs.createDir(await appDataDir());
  }
  if (!(await fs.exists(settingsDir))) {
    fs.createDir(settingsDir);
  }
  if (!(await fs.exists(settingsFile))) {
    fs.writeFile(
      joinPath(settingsDir, "settings.json"),
      JSON.stringify(settings, null, 2),
    );
  } else {
    fs.readTextFile(settingsFile).then((data) => {
      const parsedData = JSON.parse(data);

      for (let i = 0; i < Object.keys(parsedData).length; i++) {
        const setting = Object.keys(settings)[i];
        if (parsedData[setting] === undefined) {
          parsedData[setting] = settings[setting];
        } else {
          const settingType = typeof settings[setting];
          if (typeof parsedData[setting] !== settingType) {
            parsedData[setting] = settings[setting];
            warn(
              "Invalid setting: parsed setting " +
                parsedData[setting] +
                " has type " +
                typeof parsedData +
                " instead of type " +
                settingType,
            );
          } else {
            settings[setting] = parsedData[setting];
          }
        }
      }
      fs.writeFile(settingsFile, JSON.stringify(settings, null, 2));
    });
  }
};

export const setSetting = (setting: string, value: any) => {
  settings[setting] = value;
  fs.writeFile(settingsFile, JSON.stringify(settings, null, 2));
};

export const getSetting = (setting: string): any => {
  return settings[setting];
};

export const getSettingsPath = (): string => {
  return settingsFile;
};

export const loadSettings = () => {
  // FIXME: settings loaded but needs reload to load settings
  loadFBSettings();
  loadEditorSettings();
  loadEditorTabsSettings();
};
