import { invoke } from "@tauri-apps/api";
import { homeDir } from "@tauri-apps/api/path";
import * as path from "path-browserify";

let repoPath: string;

//const checkGit = async (): Promise<boolean> => {
  //try {
    //const isInstalled = await invoke<boolean>("is_git_installed");
    //return isInstalled;
  //} catch (error) {
    //console.error(`Error checking git installation: ${error}`);
    //return false;
  //}
//};

export const getRepoName = (url: string): string => {
  const parts = url.split("/");
  const repoWithGit = parts[parts.length - 1];
  return repoWithGit.replace(".git", "");
};

export async function cloneRepo(url: string): Promise<void> {
  const repoName = getRepoName(url);
  let homePath = await homeDir();

  repoPath = path.join(homePath ? homePath.toString() : "", repoName);

  console.log(`Cloning repository ${url} to ${repoPath}`);

  try {
    await invoke("clone_repo", { url: url, path: repoPath });
    console.log("Repository cloned successfully");
  } catch (error) {
    console.error(`Error cloning repository: ${error}`);
  }
}

export function getRepoPath(): string {
  return repoPath;
}
