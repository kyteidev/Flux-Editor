import { fs } from "@tauri-apps/api";
import { appDataDir } from "@tauri-apps/api/path";
import path from "path-browserify";

const settingsPath = path.join(await appDataDir(), "settings");

export const settings: { [key: string]: any } = {
  tabSize: 4,
};

export const initSettings = async () => {
  if (!(await fs.exists(await appDataDir()))) {
    await fs.createDir(await appDataDir());
  }
  if (!(await fs.exists(settingsPath))) {
    fs.createDir(settingsPath);
  }
  if (!(await fs.exists(path.join(settingsPath, "settings.json")))) {
    fs.writeFile(
      path.join(settingsPath, "settings.json"),
      JSON.stringify(settings, null, 2),
    );
  }
};

export const setSetting = (setting: string, value: any) => {
  settings[setting] = value;
  fs.writeFile(
    path.join(settingsPath, "settings.json"),
    JSON.stringify(settings, null, 2),
  );
};

export const getSetting = (setting: string): any => {
  return settings[setting];
};

export const getSettingsPath = (): string => {
  return path.join(settingsPath, "settings.json");
};
