import { createSignal } from "solid-js";
import { getOpenFilePath } from "../Editor/EditorComponent";
import { extname } from "../../utils/path";
import { fileType } from "../../utils/file";

const [lang, setLang] = createSignal("");

export const updateLang = (clear?: boolean) => {
  if (clear) {
    setLang("");
    return;
  }
  const fileExt = extname(getOpenFilePath());
  setLang(fileType[fileExt] || "Unknown");
};

const StatusBar = () => {
  return (
    <div
      class="z-50 w-screen border-t-2 border-base-100 bg-base-200 px-2 text-sm"
      style={{
        "min-height": `calc(1.5rem + 2px)`,
        "max-height": `calc(1.5rem + 2px)`,
      }}
    >
      <div class="float-right ml-auto">{lang()}</div>
    </div>
  );
};

export default StatusBar;
