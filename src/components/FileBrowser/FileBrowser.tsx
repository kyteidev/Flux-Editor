import { readDir } from "@tauri-apps/api/fs";
import path from "path-browserify";
import { For, Show, createSignal, onMount } from "solid-js";
import { IconExpand, IconUnexpand } from "../Icons/Icons";

interface Props {
  dir: string;
  workspaceName?: string;
  projectName?: string;
}

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
      }
      return [error as string];
    }
  };

  const renderItem = (contents: string[], parentDir: string) => {
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
                    setIsFolder(false);
                  } else {
                    setIsFolder(true);
                  }
                } else {
                  setIsFolder(true);
                }
              })
              .catch((error: string) => {
                setIsFolder(false);
                console.error(`Error fetching directory contents: ${error}`);
                setDirNestedContents([]);
              });
          }

          return (
            <div class="relative block">
              <div
                class="flex cursor-pointer select-none items-center pl-6 text-content hover:bg-base-100 active:bg-base-100-hover"
                onclick={() => {
                  setOpen(!open());
                }}
              >
                <Show when={isFolder()}>
                  <Show when={open()} fallback={<IconExpand />}>
                    <IconUnexpand />
                  </Show>
                </Show>
                {dirName}
              </div>
              <div class="block">
                <Show when={open()}>
                  <div class="pl-6">
                    {renderItem(
                      dirNestedContents(),
                      path.join(parentDir, dirName),
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
      <div class="absolute z-10 flex w-full cursor-pointer select-none items-center overflow-visible bg-base-200 pl-8 font-bold text-content hover:bg-base-100 active:bg-base-100-hover">
        {props.workspaceName ?? "" + "/" + props.projectName ?? ""}
      </div>
      <div class="h-6" />
      {renderItem(dirContents(), props.dir)}
    </div>
  );
};

export default FileBrowser;
