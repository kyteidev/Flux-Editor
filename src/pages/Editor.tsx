import EditorComponent from "../components/Editor/EditorComponent";
import WindowControls from "../components/WindowControls/WindowControls";
import { useSearchParams } from "@solidjs/router";
import { createSignal, onMount } from "solid-js";

const Editor = () => {
  const [params] = useSearchParams();

  const [dir, setDir] = createSignal<string>("");

  onMount(() => setDir(params.path ?? ""));

  return (
    <div class="w-screen h-screen max-h-screen flex flex-col">
      <header data-tauri-drag-region class="header min-h-10 w-full bg-base-200 flex-shrink-0" />
      <div class="flex flex-col flex-grow">
        <div class="h-full max-h-[66vh]">
          <EditorComponent lang="javascript" />
        </div>
        <div class="bg-base-200 w-full flex-grow"></div>
      </div>
      <div>
        <WindowControls />
      </div>
    </div>
  );
};

export default Editor;
