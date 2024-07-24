import { onMount } from "solid-js";
import styles from "./Terminal.module.css";
import { getProjectName } from "../../App";
import { invoke } from "@tauri-apps/api/tauri";
import { error, info } from "tauri-plugin-log-api";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import {
  basename,
  homeDir,
  normalizePath,
  resolvePath,
} from "../../utils/path";
import { fs } from "@tauri-apps/api";

const FluxTerminal = () => {
  let textarea: HTMLTextAreaElement | undefined;
  let pre: HTMLPreElement | undefined;

  let prefixText = "";
  let cmd = "";
  let cmdDir: string;

  let prevDir: string;

  let homeDirPath: string;

  let outputListener: UnlistenFn;

  onMount(async () => {
    setPrefix();
    addText(prefixText);

    homeDirPath = await homeDir();
    cmdDir = homeDirPath;
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
        runCommand();
        break;
      case "ArrowUp":
      case "ArrowDown":
        e.preventDefault();
    }

    handleScroll();
  };

  const runCommand = async () => {
    const userInput = getCurrentLineContents().slice(prefixText.length);
    if (!userInput.includes(" ")) {
      cmd = userInput;
    }
    if (cmd.includes("\u200B")) {
      cmd = cmd.slice(1);
    }
    const args = userInput
      .substring(cmd.length + 1)
      .trim()
      .split(" ")
      .map((arg) => arg.trim())
      .filter((arg) => arg !== "");

    const addPrefixText = () => {
      window.requestAnimationFrame(() => {
        addText(prefixText);
      });
    };

    // callerAsync: whether the function calling this is async
    const addErrorText = (error: string, callerAsync?: boolean) => {
      if (!callerAsync) {
        addText("\n" + error);
      } else {
        addText(error + "\n");
      }
      addPrefixText();
    };

    switch (cmd) {
      case "clear":
        clearTerm();
        return;
      case "cd":
        if (args.length > 1) {
          addErrorText("cd: too many arguments");
          return;
        } else {
          switch (args[0]) {
            case "":
            case "~":
            case "--":
              cmdDir = homeDirPath;
              break;
            case "-":
              const tempDir = cmdDir;
              cmdDir = prevDir || homeDirPath;
              prevDir = tempDir;
              break;
            default:
              cmdDir = await resolvePath(args[0], cmdDir);

              if (normalizePath(cmdDir) === normalizePath(homeDirPath)) {
                cmdDir = homeDirPath;
                break;
              }

              try {
                // custom path exists bypasses Tauri config's scope
                if (!(await invoke("path_exists", { path: cmdDir }))) {
                  addErrorText(
                    "cd: no such file or directory: " + basename(cmdDir),
                    true,
                  );
                  return;
                } else if (!(await invoke("is_dir", { path: cmdDir }))) {
                  addErrorText(
                    "cd: not a directory: " + basename(cmdDir),
                    true,
                  );
                  return;
                }
              } catch (e) {
                error(e as string);
                addErrorText("cd: " + e, true);
                return;
              }

              break;
          }

          if (normalizePath(cmdDir) === normalizePath(homeDirPath)) {
            prefixText = "% \u200B";
          } else {
            prefixText = basename(cmdDir) + " % \u200B";
          }
          addPrefixText();
        }
        return;
    }

    invoke<string>("spawn_command", {
      command: cmd,
      args: args,
      dir: cmdDir,
    }).then((id) => info(id));

    if (outputListener) {
      outputListener();
    }
    outputListener = await listen<{ message: string }>(
      "flux:cmd-output",
      (e) => {
        if (e.payload.message === "flux:output-completed") {
          outputListener();
          addPrefixText();
        } else {
          addText(e.payload.message + "\n");
        }
        if (textarea && textarea.scrollHeight - textarea.scrollTop <= 300) {
          textarea.scrollTop = textarea.scrollHeight;
          handleScroll();
        }
      },
    );
  };

  const clearTerm = () => {
    window.requestAnimationFrame(() => {
      if (textarea && pre) {
        textarea.value = prefixText;
        pre.innerHTML = textarea.value;
      }
    });
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
