/*
Copyright © 2024 Narvik Contributors.

This file is part of Narvik Editor.

Narvik Editor is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Narvik Editor is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Narvik Editor. If not, see <https://www.gnu.org/licenses/>. 
*/

import { readDir } from "@tauri-apps/api/fs";
import path from "path-browserify";
import { For, JSX, Show, createSignal, onMount } from "solid-js";
import {
  IconFolder,
  IconFolderOpen,
  IconGit,
  IconLineVertical,
} from "../Icons/Icons";
import { logger } from "../../logger";
import * as FI from "../Icons/FileIcons";

interface Props {
  dir: string;
  workspaceName?: string;
  projectName?: string;
}

const specialFileIcons: { [key: string]: () => JSX.Element } = {
  "tailwind.config.js": FI.Tailwind,
  "vite.config.js": FI.Vite,
  "vite.config.ts": FI.Vite,
  readme: FI.Readme,
  "readme.md": FI.Readme,
  license: FI.License,
  "license.md": FI.License,
  "package.json": FI.NodeJS,
  "package-lock.json": FI.NodeJS,
  "next.config.js": FI.NextJS,
  "next.config.ts": FI.NextJS,
};

const fileIcons: { [key: string]: () => JSX.Element } = {
  // TODO: Add more efficient icon lookup and icons

  // code langs
  ".md": FI.Markdown,
  ".ts": FI.Typescript,
  ".js": FI.Javascript,
  ".rs": FI.Rust,
  ".py": FI.Python,
  ".html": FI.HTML,
  ".css": FI.CSS,
  ".scss": FI.SASS,
  ".sass": FI.SASS,
  ".cs": FI.CSharp,
  ".kt": FI.Kotlin,
  ".cpp": FI.CPlusPlus,
  ".svelte": FI.Svelte,
  ".php": FI.PHP,
  ".go": FI.Golang,
  ".swift": FI.Swift,
  ".java": FI.Java,
  ".sh": FI.Terminal,
  ".bat": FI.Terminal,
  ".c": FI.C,
  ".vue": FI.Vue,
  ".h": FI.CPPHeader,
  ".tsx": FI.React,
  ".jsx": FI.React,
  ".bf": FI.Brainfuck,

  // config files
  ".json": FI.Config,
  ".yaml": FI.Config,
  ".toml": FI.Config,

  // images
  ".png": FI.Image,
  ".jpg": FI.Image,
  ".jpeg": FI.Image,
  ".heic": FI.Image,
  ".gif": FI.Image,
  ".webp": FI.Image,
  ".svg": FI.SVG,

  // videos
  ".mov": FI.Video,
  ".mp4": FI.Video,
  ".avi": FI.Video,
  ".webm": FI.Video,
  ".flv": FI.Video,
  ".mkv": FI.Video,

  // other assets
  ".zip": FI.Zip,
  ".rar": FI.Zip,
  ".gitignore": IconGit,
  ".ttf": FI.Font,
  ".otf": FI.Font,
  ".woff": FI.Font,
  ".woff2": FI.Font,
  ".icns": FI.Icon,
  ".ico": FI.Icon,
  ".txt": FI.Text,
  ".rtf": FI.Text,
  ".pdf": FI.Text,
};

const FileBrowser = (props: Props) => {
  const [dirContents, setDirContents] = createSignal<string[]>([]);

  onMount(async () => {
    const contents = await getDirContents(
      path.join(props.dir, props.workspaceName ?? "", props.projectName ?? ""),
    );
    setDirContents(contents);
  });

  const getDirContents = async (dirPath: string): Promise<string[]> => {
    try {
      const contents = await readDir(dirPath);
      const nonEmptyContents = contents
        .map((content) => content.name)
        .filter(
          (content): content is string =>
            content !== undefined && content[0] != ".",
        );
      return nonEmptyContents.sort();
    } catch (error) {
      if (!(error as string).includes("Not a directory")) {
        console.error(`Error fetching directory contents: ${error}`);
        logger(true, "FileBrowser.tsx", error as string);
      }
      return [error as string]; // return error as string, so the error is like a nested file in a folder
    }
  };

  const renderItem = (
    contents: string[],
    parentDir: string,
    firstRender: boolean,
    howNested: number, // how nested it is, e.g. root=0, nested=1, nested-in-nested=2, ...
  ) => {
    return (
      <For each={contents}>
        {(dirName) => {
          const [open, setOpen] = createSignal(false);
          const [isFolder, setIsFolder] = createSignal();
          const [dirNestedContents, setDirNestedContents] = createSignal<
            string[]
          >([]);

          // TODO: This is rerun every time a folder is opened, so optimize this!
          if (dirName[0] != ".") {
            getDirContents(path.join(parentDir, dirName))
              .then((contents) => {
                setDirNestedContents(contents);
                if (
                  dirNestedContents()[0] !== undefined &&
                  dirNestedContents()[0].includes("Not a directory")
                ) {
                  setIsFolder(false); // if name includes "Not a directory", it's not a folder
                } else {
                  setIsFolder(true);
                }
              })
              .catch((error: string) => {
                setDirNestedContents([]);
                console.error(`Error fetching directory contents: ${error}`);
                logger(true, "FileBrowser.tsx", error as string);
              });
          }

          // if file name matches special file name, set special icon. Otherwise check file extension
          let FileIconComponent =
            specialFileIcons[dirName.toLowerCase()] || undefined;
          if (FileIconComponent === undefined) {
            // checks file extension
            const fileExtension = isFolder() ? "" : path.extname(dirName);
            FileIconComponent =
              fileIcons[fileExtension.toLowerCase()] || FI.Default;
          }

          return (
            <div class="relative block min-w-fit">
              <div
                class="min-w-fit cursor-pointer select-none text-content hover:bg-base-100 active:bg-base-100-hover"
                onclick={() => {
                  if (isFolder()) {
                    setOpen(!open());
                  }
                }}
              >
                <div
                  class="flex items-center"
                  style={{
                    "padding-left": `${howNested * 1.5}rem`, // makes the nested items look nested
                  }}
                >
                  <Show when={!firstRender} fallback={<div class="w-4" />}>
                    <div class="absolute opacity-80">
                      <IconLineVertical />
                    </div>
                    <div class="w-4" />
                  </Show>
                  <div class="opacity-80">
                    <Show when={isFolder()} fallback={<FileIconComponent />}>
                      <Show when={open()} fallback={<IconFolder />}>
                        <IconFolderOpen />
                      </Show>
                    </Show>
                  </div>
                  <span class="whitespace-nowrap">{dirName}</span>
                </div>
              </div>
              <div class="block">
                <Show when={open()}>
                  <div class="">
                    {renderItem(
                      dirNestedContents(),
                      path.join(parentDir, dirName),
                      false,
                      howNested + 1,
                    )}
                  </div>
                </Show>
              </div>
            </div>
          );
        }}
      </For>
    );
  };

  return (
    <div class="h-full min-h-full w-full min-w-full overflow-auto bg-base-200">
      <div class="absolute z-10 block w-full cursor-pointer select-none items-center overflow-hidden overflow-ellipsis bg-base-200 pl-6 font-bold text-content hover:bg-base-100 active:bg-base-100-hover">
        {props.projectName
          ? `${props.workspaceName}/${props.projectName}`
          : "No Project"}{" "}
        {/* if no project name, display "No Project" */}
      </div>
      <div class="h-6" />
      <div class="min-w-fit">
        {renderItem(dirContents(), props.dir, true, 0)}
      </div>
    </div>
  );
};

export default FileBrowser;
