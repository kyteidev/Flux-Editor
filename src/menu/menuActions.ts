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

import { dialog, invoke } from "@tauri-apps/api";
import { getOS } from "../utils/os";
import { getVersion } from "@tauri-apps/api/app";
import { addTab } from "../components/Editor/components/EditorTabs";
import { openFile } from "../components/Editor/EditorComponent";
import { getSettingsPath } from "../settingsManager";
import { appDataDir, joinPath, resolveResource } from "../utils/path";
import { updateBreadcrumbs } from "../components/Editor/components/EditorBreadcrumbs";

export const about = async () => {
  const appVersion = getVersion();

  let licensesLocation: string;
  if ((await getOS()) === "darwin") {
    licensesLocation = "Help > Legal Notices";
  } else {
    licensesLocation = "Menu > Help";
  }

  dialog.message(
    "Copyright © 2024 The Flux Editor Contributors.\nLicensed under the GNU General Public License v3.0.\n\nSee " +
      licensesLocation +
      " for license notices.",
    { title: "Flux Editor " + (await appVersion) },
  );
};

// TODO: maybe merge these two functions?
export const license = async () => {
  const resourcePath = await resolveResource("../resources/LICENSE.txt");
  addTab([":LICENSE", resourcePath]);
  openFile(resourcePath, true);
};
export const licenseThirdPartyJS = async () => {
  const resourcePath = await resolveResource(
    "../resources/THIRD-PARTY-LICENSES-JS.txt",
  );
  addTab(["JS: THIRD PARTY LICENSES", resourcePath]);
  openFile(resourcePath, true);
};
export const licenseThirdPartyRust = async () => {
  const resourcePath = await resolveResource(
    "../resources/THIRD-PARTY-LICENSES-Rust.txt",
  );
  addTab(["Rust: THIRD PARTY LICENSES", resourcePath]);
  openFile(resourcePath, true);
};
export const licenseFonts = async () => {
  const resourcePath = await resolveResource("../resources/FONT-LICENSES.txt");
  addTab([":FONT LICENSES", resourcePath]);
  openFile(resourcePath, true);
};

export const viewLogs = async () => {
  const logDir = joinPath(await appDataDir(), "logs");
  const logFilePath = joinPath(logDir, "main.log");

  addTab([":FLUX LOGS", logFilePath]);
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
