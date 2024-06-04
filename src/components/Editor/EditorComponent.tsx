import { createEffect, createSignal, onCleanup, onMount } from "solid-js";
import styles from "./EditorComponent.module.css";

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
    updateLineNumbers(value);
  };

  let textareaRef: HTMLTextAreaElement | undefined;

  const handleScroll = () => {
    const lineNumbersDiv = document.getElementById("line-numbers");
    if (lineNumbersDiv  && textareaRef) {
      lineNumbersDiv.scrollTop = textareaRef.scrollTop;
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    const textarea = event.target as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;

    if (event.key === "Tab") {
      event.preventDefault();

      // Insert tab character at the current cursor position
      const updatedValue =
        value.substring(0, start) + "\t" + value.substring(end);

      // Update the textarea value with the tab character
      textarea.value = updatedValue;

      // Set the cursor position after the tab character
      textarea.selectionStart = textarea.selectionEnd = start + 1;
    } else if (
      event.key === "ArrowUp" ||
      event.key === "ArrowDown" ||
      event.key === "ArrowLeft" ||
      event.key === "ArrowRight"
    ) {
      event.preventDefault();

      // Calculate the new cursor position based on the arrow key press
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

      // Update the selected line state
      const newSelectedLine = value.substring(0, newStart).split("\n").length;
      setSelectedLine(newSelectedLine);

      // Update the cursor position
      textarea.setSelectionRange(newStart, newEnd);
    }
  };

  onMount(() => {
    if (textareaRef) {
      textareaRef.addEventListener("click", updateSelectedLine);
      textareaRef.addEventListener("input", updateSelectedLine);
      textareaRef.addEventListener("scroll", handleScroll);
      textareaRef.addEventListener("keydown", handleKeyDown);
    }
  });

  createEffect(() => {
    console.log("hello world");
  });

  onCleanup(() => {
    if (textareaRef) {
      textareaRef.removeEventListener("click", updateSelectedLine);
      textareaRef.removeEventListener("input", updateSelectedLine);
      textareaRef.removeEventListener("scroll", handleScroll);
      textareaRef.removeEventListener("keydown", handleKeyDown);
    }
  });

  return (
    <div class="flex h-full w-full">
      <div class="relative">
        {/* FIXME: remove relative positioning to make line highlights extends to the edge, but it will not scroll with line numbers */}
        <div
          id="line-numbers"
          class={`relative bg-base-200 p-3 pt-0 h-full text-content ${styles.lineNumbers} ${styles.component}`}
        >
          {lines().map((line, index) => (
            <div class="flex">
              <div id={line} class={`${styles.lineNumber}`}>{line}</div>
              <div
              id={`${line}-highlight`}
                class={
                  index + 1 === selectedLine()
                    ? `highlight absolute left-0 bg-content z-10 opacity-20 ${styles.highlightedLine}`
                    : ""
                }
              />
            </div>
          ))}
        </div>
      </div>
      <div class="relative flex w-full flex-grow">
        <textarea
          id="textarea"
          ref={textareaRef}
          class={`flex w-full flex-grow resize-none flex-col bg-base-300 p-0 text-content ${styles.component}`}
          autocomplete="off"
          autocapitalize="off"
          spellcheck={false}
          value={content()}
          onInput={handleInput}
        />
      </div>
    </div>
  );
};

export default EditorComponent;
