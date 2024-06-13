import { readDir } from "@tauri-apps/api/fs";
import path from "path-browserify";
import { For, JSX, Show, createSignal, onMount } from "solid-js";
import {
  IconExpand,
  IconGit,
  IconLineVertical,
  IconUnexpand,
} from "../Icons/Icons";
import { logger } from "../../logger";
import {
  FileBrainfuck,
  FileC,
  FileCPPHeader,
  FileCPlusPlus,
  FileCSS,
  FileCSharp,
  FileConfig,
  FileDefault,
  FileFont,
  FileGolang,
  FileHTML,
  FileImage,
  FileJava,
  FileJavascript,
  FileKotlin,
  FileMarkdown,
  FilePHP,
  FilePython,
  FileReact,
  FileRust,
  FileSVG,
  FileSvelte,
  FileSwift,
  FileTerminal,
  FileTypescript,
  FileVideo,
  FileVue,
  FileZip,
} from "../Icons/FileIcons";

interface Props {
  dir: string;
  workspaceName?: string;
  projectName?: string;
}

const fileIcons: { [key: string]: () => JSX.Element } = {
  // TODO: Add more efficient icon lookup and icons

  // code langs
  ".md": FileMarkdown,
  ".ts": FileTypescript,
  ".js": FileJavascript,
  ".rs": FileRust,
  ".py": FilePython,
  ".html": FileHTML,
  ".css": FileCSS,
  ".scss": FileCSS,
  ".sass": FileCSS,
  ".cs": FileCSharp,
  ".kt": FileKotlin,
  ".cpp": FileCPlusPlus,
  ".svelte": FileSvelte,
  ".php": FilePHP,
  ".go": FileGolang,
  ".swift": FileSwift,
  ".java": FileJava,
  ".sh": FileTerminal,
  ".bat": FileTerminal,
  ".c": FileC,
  ".vue": FileVue,
  ".h": FileCPPHeader,
  ".tsx": FileReact,
  ".jsx": FileReact,
  ".bf": FileBrainfuck,

  // config files
  ".json": FileConfig,
  ".yaml": FileConfig,
  ".toml": FileConfig,

  // images
  ".png": FileImage,
  ".jpg": FileImage,
  ".heic": FileImage,
  ".gif": FileImage,
  ".webp": FileImage,
  ".svg": FileSVG,

  // videos
  ".mov": FileVideo,
  ".mp4": FileVideo,
  ".avi": FileVideo,
  ".webm": FileVideo,
  ".flv": FileVideo,

  // other assets
  ".zip": FileZip,
  ".gitignore": IconGit,
  ".ttf": FileFont,
  ".otf": FileFont,
  ".woff": FileFont,
  ".woff2": FileFont,
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

          if (dirName[0] != ".") {
            getDirContents(path.join(parentDir, dirName))
              .then((contents) => {
                setDirNestedContents(contents);
                if (dirNestedContents()[0] !== undefined) {
                  if (dirNestedContents()[0].includes("Not a directory")) {
                    setIsFolder(false); // if name includes "Not a directory", it's not a folder
                  } else {
                    setIsFolder(true);
                  }
                } else {
                  setIsFolder(true);
                }
              })
              .catch((error: string) => {
                setIsFolder(false);
                setDirNestedContents([]);
                console.error(`Error fetching directory contents: ${error}`);
                logger(true, "FileBrowser.tsx", error as string);
              });
          }

          // checks file extension
          // TODO: add support for special files, e.g., vite config or tailwind config
          const fileExtension = isFolder() ? "" : path.extname(dirName);
          const FileIconComponent = fileIcons[fileExtension.toLowerCase()] || (
            <FileDefault />
          );

          return (
            <div class="relative block">
              <div
                class="cursor-pointer select-none text-content hover:bg-base-100 active:bg-base-100-hover"
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
                    <div class="absolute">
                      <IconLineVertical />
                    </div>
                    <div class="w-4" />
                  </Show>
                  <Show when={isFolder()} fallback={<FileIconComponent />}>
                    <Show when={open()} fallback={<IconExpand />}>
                      <IconUnexpand />
                    </Show>
                  </Show>
                  {dirName}
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
    <div class="h-full min-h-full w-full min-w-full max-w-full overflow-auto bg-base-200">
      <div class="absolute z-10 block w-full cursor-pointer select-none items-center overflow-hidden overflow-ellipsis bg-base-200 pl-6 font-bold text-content hover:bg-base-100 active:bg-base-100-hover">
        {props.projectName
          ? `${props.workspaceName}/${props.projectName}`
          : "No Project"}{" "}
        {/* if no project name, display "No Project" */}
      </div>
      <div class="h-6" />
      {renderItem(dirContents(), props.dir, true, 0)}
    </div>
  );
};

export default FileBrowser;
