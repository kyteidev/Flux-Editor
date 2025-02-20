/*
Copyright © 2024-2025 kyteidev.

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

import { invoke } from "@tauri-apps/api/core";
import { getOS } from "../utils/os";
import { getVersion } from "@tauri-apps/api/app";
import { addTab } from "../components/Editor/components/EditorTabs";
import { openFile } from "../components/Editor/EditorComponent";
import { getSettingsPath } from "../settingsManager";
import { appDataDir, joinPath } from "../utils/path";
import { updateBreadcrumbs } from "../components/Editor/components/EditorBreadcrumbs";
import * as dialog from "@tauri-apps/plugin-dialog";
import { resolveResource } from "@tauri-apps/api/path";

export const about = async () => {
  const appVersion = getVersion();

  let licensesLocation: string;
  if (getOS() === "darwin") {
    licensesLocation = "Help > Legal Notices";
  } else {
    licensesLocation = "Menu > Help";
  }

  dialog.message(
    "Copyright © 2024 kyteidev.\nLicensed under the GNU General Public License v3.0.\n\nSee " +
      licensesLocation +
      " for license notices.",
    { title: "Flux Editor " + (await appVersion) },
  );
};

// TODO: maybe merge these two functions?
export const license = async () => {
  const resourcePath = await resolveResource("../resources/LICENSE.txt");
  addTab(["LICENSE", resourcePath]);
  openFile(resourcePath, true);
};
export const licenseThirdPartyNPM = async () => {
  const resourcePath = await resolveResource(
    "../resources/THIRD-PARTY-LICENSES-NPM.txt",
  );
  addTab(["NPM THIRD PARTY LICENSES", resourcePath]);
  openFile(resourcePath, true);
};
export const licenseThirdPartyCargo = async () => {
  const resourcePath = await resolveResource(
    "../resources/THIRD-PARTY-LICENSES-Cargo.txt",
  );
  addTab(["Cargo THIRD PARTY LICENSES", resourcePath]);
  openFile(resourcePath, true);
};
export const licenseFonts = async () => {
  const resourcePath = await resolveResource("../resources/FONT-LICENSES.txt");
  addTab(["FONT LICENSES", resourcePath]);
  openFile(resourcePath, true);
};

export const viewLogs = async () => {
  const logDir = joinPath(await appDataDir(), "logs");
  const logFilePath = joinPath(logDir, "main.log");

  addTab(["Flux Editor Logs", logFilePath]);
  openFile(logFilePath, true);
  updateBreadcrumbs(logFilePath);
};

export const settings = () => {
  addTab(["Settings", getSettingsPath()]);
  openFile(getSettingsPath());
};

export const newWindow = () => {
  invoke("new_window");
};
