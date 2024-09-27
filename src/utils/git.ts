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

import { invoke } from "@tauri-apps/api";
import { error, info } from "tauri-plugin-log-api";
import { joinPath } from "./path";

let repoPath: string;

/*
const checkGit = async (): Promise<boolean> => {
try {
const isInstalled = await invoke<boolean>("is_git_installed");
return isInstalled;
} catch (error) {
console.error(`Error checking git installation: ${error}`);
return false;
}
};
*/

export const getRepoName = (url: string): string => {
  const parts = url.split("/");
  const repoWithGit = parts[parts.length - 1];
  return repoWithGit.replace(".git", "");
};

export async function cloneRepo(url: string, path: string): Promise<string> {
  const repoName = getRepoName(url);

  repoPath = joinPath(path, repoName);

  info("Cloning repository...");

  try {
    await invoke("clone_repo", { url: url, path: repoPath });
    info("Repository cloned successfully");
    return "";
  } catch (e) {
    error(`Failed to clone repository: ${e}`);
    return e as string;
  }
}

export function getRepoPath(): string {
  return repoPath;
}
