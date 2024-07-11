import { dialog } from "@tauri-apps/api";
import { getOS } from "./utils/os";
import { getVersion } from "@tauri-apps/api/app";
import { loaded, loadEditor } from "./pages/Editor";
import { resolveResource } from "@tauri-apps/api/path";
import { addTab } from "./components/Editor/components/EditorTabs";
import { openFile } from "./components/Editor/EditorComponent";
import { getSettingsPath } from "./settingsManager";
import { dirname } from "./utils/path";

export const about = async () => {
  const appVersion = getVersion();

  let licensesLocation: string;
  if ((await getOS()) === "darwin") {
    licensesLocation = "Flux Editor > Legal Notices";
  } else {
    licensesLocation = "Menu > Help";
  }

  dialog.message(
    "Copyright © 2024 The Flux Editor Contributors.\nLicensed under the GNU General Public License v3.0.\nSee " +
      licensesLocation +
      " for license notices.",
    { title: "Flux Editor " + (await appVersion) },
  );
};

// TODO: maybe merge these two functions?
export const license = async () => {
  const resourcePath = await resolveResource("../resources/LICENSE.txt");
  if (!loaded()) {
    loadEditor(dirname(resourcePath));
  }
  addTab(["LICENSE", resourcePath]);
  openFile(resourcePath, true);
};

export const licenseThirdParty = async () => {
  const resourcePath = await resolveResource(
    "../resources/THIRD-PARTY-LICENSES.txt",
  );
  if (!loaded()) {
    loadEditor(dirname(resourcePath));
  }
  addTab(["THIRD PARTY LICENSES", resourcePath]);
  openFile(resourcePath, true);
};

export const settings = () => {
  if (loaded()) {
    addTab(["Settings", getSettingsPath()]);
    openFile(getSettingsPath());
  }
};
