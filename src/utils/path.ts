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

import { invoke } from "@tauri-apps/api/core";
import { getOS } from "./os";

export const checkDirPathValidity = (dirPath: string) => {
  const unixPathRegex = /^\/[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/$/;
  const windowsPathRegex = /^[a-zA-Z]:\\[a-zA-Z0-9_-]+(\\[a-zA-Z0-9_-]+)*\\$/;

  return unixPathRegex.test(dirPath) || windowsPathRegex.test(dirPath);
};

// IMPORTANT: do not call this in App.tsx, os variable may not have finished initializing, so this will think os is undefined.
export const pathSep = (): string => {
  if (getOS() === "win32") {
    return "\\";
  } else {
    return "/";
  }
};

export const joinPath = (...args: string[]): string => {
  return args
    .map((arg, index) => {
      // checks if last character is a path separator
      if (index < args.length - 1 && arg.endsWith(pathSep())) {
        return arg.slice(0, -1);
      }
      return arg;
    })
    .join(pathSep());
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
  return joinPath(dir, "");
};

export const homeDir = async (): Promise<string> => {
  const dir = await invoke<string>("user_home_dir");
  return joinPath(dir, "");
};

export const normalizePath = (path: string) => {
  let normalizedPath = path.replace(/\/{2,}/g, pathSep());
  if (normalizedPath.charAt(normalizedPath.length - 1) != pathSep()) {
    normalizedPath += pathSep();
  }
  return normalizedPath;
};

export const resolvePath = async (
  path: string,
  currentDir: string,
): Promise<string> => {
  if (path[0] === pathSep()) {
    return path;
  }

  const pathParts = path.split(pathSep());

  let finalPath = currentDir;

  for (let i = 0; i < pathParts.length; i++) {
    switch (pathParts[i]) {
      case ".":
        break;
      case "..":
        if (finalPath.length === 0) {
          break;
        } else {
          finalPath = normalizePath(finalPath).slice(0, finalPath.length - 1);
          finalPath = finalPath.slice(0, finalPath.lastIndexOf(pathSep()));
        }
        break;
      case "~":
        finalPath = await homeDir();
        break;
      default:
        finalPath = finalPath + pathSep() + pathParts[i];
    }
  }

  return normalizePath(finalPath);
};
