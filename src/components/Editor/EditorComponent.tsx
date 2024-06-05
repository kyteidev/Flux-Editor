import { createSignal, onCleanup, onMount } from "solid-js";
import styles from "./EditorComponent.module.css";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.min.css"; //funky and twilight themes are broken
import "prismjs/components/prism-javascript";

interface Props {
  lang: string;
}

const EditorComponent = (props: Props) => {
  const [content, setContent] = createSignal("");
  const [lines, setLines] = createSignal(["1"]);
  const [selectedLine, setSelectedLine] = createSignal(-1);

  const updateSelectedLine = (event: Event) => {
    const textarea = event.target as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const value = textarea.value;
    const lineNumber = value.substring(0, start).split("\n").length;

    setSelectedLine(lineNumber);
  };

  const updateLineNumbers = (value: string) => {
    const linesArray = value.split("\n");
    const lineNumbers = Array.from({ length: linesArray.length }, (_, i) =>
      (i + 1).toString(),
    );
    setLines(lineNumbers);
  };

  const handleInput = (event: Event) => {
    const value = (event.target as HTMLTextAreaElement).value;
    setContent(value);
    const highlightedContent = document.querySelector("#highlighting-content");

    if (value[value.length - 1] == "\n") {
      setContent(value + "\n");
    }

    if (highlightedContent) {
      highlightedContent.innerHTML = value
        .replace(new RegExp("&", "g"), "&amp;")
        .replace(new RegExp("<", "g"), "&lt;");
      Prism.highlightAll();
    }
    updateLineNumbers(value);
    updateSelectedLine(event);

    handleScroll();
  };

  const handleBlur = () => {
    setSelectedLine(-1);
  };

  let textareaRef: HTMLTextAreaElement | undefined;

  const handleScroll = () => {
    const lineNumbersDiv = document.getElementById("line-numbers");
    const highlightedContentPre = document.getElementById("highlighting");
    if (lineNumbersDiv && highlightedContentPre && textareaRef) {
      lineNumbersDiv.scrollTop = textareaRef.scrollTop;

      highlightedContentPre.scrollTop = textareaRef.scrollTop;
      highlightedContentPre.scrollLeft = textareaRef.scrollLeft;

      console.log(textareaRef.scrollTop);
      console.log(highlightedContentPre.scrollTop);
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    const textarea = event.target as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;

    if (event.key === "Tab") {
      event.preventDefault();

      const updatedValue =
        value.substring(0, start) + "\t" + value.substring(end);

      textarea.value = updatedValue;

      textarea.selectionStart = textarea.selectionEnd = start + 1;
    } else if (
      event.key === "ArrowUp" ||
      event.key === "ArrowDown" ||
      event.key === "ArrowLeft" ||
      event.key === "ArrowRight"
    ) {
      event.preventDefault();

      let newStart = start;
      let newEnd = end;
      if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        const prevLineStart = value.indexOf("\n", end);
        newStart = prevLineStart === -1 ? value.length - 1 : prevLineStart - 1;
        newEnd = newStart;
      } else if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        const nextLineStart = value.indexOf("\n", end);
        newStart = nextLineStart === -1 ? value.length : nextLineStart + 1;
        newEnd = newStart;
      }

      const newSelectedLine = value.substring(0, newStart).split("\n").length;
      setSelectedLine(newSelectedLine);

      textarea.setSelectionRange(newStart, newEnd);
    }
  };

  onMount(() => {
    if (textareaRef) {
      textareaRef.addEventListener("click", updateSelectedLine);
      textareaRef.addEventListener("keydown", handleKeyDown);
    }
  });

  onCleanup(() => {
    if (textareaRef) {
      textareaRef.removeEventListener("click", updateSelectedLine);
      textareaRef.removeEventListener("keydown", handleKeyDown);
    }
  });

  return (
    <div class="flex h-full w-full">
      <div class="relative">
        {/* FIXME: remove relative positioning to make line highlights extends to the edge, but it will not scroll with line numbers */}
        <div
          id="line-numbers"
          class={`relative h-full bg-base-200 p-3 pt-0 text-content ${styles.lineNumbers} ${styles.component}`}
        >
          {lines().map((line, index) => (
            <div class="flex">
              <div class={`${styles.lineNumber}`}>{line}</div>
              <div
                class={
                  index + 1 === selectedLine()
                    ? `absolute left-0 z-10 bg-content opacity-20 ${styles.highlightedLine}`
                    : ""
                }
              />
            </div>
          ))}
        </div>
      </div>
      <div class="relative flex w-full flex-grow flex-col">
        <textarea
          ref={textareaRef}
          id="editing"
          onInput={handleInput}
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
