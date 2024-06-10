import EditorComponent from "../components/Editor/EditorComponent";
import FileBrowser from "../components/FileBrowser/FileBrowser";
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
      <div style={{ "max-height": `calc(100vh - 2.5em)` }}>
        <SplitPane grow={true}>
          <SplitPane vertical={true} width={280}>
            <FileBrowser dir={dir()} />
          </SplitPane>
          <SplitPane vertical={true} grow={true}>
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
    </div>
  );
};

export default Editor;
