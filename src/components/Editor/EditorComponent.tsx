/*
Copyright © 2024 The Flux Editor Contributors.

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

import Prism from "prismjs";
import { Show, createSignal, onMount } from "solid-js";
import { getClosingChar } from "../../utils/char";
import styles from "./EditorComponent.module.css";
import "./themes/dark.css";

// PrismJS plugins
import "prismjs/plugins/match-braces/prism-match-braces.min.js";

import "prismjs/components/prism-markup-templating.min.js"; // IMPORTANT: this should be at the top, since some lang grammars depend on this.
// PrismJS lang grammars
import "prismjs/components/prism-applescript.min.js";
import "prismjs/components/prism-armasm.min.js";
import "prismjs/components/prism-asm6502.min.js";
import "prismjs/components/prism-autohotkey.min.js";
import "prismjs/components/prism-bash.min.js";
import "prismjs/components/prism-basic.min.js";
import "prismjs/components/prism-batch.min.js";
import "prismjs/components/prism-brainfuck.min.js";
import "prismjs/components/prism-c.min.js";
import "prismjs/components/prism-cmake.min.js";
import "prismjs/components/prism-coffeescript.min.js";
import "prismjs/components/prism-cpp.min.js";
import "prismjs/components/prism-csharp.min.js";
import "prismjs/components/prism-css.min.js";
import "prismjs/components/prism-dart.min.js";
import "prismjs/components/prism-django.min.js";
import "prismjs/components/prism-docker.min.js";
import "prismjs/components/prism-editorconfig.min.js";
import "prismjs/components/prism-ejs.min.js";
import "prismjs/components/prism-elixir.min.js";
import "prismjs/components/prism-fsharp.min.js";
import "prismjs/components/prism-gdscript.min.js";
import "prismjs/components/prism-go.min.js";
import "prismjs/components/prism-gradle.min.js";
import "prismjs/components/prism-graphql.min.js";
import "prismjs/components/prism-haskell.min.js";
import "prismjs/components/prism-haxe.min.js";
import "prismjs/components/prism-http.min.js";
import "prismjs/components/prism-ignore.min.js";
import "prismjs/components/prism-java.min.js";
import "prismjs/components/prism-javascript.min.js";
import "prismjs/components/prism-json.min.js";
import "prismjs/components/prism-json5.min.js";
import "prismjs/components/prism-jsx.min.js";
import "prismjs/components/prism-julia.min.js";
import "prismjs/components/prism-kotlin.min.js";
import "prismjs/components/prism-latex.min.js";
import "prismjs/components/prism-less.min.js";
import "prismjs/components/prism-llvm.min.js";
import "prismjs/components/prism-lua.min.js";
import "prismjs/components/prism-makefile.min.js";
import "prismjs/components/prism-matlab.min.js";
import "prismjs/components/prism-mongodb.min.js";
import "prismjs/components/prism-nginx.min.js";
import "prismjs/components/prism-objectivec.min.js";
import "prismjs/components/prism-pascal.min.js";
import "prismjs/components/prism-perl.min.js";
import "prismjs/components/prism-php.min.js";
import "prismjs/components/prism-python.min.js";
import "prismjs/components/prism-ruby.min.js";
import "prismjs/components/prism-rust.min.js";
import "prismjs/components/prism-sass.min.js";
import "prismjs/components/prism-scala.min.js";
import "prismjs/components/prism-scss.min.js";
import "prismjs/components/prism-sql.min.js";
import "prismjs/components/prism-swift.min.js";
import "prismjs/components/prism-tsx.min.js";
import "prismjs/components/prism-typescript.min.js";
import "prismjs/components/prism-v.min.js";
import "prismjs/components/prism-vim.min.js";
import "prismjs/components/prism-visual-basic.min.js";
import "prismjs/components/prism-wasm.min.js";
import "prismjs/components/prism-yaml.min.js";

import { dialog, fs, invoke } from "@tauri-apps/api";
import path from "path-browserify";
import { specialCodeFileType } from "../../utils/file";
import { getTabs, setSavedTabs } from "./components/EditorTabs";
import {
  getSetting,
  getSettingsPath,
  loadSettings,
} from "../../settingsManager";
import { error } from "tauri-plugin-log-api";

const [selectedLine, setSelectedLine] = createSignal(-1);

const [isValidFile, setIsValidFile] = createSignal(true);

let filePath: string;
export const [fileSaved, setFileSaved] = createSignal<string[]>([]); // array of paths containing files that are saved. Local version of savedTabs() in EditorTabs.tsx
const [fileSavedContent, setFileSavedContent] = createSignal<string[][]>([]); // the first item is the path, second is saved content, and third is changed content.
// fileSavedContent is different from fileSaved, because the latter contains only saved files' paths, while fileSavedContent contains all active files' paths.
// it's like the tracking array.

const [lines, setLines] = createSignal(["1"]);
const [lineHeight, setLineHeight] = createSignal("1.5rem");

const [lang, setLang] = createSignal("");

export const loadEditorSettings = () => {
  const editorWrapper = document.getElementById("editor-wrapper");
  const textarea = document.getElementById("editing") as HTMLTextAreaElement;
  const highlightedContent = document.getElementById("highlighting-content");
  const highlightedContentPre = document.getElementById("highlighting");

  if (
    editorWrapper &&
    textarea &&
    highlightedContent &&
    highlightedContentPre
  ) {
    textarea.style.tabSize =
      highlightedContent.style.tabSize =
      highlightedContentPre.style.tabSize =
        getSetting("tabSize");

    setLineHeight(`${getSetting("editor:fontSize") / 16 + 0.5}rem`);
    editorWrapper.style.setProperty(
      "--editor-fontSize",
      `${getSetting("editor:fontSize") / 16}rem`,
    );
    editorWrapper.style.setProperty("--editor-lineHeight", lineHeight());
  }
};

export const getSavedFiles = () => {
  return fileSaved();
};

export const saveFile = async (saveAs?: boolean) => {
  const textarea = document.getElementById("editing") as HTMLTextAreaElement;
  let oldFilePath = filePath;

  if (getTabs().length === 0) return;

  const updateArrays = (path: string) => {
    setFileSaved([...fileSaved(), path]);
    fileSavedContent()[
      fileSavedContent().findIndex((i) => i.includes(path))
    ][1] = textarea.value; // sets the saved content value to textarea value

    setSavedTabs(fileSaved()); // updates savedTabs() signal in EditorTabs.tsx
  };

  if (saveAs) {
    filePath = (await dialog.save()) || "";
    if (filePath === "") return;

    fs.writeFile(filePath, textarea.value);
    filePath = oldFilePath;

    updateArrays(filePath);

    return;
  }
  if (
    fileSavedContent()[
      fileSavedContent().findIndex((i) => i.includes(filePath))
    ][1] != textarea.value // checks if the saved content is equal to textarea.value
  ) {
    fs.writeFile(filePath, textarea.value);

    if ((filePath = getSettingsPath())) {
      loadSettings();
    }

    updateArrays(filePath);
  }
};

export const closeFile = () => {
  fileSavedContent().splice(
    fileSavedContent().findIndex((i) => i.includes(filePath)),
    1,
  );
};

export const openFile = (pathLocal: string) => {
  const textarea = document.getElementById("editing") as HTMLTextAreaElement;

  if (
    !fileSaved().includes(pathLocal) &&
    !fileSavedContent().flat().includes(pathLocal) // checks if open file already exists as tab
  ) {
    setFileSaved([...fileSaved(), pathLocal]); // adds path to saved files array
  }

  switch (pathLocal) {
    case "flux:page:settingsGui":
      break;
    default:
      fs.readTextFile(pathLocal)
        .then((data) => {
          setIsValidFile(true);

          const fileExt = path
            .extname(pathLocal)
            .substring(1, path.extname(pathLocal).length);
          setLang(specialCodeFileType[fileExt] || fileExt);

          filePath = pathLocal;

          if (!fileSavedContent().flat().includes(pathLocal)) {
            // flattens fileSavedContent array and checks if open file's path exists there. So basically checks if open file is being tracked for changes
            setFileSavedContent([
              ...fileSavedContent(),
              [pathLocal, data, data],
            ]); // if not tracked, add it to tracking array
            textarea.value = data; // sets textarea value to value read from the open file
          } else {
            textarea.value =
              fileSavedContent()[
                fileSavedContent().findIndex((i) => i.includes(pathLocal))
              ][2]; // if already tracked, set textarea value to be the changed value, because the open file may not be saved. If saved, its value would be same as saved value.
          }

          highlightContent();
          updateLineNumbers();
          // TODO: restore selected line and character
          textarea.blur();
        })
        .catch((e: string) => {
          if (e.toString().includes("stream did not contain valid UTF-8")) {
            const highlightedContent = document.getElementById(
              "highlighting-content",
            );

            textarea.value = "";
            if (highlightedContent) {
              highlightedContent.innerHTML = "";
            }

            dialog.message("This file is currently not supported.", {
              type: "error",
              title: "Failed to open file",
            });
          }

          error(e.toString());
        });
      break;
  }
  setSavedTabs(fileSaved()); // syncs savedTabs() signal in EditorTabs.tsx with fileSaved()
};

// update line numbers
const updateLineNumbers = () => {
  const textareaRef = document.getElementById("editing") as HTMLTextAreaElement;
  if (textareaRef) {
    const linesArray = textareaRef.value.split("\n");
    const lineNumbers = Array.from({ length: linesArray.length }, (_, i) =>
      (i + 1).toString(),
    );
    setLines(lineNumbers);
  }
};

const highlightContent = () => {
  const textareaRef = document.getElementById("editing") as HTMLTextAreaElement;
  const highlightedContent = document.getElementById("highlighting-content");

  // [start] source (with modifications): https://css-tricks.com/creating-an-editable-textarea-that-supports-syntax-highlighted-code/
  // Licensed under MIT. License and copyright notice found in FluxEditor/resources/THIRD-PARTY-LICENSES.txt

  if (textareaRef) {
    let fixLastLine = false;
    const selectionStart = textareaRef.selectionStart;

    if (textareaRef.value[textareaRef.value.length - 1] == "\n") {
      textareaRef.value = textareaRef.value + " ";
      fixLastLine = true;
    }

    if (highlightedContent) {
      highlightedContent.innerHTML = textareaRef.value
        .replace(new RegExp("&", "g"), "&amp;")
        .replace(new RegExp("<", "g"), "&lt;");

      Prism.highlightElement(highlightedContent);
    }

    if (fixLastLine && textareaRef.value[textareaRef.value.length - 1] == " ") {
      textareaRef.value = textareaRef.value.substring(
        0,
        textareaRef.value.length - 1,
      );

      textareaRef.selectionStart = textareaRef.selectionEnd = selectionStart;
    }
  }

  // [end]
};

const calcHighlightLinePos = () => {
  const textarea = document.getElementById("editing") as HTMLTextAreaElement;
  const highlightedContentPre = document.getElementById("highlighting");
  const highlightedLine = document.getElementById("highlighted-line");

  if (highlightedLine && textarea) {
    highlightedLine.style.top = `calc(${selectedLine() - 1} * ${lineHeight()} - ${highlightedContentPre?.scrollTop}px)`;
    highlightedLine.style.height = lineHeight();

    const highlightedLinePos = highlightedLine.getBoundingClientRect();
    const textareaPos = textarea.getBoundingClientRect();
    if (highlightedLinePos.top < textareaPos.top) {
      highlightedLine.style.height = `calc(${lineHeight()} - (${textareaPos.top}px - ${highlightedLinePos.top}px))`;
      highlightedLine.style.top = "0";
    } else if (highlightedLinePos.bottom > textareaPos.bottom) {
      highlightedLine.style.height = `calc(${textareaPos.bottom}px - ${highlightedLinePos.top}px)`;
    } else {
      highlightedLine.style.height = lineHeight();
    }
  }
};

// highlights selected line
const updateSelectedLine = () => {
  const textarea = document.getElementById("editing") as HTMLTextAreaElement;
  const highlightedLine = document.getElementById("highlighted-line");

  setTimeout(() => {
    // renders on next frame because some values may not be updated yet.
    if (textarea) {
      const start = textarea.selectionStart;
      const value = textarea.value;
      const lineNumber = value.substring(0, start).split("\n").length; // gets line number from index of new lines.

      setSelectedLine(lineNumber);
    }
  }, 0);

  if (highlightedLine) {
    highlightedLine.style.height = lineHeight();
  }
};

const EditorComponent = () => {
  let lineNumbersDiv: HTMLElement | null;
  let highlightedContentPre: HTMLElement | null;
  let highlightedLine: HTMLElement | null;
  let textareaRef: HTMLTextAreaElement | undefined;

  onMount(() => {
    lineNumbersDiv = document.getElementById("line-numbers");
    highlightedContentPre = document.getElementById("highlighting");
    highlightedLine = document.getElementById("highlighted-line");

    // load settings
    loadEditorSettings();

    if (highlightedLine) {
      highlightedLine.style.height = "0";
    }
  });

  // updates <code> content for syntax highlighting
  const updateContent = () => {
    highlightContent();
    updateLineNumbers();
    updateSelectedLine();
  };

  const fileChanged = () => {
    if (!fileSaved().includes(filePath)) return; // if file doesn't exist in fileSaved, don't remove items from fileSaved.

    fileSaved().splice(fileSaved().indexOf(filePath), 1); // removes this file from fileSaved array, since this file has changes.
    setSavedTabs(fileSaved()); // syncs signals
  };

  const checkFileHasChanges = () => {
    if (textareaRef) {
      fileSavedContent()[
        fileSavedContent().findIndex((i) => i.includes(filePath))
      ][2] = textareaRef.value; // sets updated value in tracking array to be same as textarea value

      if (
        fileSavedContent()[
          fileSavedContent().findIndex((i) => i.includes(filePath))
        ][1] === textareaRef.value // checks if saved value is same as textarea value
      ) {
        // sets signals to know this file is saved
        setFileSaved([...fileSaved(), filePath]);
        setSavedTabs(fileSaved());
        if (fileSaved().length === getTabs().length) {
          invoke("set_doc_edited", { edited: false });
        }
      } else {
        fileChanged();
        invoke("set_doc_edited", { edited: true });
      }
    }
  };

  const handleInput = () => {
    updateContent();
    handleScroll();

    checkFileHasChanges();
  };

  const handleBlur = () => {
    setSelectedLine(-1);

    if (highlightedLine) {
      highlightedLine.style.height = "0";
    }
  };

  const handleScroll = () => {
    if (lineNumbersDiv && highlightedContentPre && textareaRef) {
      highlightedContentPre.scrollTop = textareaRef.scrollTop;
      highlightedContentPre.scrollLeft = textareaRef.scrollLeft;

      lineNumbersDiv.scrollTop = highlightedContentPre.scrollTop;

      calcHighlightLinePos();
    }
  };

  // handle custom functions on specific key presses
  const handleKeyDown = (e: KeyboardEvent) => {
    const textarea = e.target as HTMLTextAreaElement;
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    const value = textarea.value;

    const openingBrackets = ["(", "[", "{", "<"];
    const charsWithClosingChars = [...openingBrackets, '"', "'", "`"];

    //let newStart = selectionStart; // this is used in arrow key cases

    switch (e.key) {
      case "Tab":
        e.preventDefault();

        const updatedValue =
          value.substring(0, selectionStart) +
          "\t" +
          value.substring(selectionEnd);

        textarea.value = updatedValue;

        textarea.selectionStart = textarea.selectionEnd = selectionStart + 1;

        updateContent();
        fileChanged();

        break;

      case "ArrowUp":
      case "ArrowLeft":
      case "ArrowDown":
      case "ArrowRight":
        handleScroll();
        updateSelectedLine();

        break;

      case "Enter":
        if (
          openingBrackets.includes(
            textarea.value.charAt(textarea.selectionStart - 1),
          )
        ) {
          e.preventDefault();

          const updatedValue =
            value.substring(0, selectionStart) +
            "\n\t\n" +
            value.substring(selectionEnd);

          textarea.value = updatedValue;

          textarea.selectionStart = textarea.selectionEnd = selectionStart + 2;

          updateContent();
          fileChanged();

          setTimeout(() => calcHighlightLinePos(), 0);
        }

        updateLineNumbers();
        updateSelectedLine();

        break;

      case "Backspace":
        if (
          charsWithClosingChars.includes(
            textarea.value.charAt(selectionStart - 1),
          ) &&
          textarea.value.charAt(selectionStart) ===
            getClosingChar(textarea.value.charAt(selectionStart - 1))
        ) {
          e.preventDefault();

          const updatedValue =
            textarea.value.substring(0, selectionStart - 1) +
            textarea.value.substring(selectionStart + 1);

          textarea.value = updatedValue;

          textarea.selectionStart = textarea.selectionEnd = selectionStart - 1;

          updateContent();
          checkFileHasChanges();
        }

        break;

      default:
        if (charsWithClosingChars.includes(e.key)) {
          e.preventDefault();
          const newValue =
            value.substring(0, selectionStart) +
            e.key +
            getClosingChar(e.key) +
            value.substring(selectionEnd);

          textarea.value = newValue;
          textarea.selectionStart = textarea.selectionEnd = selectionStart + 1;

          updateContent();
          fileChanged();
        }
        break;
    }

    handleScroll();
  };

  // FIXME: make this more efficient, and fix positioning issues, so this doesn't rely on parent element's position styles

  return (
    <div class="flex h-full w-full select-none" id="editor-wrapper">
      <div class="relative">
        <Show when={isValidFile()}>
          <div
            id="line-numbers"
            class={`relative m-0 flex h-full w-[64px] min-w-[64px] max-w-[64px] select-none flex-col overflow-y-hidden bg-base-200 p-3 pt-0 text-right text-content`}
          >
            {lines().map((line) => (
              <div class="flex">
                <div class={`w-full pl-[10px] text-right ${styles.lineNumber}`}>
                  {line}
                </div>
              </div>
            ))}
          </div>
        </Show>
      </div>
      <div
        class="relative flex w-full flex-grow flex-col bg-base-200"
        id="editor-container"
      >
        <div
          id="highlighted-line"
          class="pointer-events-none absolute z-50 w-full bg-content opacity-10"
          style={{
            height: lineHeight(),
            top: `calc(${selectedLine() - 1} * ${lineHeight()} - ${textareaRef?.scrollTop}px)`,
          }}
        ></div>
        <textarea
          ref={textareaRef}
          id="editing"
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onMouseDown={updateSelectedLine}
          onScroll={handleScroll}
          autocomplete="off"
          autoCapitalize="off"
          spellcheck={false}
          onFocus={updateSelectedLine}
          onBlur={handleBlur}
          onSelect={handleBlur}
          class={`absolute left-0 top-0 z-10 flex h-full w-full flex-grow overflow-auto whitespace-pre bg-transparent text-transparent caret-content ${styles.textarea}`}
        ></textarea>
        <pre
          id="highlighting"
          aria-hidden="true"
          class={`absolute left-0 top-0 z-0 flex h-full w-full flex-grow overflow-auto whitespace-pre bg-base-200 text-content ${styles.highlighted}`}
        >
          {/* match-braces doesn't work */}
          <code
            class={`language-${lang()} match-braces rainbow-braces select-none`}
            id="highlighting-content"
          ></code>
        </pre>
      </div>
    </div>
  );
};

export default EditorComponent;
