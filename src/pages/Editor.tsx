import EditorComponent from "../components/Editor/EditorComponent";
import SplitPane from "../components/SplitPane/SplitPane";
import WindowControls from "../components/WindowControls/WindowControls";
import { useSearchParams } from "@solidjs/router";
import { createSignal, onMount } from "solid-js";

const Editor = () => {
  const [params] = useSearchParams();

  const [dir, setDir] = createSignal<string>("");

  onMount(() => setDir(params.path ?? ""));

  return (
    <div class="flex h-screen max-h-screen w-screen flex-col">
      <header
        data-tauri-drag-region
        class="header min-h-10 w-full flex-shrink-0 bg-base-200"
      />
      <SplitPane>
        <SplitPane vertical={true}>
          <div></div>
        </SplitPane>
        <SplitPane vertical={true}>
          <div class="h-full max-h-[66vh]">
            <EditorComponent lang="javascript" />
          </div>
          <div class="w-full flex-grow bg-base-200"></div>
        </SplitPane>
      </SplitPane>
      <div>
        <WindowControls />
      </div>
    </div>
  );
};

export default Editor;
