/*
Copyright © 2024 kyteidev.

This file is part of Flux Editor.

Flux Editor is free software: you can redistribute it and/or modify it under the terms of the GNU General
Public License as published by the Free Software Foundation, either version 3 of the License, or (at your
option) any later version.

Flux Editor is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even
the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Flux Editor. If not, see
<https://www.gnu.org/licenses/>.
*/

// TODO: add real pty shell integration with Xterm
// TODO: sometimes terminal super slow to detect when command is done running

import { onMount } from "solid-js";
import { getProjectName, getProjectPath } from "../../App";
import { invoke } from "@tauri-apps/api/core";
import { error, info } from "@tauri-apps/plugin-log";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import {
  basename,
  homeDir,
  normalizePath,
  resolvePath,
} from "../../utils/path";
import ansiToHtml from "ansi-to-html";
import stripAnsi from "strip-ansi";
import styles from "./Terminal.module.css";
import "../../utils/string.ts";
import { escapeHtml } from "../../utils/char.ts";
import { createStore } from "solid-js/store";

const FluxTerminal = () => {
  const [termColors, setTermColors] = createStore({
    black: "",
    red: "",
    green: "",
    yellow: "",
    blue: "",
    magenta: "",
    cyan: "",
    white: "",
  });

  let converter: ansiToHtml;

  let textarea: HTMLTextAreaElement | undefined;
  let pre: HTMLPreElement | undefined;

  let prefixText = "";
  let cmd = "";
  let cmdDir: string;

  let cmdRunning = false;
  let userHasScrolled = false;

  let prevDir: string;

  let homeDirPath: string;

  let outputListener: UnlistenFn;

  onMount(async () => {
    homeDirPath = await homeDir();

    cmdDir = getProjectPath() || homeDirPath;

    setTermColors({
      black: "#333333",
      red: "#f04949",
      green: "#9fee75",
      yellow: "#eeea75",
      blue: "#6fb5f3",
      magenta: "#f049c3",
      cyan: "#6fe6f3",
      white: " #f3f4f6",
    });

    converter = new ansiToHtml({
      newline: true,
      escapeXML: true,
      stream: false,
      colors: {
        0: termColors.black,
        1: termColors.red,
        2: termColors.green,
        3: termColors.yellow,
        4: termColors.blue,
        5: termColors.magenta,
        6: termColors.cyan,
        7: termColors.white,
      },
    });

    setPrefix();
    addText(
      "NOTE: This is merely a command runner that emulates a terminal UI.\nThis doesn't support, for example, inputs and terminal apps.\n" +
        prefixText,
    );
  });

  const cleanAnsiText = (text: string) => {
    return text.replace(/\x1b\[\d*[GK]/g, "").replace(/\x1b\[0G/g, "");
  };

  const setPrefix = () => {
    prefixText =
      getProjectName() + `${getProjectName() != "" ? " " : ""}` + "% \u200B";
  };

  const addText = (text: string) => {
    if (textarea && pre) {
      textarea.value += stripAnsi(text);

      if (text === prefixText) {
        pre.innerHTML += prefixText;

        let preLines = pre.innerHTML.splitMultiple(["<br>", "\n"]);

        preLines[preLines.length - 1] =
          preLines[preLines.length - 1].trimStart();

        pre.innerHTML = preLines.join("<br>");
      } else {
        const colorizedHtml = converter.toHtml(cleanAnsiText(text));
        pre.innerHTML = pre.innerHTML.trimEnd() + colorizedHtml;
      }

      if (!userHasScrolled) {
        scrollToBottom();
      }
    }
  };

  const handleScroll = () => {
    if (textarea && pre) {
      const isAtBottom =
        textarea.scrollHeight - textarea.scrollTop <=
        textarea.clientHeight + 50;

      userHasScrolled = !isAtBottom;

      pre.scrollTop = textarea.scrollTop;
      pre.scrollLeft = textarea.scrollLeft;
    }
  };

  const scrollToBottom = () => {
    if (textarea && pre) {
      textarea.scrollTop = textarea.scrollHeight;
      pre.scrollTop = pre.scrollHeight;
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

      const lines = textarea.value.split("\n");
      const preLines = pre.innerHTML.splitMultiple(["<br>", "\n"]);

      if (!cmdRunning) {
        preLines[preLines.length - 1] = escapeHtml(lines[lines.length - 1]);
        pre.innerHTML = preLines.join("<br>");
      }

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
        if (e.code === "Backspace" && start != end && textarea && pre) {
          e.preventDefault();

          textarea.value = textarea.value.slice(
            0,
            textarea.value.lastIndexOf("\u200B") + 1,
          );
          pre.innerText = textarea.value;

          textarea.selectionStart = textarea.selectionEnd =
            textarea.value.length;
        }

        if (start === end && textarea?.value.charAt(start - 1) === "\u200B") {
          e.preventDefault();
        }

        break;
      case "Space":
        setCmd();

        break;
      case "Enter":
        if (pre) {
          pre.innerHTML += "<br>";
        }
        runCommand();
        break;
      case "ArrowUp":
      case "ArrowDown":
        e.preventDefault();
    }

    handleScroll();
  };

  const handleClick = () => {
    window.requestAnimationFrame(() => {
      const start = textarea?.selectionStart || 0;
      const end = textarea?.selectionEnd || 0;

      if (
        textarea &&
        start === end &&
        start < textarea.value.lastIndexOf("\u200B")
      ) {
        textarea.selectionStart = textarea.selectionEnd =
          textarea.value.lastIndexOf("\u200B") + 1;
      }
    });
  };

  const runCommand = async () => {
    let cmdId = -1;

    // command abort code
    const keysPressed: string[] = [];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!keysPressed.includes(e.code)) {
        keysPressed.push(e.code);

        const shortcutKeys = ["Control", "KeyC"];
        const filteredKeysPressed = keysPressed.map((key) =>
          key.replace("Left", "").replace("Right", ""),
        );
        if (shortcutKeys.every((key) => filteredKeysPressed.includes(key))) {
          if (cmdId != -1) {
            abortCommand(cmdId);
          }
          addText("^C\n" + prefixText);
          removeKeyListeners();
          if (textarea) {
            textarea.scrollTop = textarea.scrollHeight;
            handleScroll();
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.splice(keysPressed.indexOf(e.code), 1);
    };

    document.addEventListener("keydown", handleKeyDown);

    document.addEventListener("keyup", handleKeyUp);

    const abortCommand = (id: number) => {
      outputListener();
      invoke("abort_command", { id: id })
        .then(() => {
          info("Command with ID " + id + " aborted successfully");
        })
        .catch((e: string) => {
          error("Error aborting command with ID " + id + ": " + e);
        });
    };

    const removeKeyListeners = () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };

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
      removeKeyListeners();
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
        removeKeyListeners();
        return;
      case "cd":
        if (args.length > 1) {
          addErrorText("cd: too many arguments");
          return;
        } else if (args.length === 0) {
          cmdDir = homeDirPath;
          prefixText = "% \u200B";
          addPrefixText();
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
        removeKeyListeners();
        return;
    }

    invoke<number>("spawn_command", {
      command: cmd,
      args: args,
      dir: cmdDir,
    }).then((id) => {
      if (id.toString() === "0") {
        addText("command not found: " + cmd + "\n");
        addPrefixText();
        removeKeyListeners();
        return;
      }
      cmdId = id;
      info("Spawned new command with ID " + id.toString());
    });

    if (outputListener) {
      outputListener();
    }
    outputListener = await listen<{ message: string }>(
      "flux:event:cmdOutput",
      (e) => {
        if (e.payload.message === "flux:event:cmdOutputCompleted") {
          cmdId = -1;
          cmdRunning = false;
          outputListener();
          addPrefixText();
          removeKeyListeners();
        } else {
          addText(e.payload.message + "\n");
          cmdRunning = true;
        }
      },
    );
  };

  const clearTerm = () => {
    window.requestAnimationFrame(() => {
      if (textarea && pre) {
        textarea.value = prefixText;
        pre.innerText = textarea.value;
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
        class={`${styles.textarea} absolute left-0 top-0 z-10 h-full w-full resize-none overflow-auto whitespace-pre bg-transparent px-2 py-1 text-transparent caret-accent`}
        autocomplete="off"
        autoCapitalize="off"
        spellcheck={false}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onScroll={handleScroll}
        onClick={handleClick}
      />
      <pre
        ref={pre}
        class={`${styles.pre} absolute left-0 top-0 z-0 h-full w-full overflow-auto whitespace-pre bg-base-200 px-2 py-1`}
      ></pre>
    </div>
  );
};

export default FluxTerminal;
