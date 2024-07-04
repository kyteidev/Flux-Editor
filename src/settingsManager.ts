import { fs } from "@tauri-apps/api";
import { appDataDir } from "@tauri-apps/api/path";
import path from "path-browserify";
import { loadFBSettings } from "./components/FileBrowser/FileBrowser";
import { loadEditorSettings } from "./components/Editor/EditorComponent";
import { loadEditorTabsSettings } from "./components/Editor/components/EditorTabs";
import { warn } from "tauri-plugin-log-api";

let settingsDir: string;
let settingsFile: string;

export const settings: { [key: string]: any } = {
  "editor:fontSize": 16,
  showFileIcons: "both",
  tabSize: 4,
};

export const initSettings = async () => {
  settingsDir = path.join(await appDataDir(), "settings");
  settingsFile = path.join(settingsDir, "settings.json");

  if (!(await fs.exists(await appDataDir()))) {
    await fs.createDir(await appDataDir());
  }
  if (!(await fs.exists(settingsDir))) {
    fs.createDir(settingsDir);
  }
  if (!(await fs.exists(settingsFile))) {
    fs.writeFile(
      path.join(settingsDir, "settings.json"),
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
