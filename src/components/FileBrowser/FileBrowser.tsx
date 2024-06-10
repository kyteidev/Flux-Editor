import { readDir } from "@tauri-apps/api/fs";
import path from "path-browserify";
import { For, createSignal, onMount } from "solid-js";

interface Props {
  dir: string;
  workspaceName?: string;
  projectName?: string;
}

const FileBrowser = (props: Props) => {
  const [dirContents, setDirContents] = createSignal<string[]>([]);

  onMount(async () => {
    try {
      const contents = await readDir(
        path.join(
          props.dir,
          props.workspaceName ?? "",
          props.projectName ?? "",
        ),
      );
      const nonEmptyContents = contents
        .map((content) => content.name)
        .filter((content): content is string => content !== undefined);
      setDirContents(nonEmptyContents);
    } catch (error) {
      console.error(`Error fetching directory contents: ${error}`);
    }
  });

  return (
    <div class="h-full max-h-[100%] w-full overflow-auto bg-base-200">
      <div class="absolute z-10 flex w-full cursor-pointer select-none items-center overflow-visible bg-base-200 pl-10 font-bold text-content hover:bg-base-100 active:bg-base-100-hover">
        {props.workspaceName ?? "" + "/" + props.projectName ?? ""}
      </div>
      <div class="h-6" />
      <For each={dirContents()}>
        {(dir) => (
          <div class="relative flex cursor-pointer select-none items-center pl-10 text-content hover:bg-base-100 active:bg-base-100-hover">
            {dir}
          </div>
        )}
      </For>
    </div>
  );
};

export default FileBrowser;
