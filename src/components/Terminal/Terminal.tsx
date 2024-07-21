import { onMount } from "solid-js";
import styles from "./Terminal.module.css";
import { getProjectName } from "../../App";
import { invoke } from "@tauri-apps/api/tauri";
import { appWindow } from "@tauri-apps/api/window";
import { info } from "tauri-plugin-log-api";

const FluxTerminal = () => {
  let textarea: HTMLTextAreaElement | undefined;
  let pre: HTMLPreElement | undefined;

  let prefixText = "";
  let cmd = "";
  let outputListener;

  onMount(() => {
    setPrefix();
    addText(prefixText);
  });

  const setPrefix = () => {
    prefixText =
      getProjectName() + `${getProjectName() != "" ? " " : ""}` + "% \u200B";
  };

  const addText = (text: string) => {
    if (textarea && pre) {
      textarea.value += text;
      pre.innerHTML = textarea.value;
    }
  };

  const handleInput = () => {
    if (textarea && pre) {
      let fixLastLine = false;
      const selectionStart = textarea.selectionStart;

      if (textarea.value[textarea.value.length - 1] == "\n") {
        textarea.value = textarea.value + " ";
        fixLastLine = true;
      }

      pre.innerHTML = textarea.value
        .replace(new RegExp("&", "g"), "&amp;")
        .replace(new RegExp("<", "g"), "&lt;");

      if (fixLastLine && textarea.value[textarea.value.length - 1] == " ") {
        textarea.value = textarea.value.substring(0, textarea.value.length - 1);

        textarea.selectionStart = textarea.selectionEnd = selectionStart;
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    const start = textarea?.selectionStart || 0;
    const end = textarea?.selectionEnd || 0;

    switch (e.code) {
      case "Backspace":
        if (start === end && textarea?.value.charAt(start - 1) === "\u200B") {
          e.preventDefault();
        }

        break;
      case "Space":
        setCmd();

        break;
      case "Enter":
        if (cmd === "") {
          cmd = getCurrentLineContents().slice(prefixText.length);
        }
        const args = getCurrentLineContents()
          .substring(prefixText.length + cmd.length + 1)
          .split(" ");

        console.log(cmd, args);
        invoke<string>("spawn_command", { command: cmd, args: args }).then(
          (id) => info(id),
        );

        outputListener = appWindow.listen("flux:cmd-output", (payload) => {
          console.log(payload);
        });
        break;
      case "ArrowLeft":
      case "ArrowUp":
      case "ArrowDown":
        window.requestAnimationFrame(() => {
          const newStart = textarea?.selectionStart || 0;
          const contents = getCurrentLineContents();

          const zeroWidthSpacePos = contents.indexOf("\u200B");
          if (newStart <= zeroWidthSpacePos && textarea) {
            textarea.selectionStart = textarea.selectionEnd =
              newStart + (zeroWidthSpacePos - newStart) + 1;
          }
        });
    }
  };

  const getCurrentLine = () => {
    const start = textarea?.selectionStart;
    const currentLine =
      textarea?.value.substring(0, start).lastIndexOf("\n") || 0;

    return currentLine;
  };

  const getCurrentLineContents = () => {
    const currentLineContent =
      textarea?.value.substring(getCurrentLine()) || "";

    return currentLineContent;
  };

  const getRelativeCaretPos = () => {
    const start = textarea?.selectionStart || 0;
    const currentLineStartIndex = getCurrentLine(); // +1 to move past the '\n' character

    const relativeCaretPos = start - currentLineStartIndex;
    return relativeCaretPos;
  };

  const setCmd = () => {
    window.requestAnimationFrame(() => {
      const currentLineContent = getCurrentLineContents();
      let newCmd = currentLineContent.substring(
        prefixText.length,
        currentLineContent.indexOf(" ", prefixText.length),
      );
      cmd = newCmd;
    });
  };

  return (
    <div class="relative h-full w-full">
      <textarea
        ref={textarea}
        class={`${styles.textarea} absolute left-0 top-0 z-10 h-full w-full bg-transparent text-transparent caret-accent`}
        autocomplete="off"
        autoCapitalize="off"
        spellcheck={false}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
      />
      <pre
        ref={pre}
        class={`${styles.pre} absolute left-0 top-0 z-0 h-full w-full bg-base-200`}
      ></pre>
    </div>
  );
};

export default FluxTerminal;
