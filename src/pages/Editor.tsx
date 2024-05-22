import Search from "../components/Search/Search";
import AceEditor from "../components/Editor/Ace";
import WindowControls from "../components/WindowControls/WindowControls";

function Editor() {
  return (
    <div>
      <header data-tauri-drag-region class="header w-full h-10 bg-base-100" />
      <div>
        <AceEditor />
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
