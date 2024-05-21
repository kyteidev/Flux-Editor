import { onCleanup, onMount } from "solid-js";
// @ts-ignore
import ace from "ace-builds/src-min-noconflict/ace";
import "ace-builds/src-min-noconflict/mode-javascript";
import "ace-builds/src-min-noconflict/theme-monokai";
import "ace-builds/src-min-noconflict/ext-language_tools";

interface AceEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  mode?: string;
  theme?: string;
  fontSize?: number;
}

function AceEditor(props: AceEditorProps) {
  let editorRef: HTMLDivElement | undefined;

  onMount(() => {
    if (editorRef) {
      const editor = ace.edit(editorRef, {
        mode: props.mode || "ace/mode/javascript",
        theme: props.theme || "ace/theme/monokai",
        value: props.value || "",
        fontSize: props.fontSize || 16,
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        printMargin: false,
        enableAutoIndent: true,
      });
      
      ace.require("ace/ext/language_tools");
      editor.setOptions({
        enableSnippets: true,
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
      });

      editor.session.on("change", () => {
        if (props.onChange) {
          props.onChange(editor.getValue());
        }
      });

      onCleanup(() => {
        editor.destroy();
      });
    }
  });

  return <div ref={(el) => (editorRef = el!)} style={{ height: "100vh", width: "100%" }} />;
}

export default AceEditor;
