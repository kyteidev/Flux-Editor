import { createSignal, onCleanup, onMount } from "solid-js";
import styles from "./EditorComponent.module.css";
import Prism from "prismjs";
import "./themes/dark.css"; //funky and twilight themes are broken
import "prismjs/components/prism-javascript";

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

    if (textareaRef) {
      textareaRef.addEventListener("click", updateSelectedLine);
    }
  });

  onCleanup(() => {
    if (textareaRef) {
      textareaRef.removeEventListener("click", updateSelectedLine);
    }
  });

  // highlight line

  const updateSelectedLine = (event: Event) => {
    const textarea = event.target as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const value = textarea.value;
    const lineNumber = value.substring(0, start).split("\n").length;

    setSelectedLine(lineNumber);

    if (highlightedLine) {
      highlightedLine.style.height = "1.5em";
    }
  };

  const calcHighlightLinePos = () => {
    if (highlightedLine && textareaRef) {
      highlightedLine.style.top = `calc(${selectedLine() - 1} * 1.5rem - ${textareaRef?.scrollTop}px)`;

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
  };

  const handleInput = (event: Event) => {
    updateContent();

    updateLineNumbers();

    updateSelectedLine(event);

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

  const handleKeyDown = (event: KeyboardEvent) => {
    const textarea = event.target as HTMLTextAreaElement;
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    const value = textarea.value;

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
      event.preventDefault();

      const newValue =
        value.substring(0, selectionStart) +
        "\n" +
        value.substring(selectionEnd);

      textarea.value = newValue;

      textarea.setSelectionRange(selectionStart + 1, selectionStart + 1);

      updateContent();
      updateLineNumbers();
      updateSelectedLine(event);
    }
  };

  return (
    <div class="flex h-full w-full">
      <div class="relative">
        <div
          id="line-numbers"
          class={`relative h-full bg-base-200 p-3 pt-0 text-content ${styles.lineNumbers} ${styles.component}`}
        >
          {lines().map((line) => (
            <div class="flex">
              <div class={`${styles.lineNumber}`}>{line}</div>
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
          onscroll={handleScroll}
          autocomplete="off"
          autocapitalize="off"
          spellcheck={false}
          onfocus={updateSelectedLine}
          onblur={handleBlur}
          class={`caret-content ${styles.textarea}`}
        ></textarea>
        <pre
          id="highlighting"
          aria-hidden="true"
          class={`bg-base-300 text-content ${styles.highlighted}`}
        >
          <code class="language-javascript" id="highlighting-content"></code>
        </pre>
      </div>
    </div>
  );
};

export default EditorComponent;
