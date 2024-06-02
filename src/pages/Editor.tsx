import Search from "../components/Search/Search";
import WindowControls from "../components/WindowControls/WindowControls";
import { useSearchParams } from "@solidjs/router";

const Editor = () => {
  const [params] = useSearchParams();

  return (
    <div>
      <header data-tauri-drag-region class="header w-full h-10 bg-base-200" />
      <div>
        <div></div>
      </div>
      <div class="w-1/3 absolute left-1/3" style={{ top: "7px" }}>
        <Search />
      </div>
      <div>
        <WindowControls />
      </div>
    </div>
  );
}

export default Editor;
