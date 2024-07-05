/*
Copyright © 2024 Narvik Contributors.

This file is part of Narvik Editor.

Narvik Editor is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Narvik Editor is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Narvik Editor. If not, see <https://www.gnu.org/licenses/>.
*/

import { invoke } from "@tauri-apps/api";
import { homeDir } from "@tauri-apps/api/path";
import path from "path-browserify";
import { error, info } from "tauri-plugin-log-api";

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

export async function cloneRepo(url: string): Promise<void> {
  const repoName = getRepoName(url);
  let homePath = await homeDir();

  repoPath = path.join(homePath ? homePath.toString() : "", repoName);

  info(`Cloning repository ${url} to ${repoPath}`);

  try {
    await invoke("clone_repo", { url: url, path: repoPath });
    info("Repository cloned successfully");
  } catch (e) {
    error(`Error cloning repository: ${e}`);
  }
}

export function getRepoPath(): string {
  return repoPath;
}
