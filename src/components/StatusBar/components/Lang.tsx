import { createSignal } from "solid-js";
import { extname } from "../../../utils/path";
import { getOpenFilePath } from "../../Editor/EditorComponent";
import { fileType } from "../../../utils/file";

const [lang, setLang] = createSignal("");

export const updateLang = (clear?: boolean) => {
  if (clear) {
    setLang("");
    return;
  }
  const fileExt = extname(getOpenFilePath());
  setLang(fileType[fileExt] || "Unknown");
};

const Lang = () => {
  return <div>{lang()}</div>;
};

export default Lang;
