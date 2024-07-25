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

import {
  createEffect,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
} from "solid-js";
import { cmdFlux } from "./commands";

const [show, setShow] = createSignal(false);
const [query, setQuery] = createSignal("");
const [selected, setSelected] = createSignal(0);

let inputRef: HTMLInputElement | undefined;

const handleOutsideClick = (e: MouseEvent) => {
  if (e.target instanceof HTMLElement) {
    if (
      !inputRef?.contains(e.target) &&
      e.target.tagName != "LI" &&
      e.target.tagName != "UL"
    ) {
      toggleSearch();
    }
  }
};

export const toggleSearch = () => {
  setShow(!show());
  inputRef?.focus();
  if (show()) {
    document.addEventListener("mousedown", handleOutsideClick);
  } else {
    setQuery("");
    setSelected(0);
    document.removeEventListener("mousedown", handleOutsideClick);
  }
};

const Search = () => {
  let containerRef: HTMLUListElement | undefined;

  const [mergedCmds, setMergedCmds] = createSignal<{
    [key: string]: () => void;
  }>({});
  const [suggestions, setSuggestions] = createSignal<string[]>([]);

  const data = Object.assign({}, cmdFlux);

  let altPressed = false;
  let spacePressed = false;

  let delayID: number;

  onMount(async () => {
    setMergedCmds(data);
    setSuggestions(Object.keys(data));
  });

  onCleanup(() => {
    clearTimeout(delayID);
  });

  createEffect(() => {
    if (query()) {
      filterSuggestions(query());
    } else {
      setSuggestions(Object.keys(data));
    }
  });

  createEffect(() => {
    const currentSelected = selected();
    if (containerRef) {
      const suggestions = containerRef.querySelectorAll("li"); // Assuming 'li' elements are your suggestion items
      if (suggestions.length > 0 && suggestions[currentSelected]) {
        suggestions[currentSelected].scrollIntoView({
          behavior: "instant", // looks horrible if set to smooth when scrolling fast
          block: "nearest",
        });
      }
    }
  });

  const filterSuggestions = (query: string) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    const filteredSuggestions = Object.keys(mergedCmds()).filter((suggestion) =>
      suggestion.toLowerCase().includes(query.toLowerCase()),
    );
    setSuggestions(filteredSuggestions);
  };

  let time = 0;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.code === "Enter") {
      data[suggestions()[selected()]]();
      toggleSearch();
    }

    altPressed = e.altKey;
    spacePressed = e.code === "Space";

    if (altPressed && spacePressed) {
      altPressed = false;
      spacePressed = false;

      e.preventDefault();
      toggleSearch();
      return;
    }
    if (e.code === "Escape") {
      toggleSearch();
      return;
    }

    const updateSelected = () => {
      if (e.code === "ArrowDown" || e.code === "ArrowRight") {
        if (selected() === suggestions().length - 1) {
          setSelected(0);
        } else {
          setSelected(selected() + 1);
        }
      } else {
        if (selected() === 0) {
          setSelected(suggestions().length - 1);
        } else {
          setSelected(selected() - 1);
        }
      }
    };

    if (e.code.includes("Arrow")) {
      if (new Date().getTime() - time >= 50) {
        updateSelected();
        time = new Date().getTime();
      }
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    altPressed = e.altKey;
    spacePressed = e.code === "Space";

    if (e.code.includes("Arrow")) {
      clearTimeout(delayID);
    }
  };

  const handleInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    setQuery(target.value);
  };

  return (
    <Show when={show()}>
      <input
        ref={inputRef}
        class="shadows absolute z-50 h-10 w-[28rem] rounded-t bg-base-100 px-2 py-1 caret-accent"
        style={{
          left: `calc((100vw - 28rem) / 2)`,
          top: `calc((100vh - 2.5rem) / 4)`,
        }}
        value={query()}
        placeholder="Search/Do Anything..."
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onInput={handleInput}
        autocorrect="off"
        autocomplete="false"
        autofocus
      />
      <div
        id="separator"
        class="absolute z-50 h-[1px] w-[28rem] bg-base-100-hover"
        style={{
          left: `calc((100vw - 28rem) / 2)`,
          top: `calc((100vh - 2.5rem) / 4 + 2.5rem)`,
        }}
      />
      <ul
        ref={containerRef}
        class="shadows absolute z-50 w-[28rem] overflow-auto rounded-b bg-base-100"
        style={{
          left: `calc((100vw - 28rem) / 2)`,
          top: `calc((100vh - 2.5rem) / 4 + 2.5rem + 1px)`,
          "max-height": "40vh",
        }}
      >
        <Show
          when={suggestions().length > 0}
          fallback={
            <li class="flex h-10 items-center rounded-b bg-base-100 px-2 py-1">
              No Results
            </li>
          }
        >
          <For each={suggestions()}>
            {(suggestion, index) => {
              const highlightQuery = (suggestion: string, query: string) => {
                const parts = suggestion.split(new RegExp(`(${query})`, "gi"));
                return parts.map((part) =>
                  part.toLowerCase() === query.toLowerCase() ? (
                    <span class="text-accent">{part}</span>
                  ) : (
                    <span>{part}</span>
                  ),
                );
              };

              return (
                <li
                  class={`${index() === selected() && "bg-base-100-hover"} flex h-10 items-center bg-base-100 px-2 py-1 last:rounded-b hover:bg-base-100-hover active:brightness-125`}
                  onClick={() => {
                    data[suggestion]();
                    toggleSearch();
                  }}
                >
                  <p>{highlightQuery(suggestion, query())}</p>
                </li>
              );
            }}
          </For>
        </Show>
      </ul>
    </Show>
  );
};

export default Search;
