/*
Copyright © 2024 Narvik Contributors.

This file is part of Narvik Editor.

Narvik Editor is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Narvik Editor is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Narvik Editor. If not, see <https://www.gnu.org/licenses/>. 
*/

import { createSignal, onMount } from "solid-js";
import Prism from "prismjs";
import { getClosingChar } from "../../utils/char";
import styles from "./EditorComponent.module.css";
import "./themes/dark.css";

// PrismJS plugins
import "prismjs/plugins/match-braces/prism-match-braces.min.js";
import "prismjs/plugins/autoloader/prism-autoloader.min.js";

interface Props {
  lang: string;
}

const EditorComponent = (props: Props) => {
  const [lines, setLines] = createSignal(["1"]);
  const [selectedLine, setSelectedLine] = createSignal(-1);

  let lineNumbersDiv: HTMLElement | null;
  let highlightedContent: HTMLElement | null;
  let highlightedContentPre: HTMLElement | null;
  let highlightedLine: HTMLElement | null;
  let textareaRef: HTMLTextAreaElement | undefined;

  onMount(() => {
    lineNumbersDiv = document.getElementById("line-numbers");
    highlightedContent = document.getElementById("highlighting-content");
    highlightedContentPre = document.getElementById("highlighting");
    highlightedLine = document.getElementById("highlighted-line");

    if (highlightedLine) {
      highlightedLine.style.height = "0";
    }
  });

  // highlight line

  const updateSelectedLine = () => {
    setTimeout(() => {
      if (textareaRef) {
        const start = textareaRef.selectionStart;
        const value = textareaRef.value;
        const lineNumber = value.substring(0, start).split("\n").length;

        setSelectedLine(lineNumber);
      }
    }, 0);

    if (highlightedLine) {
      highlightedLine.style.height = "1.5em";
    }
  };

  const calcHighlightLinePos = () => {
    if (highlightedLine && textareaRef) {
      highlightedLine.style.top = `calc(${selectedLine() - 1} * 1.5rem - ${textareaRef?.scrollTop}px)`;
      highlightedLine.style.height = "1.5em";

      const highlightedLinePos = highlightedLine.getBoundingClientRect();
      const textareaPos = textareaRef.getBoundingClientRect();
      if (highlightedLinePos.top < textareaPos.top) {
        highlightedLine.style.height = `calc(1.5em - (${textareaPos.top}px - ${highlightedLinePos.top}px))`;
        highlightedLine.style.top = "0";
      } else if (highlightedLinePos.bottom > textareaPos.bottom) {
        highlightedLine.style.height = `calc(${textareaPos.bottom}px - ${highlightedLinePos.top}px)`;
      } else {
        highlightedLine.style.height = "1.5em";
      }
    }
  };

  // update line numbers
  const updateLineNumbers = () => {
    if (textareaRef) {
      const linesArray = textareaRef.value.split("\n");
      const lineNumbers = Array.from({ length: linesArray.length }, (_, i) =>
        (i + 1).toString(),
      );
      setLines(lineNumbers);
    }
  };

  // updates <code> content for syntax highlighting
  const updateContent = () => {
    // [start] source (with modifications): https://css-tricks.com/creating-an-editable-textarea-that-supports-syntax-highlighted-code/

    if (textareaRef) {
      if (textareaRef.value[textareaRef.value.length - 1] == "\n") {
        textareaRef.value = textareaRef.value + "";
      }

      if (highlightedContent) {
        highlightedContent.innerHTML = textareaRef.value
          .replace(new RegExp("&", "g"), "&amp;")
          .replace(new RegExp("<", "g"), "&lt;");

        Prism.highlightElement(highlightedContent);
      }
    }

    // [end]

    updateLineNumbers();
    updateSelectedLine();
  };

  const handleInput = () => {
    updateContent();

    updateLineNumbers();

    updateSelectedLine();

    handleScroll();
  };

  const handleBlur = () => {
    setSelectedLine(-1);

    if (highlightedLine) {
      highlightedLine.style.height = "0";
    }
  };

  const handleScroll = () => {
    if (lineNumbersDiv && highlightedContentPre && textareaRef) {
      lineNumbersDiv.scrollTop = textareaRef.scrollTop;

      highlightedContentPre.scrollTop = textareaRef.scrollTop;
      highlightedContentPre.scrollLeft = textareaRef.scrollLeft;

      calcHighlightLinePos();
    }
  };

  // handle custom functions on specific key presses
  const handleKeyDown = (event: KeyboardEvent) => {
    const textarea = event.target as HTMLTextAreaElement;
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    const value = textarea.value;

    const openingBrackets = ["(", "[", "{"];
    const charsWithClosingChars = [...openingBrackets, '"', "'"];

    if (event.key === "Tab") {
      event.preventDefault();

      const updatedValue =
        value.substring(0, selectionStart) +
        "\t" +
        value.substring(selectionEnd);

      textarea.value = updatedValue;

      textarea.selectionStart = textarea.selectionEnd = selectionStart + 1;

      updateContent();
    } else if (
      event.key === "ArrowUp" ||
      event.key === "ArrowDown" ||
      event.key === "ArrowLeft" ||
      event.key === "ArrowRight"
    ) {
      let newStart = selectionStart;

      if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        const prevLineStart = value.indexOf("\n", selectionEnd);
        newStart = prevLineStart === -1 ? value.length - 1 : prevLineStart - 1;
      } else if (event.key === "ArrowDown") {
        const nextLineStart = value.indexOf("\n", selectionEnd);
        newStart = nextLineStart === -1 ? value.length : nextLineStart + 1;
      } else if (event.key === "ArrowRight" && value[selectionEnd] === "\n") {
        const nextLineStart = value.indexOf("\n", selectionEnd);
        newStart = nextLineStart === -1 ? value.length : nextLineStart + 1;
      }

      const newSelectedLine = value.substring(0, newStart).split("\n").length;
      setSelectedLine(newSelectedLine);
    } else if (event.key === "Enter") {
      if (
        openingBrackets.includes(
          textarea.value.charAt(textarea.selectionStart - 1),
        )
      ) {
        event.preventDefault();

        const updatedValue =
          value.substring(0, selectionStart) +
          "\n\t\n" +
          value.substring(selectionEnd);

        textarea.value = updatedValue;

        textarea.selectionStart = textarea.selectionEnd = selectionStart + 2;

        updateContent();
      }
    } else if (charsWithClosingChars.includes(event.key)) {
      event.preventDefault();
      const newValue =
        value.substring(0, selectionStart) +
        event.key +
        getClosingChar(event.key) +
        value.substring(selectionEnd);

      textarea.value = newValue;
      textarea.selectionStart = textarea.selectionEnd = selectionStart + 1;
      updateContent();
    } else if (event.key === "Backspace") {
      if (
        charsWithClosingChars.includes(
          textarea.value.charAt(selectionStart - 1),
        ) &&
        textarea.value.charAt(selectionStart) ===
          getClosingChar(textarea.value.charAt(selectionStart - 1))
      ) {
        event.preventDefault();

        const updatedValue =
          textarea.value.substring(0, selectionStart - 1) +
          textarea.value.substring(selectionStart + 1);

        textarea.value = updatedValue;

        textarea.selectionStart = textarea.selectionEnd = selectionStart - 1;

        updateContent();
      }
    }
  };

  return (
    <div class="flex h-full w-full">
      <div class="relative">
        <div
          id="line-numbers"
          class={`relative m-0 flex h-full w-[64px] min-w-[64px] max-w-[64px] select-none flex-col overflow-y-hidden bg-base-200 p-3 pt-0 text-right text-base text-content`}
        >
          {lines().map((line) => (
            <div class="flex">
              <div class={`w-full pl-[10px] text-right ${styles.lineNumber}`}>
                {line}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div
        class="relative flex w-full flex-grow flex-col"
        id="editor-container"
      >
        <div
          id="highlighted-line"
          class="pointer-events-none absolute z-50 h-[1.5rem] w-full bg-content opacity-10"
          style={{
            top: `calc(${selectedLine() - 1} * 1.5rem - ${textareaRef?.scrollTop}px)`,
          }}
        ></div>
        <textarea
          ref={textareaRef}
          id="editing"
          onInput={handleInput}
          onkeydown={handleKeyDown}
          onmousedown={updateSelectedLine}
          onscroll={handleScroll}
          autocomplete="off"
          autocapitalize="off"
          spellcheck={false}
          onfocus={updateSelectedLine}
          onblur={handleBlur}
          class={`text-transparent bg-transparent z-10 caret-content ${styles.textarea}`}
        ></textarea>
        <pre
          id="highlighting"
          aria-hidden="true"
          class={`z-0 bg-base-300 text-content ${styles.highlighted}`}
        >
          {/* match-braces doesn't work */}
          <code
            class={`language-${props.lang} match-braces rainbow-braces select-none`}
            id="highlighting-content"
          ></code>
        </pre>
      </div>
    </div>
  );
};

export default EditorComponent;
