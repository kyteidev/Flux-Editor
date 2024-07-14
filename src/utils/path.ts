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

import { invoke } from "@tauri-apps/api/tauri";
import { getOS } from "./os";

let os: string;
export const initPathOS = async () => {
  os = await getOS();
};

export const checkDirPathValidity = (dirPath: string) => {
  const unixPathRegex = /^\/[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/$/;
  const windowsPathRegex = /^[a-zA-Z]:\\[a-zA-Z0-9_-]+(\\[a-zA-Z0-9_-]+)*\\$/;

  return unixPathRegex.test(dirPath) || windowsPathRegex.test(dirPath);
};

// IMPORTANT: do not call this in App.tsx, os variable may not have finished initializing, so this will think os is undefined.
export const pathSep = (): string => {
  if (os === "windows") {
    return "\\";
  } else {
    return "/";
  }
};

export const joinPath = (...args: string[]): string => {
  return args.join(pathSep());
};

export const extname = (path: string): string => {
  return path.slice(path.lastIndexOf(".") + 1, path.length);
};

export const basename = (pathProp: string): string => {
  let path = pathProp;
  if (path[path.length - 1] === pathSep()) {
    path = path.slice(0, -1);
  }
  return path.slice(path.lastIndexOf(pathSep()) + 1, path.length);
};

export const dirname = (pathProp: string) => {
  let path = pathProp;
  if (path[path.length - 1] === pathSep()) {
    path = path.slice(0, -1);
  }
  return path.slice(0, path.lastIndexOf(pathSep()) + 1);
};

export const appDataDir = async (): Promise<string> => {
  const dir = await invoke<string>("app_data_dir");
  return dir;
};

export const homeDir = async (): Promise<string> => {
  const dir = await invoke<string>("user_home_dir");
  return dir;
};

export const resolveResource = async (resource: string): Promise<string> => {
  const path = await invoke<string>("resolve_resource", { resource: resource });
  return path;
};
