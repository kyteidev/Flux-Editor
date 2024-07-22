import { onMount } from "solid-js";
import styles from "./Terminal.module.css";
import { getProjectName } from "../../App";
import { invoke } from "@tauri-apps/api/tauri";
import { info } from "tauri-plugin-log-api";
import { listen, UnlistenFn } from "@tauri-apps/api/event";

const FluxTerminal = () => {
  let textarea: HTMLTextAreaElement | undefined;
  let pre: HTMLPreElement | undefined;

  let prefixText = "";
  let cmd = "";
  let outputListener: UnlistenFn;

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

  const handleScroll = () => {
    if (textarea && pre) {
      pre.scrollTop = textarea.scrollTop;
      pre.scrollLeft = textarea.scrollLeft;
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

    handleScroll();
  };

  const handleKeyDown = async (e: KeyboardEvent) => {
    const start = textarea?.selectionStart || 0;
    const end = textarea?.selectionEnd || 0;

    switch (e.code) {
      case "Backspace":
      case "ArrowLeft":
        if (start === end && textarea?.value.charAt(start - 1) === "\u200B") {
          e.preventDefault();
        }

        break;
      case "Space":
        setCmd();

        break;
      case "Enter":
        const userInput = getCurrentLineContents().slice(prefixText.length);
        if (!userInput.includes(" ")) {
          cmd = userInput;
        }
        if (cmd.includes("\u200B")) {
          cmd = cmd.slice(1);
        }
        const args = userInput.substring(cmd.length + 1).split(" ");

        invoke<string>("spawn_command", { command: cmd, args: args }).then(
          (id) => info(id),
        );

        if (outputListener) {
          outputListener();
        }
        outputListener = await listen<{ message: string }>(
          "flux:cmd-output",
          (e) => {
            if (e.payload.message === "flux:output-completed") {
              outputListener();
              addText(prefixText);
            } else {
              addText(e.payload.message + "\n");
            }
            if (textarea && textarea.scrollHeight - textarea.scrollTop <= 300) {
              textarea.scrollTop = textarea.scrollHeight;
              handleScroll();
            }
          },
        );
        break;
      case "ArrowUp":
      case "ArrowDown":
        window.requestAnimationFrame(() => {
          const newStart = getRelativeCaretPos();
          const contents = getCurrentLineContents();

          const zeroWidthSpacePos = contents.indexOf("\u200B");

          if (newStart <= zeroWidthSpacePos && textarea) {
            textarea.selectionStart = textarea.selectionEnd =
              textarea.selectionStart + (zeroWidthSpacePos - newStart) + 2;
          }

          handleScroll();
        });
    }

    handleScroll();
  };

  const getCurrentLineStart = () => {
    const start = textarea?.selectionStart;
    const currentLine =
      textarea?.value.substring(0, start).lastIndexOf("\n") || 0;

    return currentLine;
  };

  const getCurrentLineContents = () => {
    const currentLineContent =
      textarea?.value.substring(getCurrentLineStart()) || "";

    return currentLineContent;
  };

  const getRelativeCaretPos = () => {
    const start = textarea?.selectionStart || 0;
    const currentLineStartIndex = getCurrentLineStart();

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
        class={`${styles.textarea} absolute left-0 top-0 z-10 h-full w-full overflow-auto whitespace-pre bg-transparent text-transparent caret-accent`}
        autocomplete="off"
        autoCapitalize="off"
        spellcheck={false}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onScroll={handleScroll}
      />
      <pre
        ref={pre}
        class={`${styles.pre} absolute left-0 top-0 z-0 h-full w-full overflow-auto whitespace-pre bg-base-200`}
      ></pre>
    </div>
  );
};

export default FluxTerminal;
