/*
Copyright © 2024 Narvik Contributors.

This file is part of Narvik Editor.

Narvik Editor is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Narvik Editor is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Narvik Editor. If not, see <https://www.gnu.org/licenses/>. 
*/

import { createSignal, createEffect, For, Show } from "solid-js";
import styles from "./Search.module.css";

import cmds from "./results/commands.json";
import test from "./results/test.json";

interface Suggestion {
  id: number;
  name: string;
}

function SearchBar() {
  const [query, setQuery] = createSignal<string>("");
  const [suggestions, setSuggestions] = createSignal<{
    [key: string]: Suggestion[];
  }>({});
  const [filteredSuggestions, setFilteredSuggestions] = createSignal<{
    [key: string]: Suggestion[];
  }>({});
  const [isFocused, setIsFocused] = createSignal<boolean>(false);
  const [isLoading, setIsLoading] = createSignal<boolean>(false);

  createEffect(() => {
    // Merge data from multiple JSON sources into one object
    const mergedData: { [key: string]: Suggestion[] } = {
      Commands: cmds,
      Test: test,
    };
    setSuggestions(mergedData);
  });

  createEffect(() => {
    filterSuggestions();
  }, [query]);

  const filterSuggestions = () => {
    setIsLoading(true);
    const newFilteredSuggestions: { [key: string]: Suggestion[] } = {};
    const currentSuggestions = suggestions();
    Object.keys(currentSuggestions).forEach((category) => {
      const filteredCategorySuggestions = currentSuggestions[category].filter(
        (suggestion) =>
          suggestion.name.toLowerCase().includes(query().toLowerCase()),
      );
      if (filteredCategorySuggestions.length > 0) {
        newFilteredSuggestions[category] = filteredCategorySuggestions;
      }
    });
    setFilteredSuggestions(newFilteredSuggestions);
    setIsLoading(false);
  };

  const handleInputChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    setQuery(target.value);
  };

  return (
    <div class="relative">
      {/* Search Input */}
      <input
        class={`h-[26px] w-full bg-primary p-[10px] text-content outline-none hover:bg-primary-hover`}
        type="text"
        value={query()}
        onInput={handleInputChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Search"
        autocomplete="off"
        autocorrect="off"
        style={{
          "border-top-left-radius": "0.75rem",
          "border-top-right-radius": "0.75rem",
          "border-bottom-left-radius":
            query().length === 0 || !isFocused() ? "0.75rem" : "0",
          "border-bottom-right-radius":
            query().length === 0 || !isFocused() ? "0.75rem" : "0",
        }}
      />
      <Show when={isFocused()}>
        {/* Displays line when query is not empty and is focused */}
        <div
          class="w-full bg-content opacity-50"
          style={{ height: query().length === 0 || !isFocused() ? "0" : "1px" }}
        />
        {/* Displays loading while loading results */}
        {query() && isLoading() && (
          <div
            class={`absolute left-0 top-full w-full border-t-0 bg-primary text-content`}
            style={{
              "border-bottom-left-radius": "0.75rem",
              "border-bottom-right-radius": "0.75rem",
              "box-shadow": "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            <ul class={styles.suggestionsList}>
              <li class="flex cursor-default items-center p-[5px]">
                Loading...
              </li>
            </ul>
          </div>
        )}
        {/* Displays results if query is not empty and there are results */}
        {query() && Object.keys(filteredSuggestions()).length > 0 && (
          <div
            class={`absolute left-0 top-full w-full border-t-0 bg-primary text-content`}
            style={{
              "border-bottom-left-radius": "0.75rem",
              "border-bottom-right-radius": "0.75rem",
              "box-shadow": "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            <ul class={styles.suggestionsList}>
              <For each={Object.keys(filteredSuggestions())}>
                {(category) => (
                  <>
                    <li class="pl-2">
                      <strong>{category}</strong>
                    </li>
                    <For each={filteredSuggestions()[category]}>
                      {(suggestion) => (
                        <li
                          class={`flex h-[26px] cursor-pointer items-center pb-1 pl-5 hover:bg-primary-hover`}
                        >
                          {suggestion.name}
                        </li>
                      )}
                    </For>
                  </>
                )}
              </For>
            </ul>
          </div>
        )}
        {/* Displays no results if query is not empty and there are no results */}
        {!isLoading() &&
          Object.keys(filteredSuggestions()).length === 0 &&
          query() && (
            <div
              class={`absolute left-0 top-full w-full border-t-0 bg-primary text-content`}
              style={{
                "border-bottom-left-radius": "0.75rem",
                "border-bottom-right-radius": "0.75rem",
                "box-shadow": "0 2px 4px rgba(0, 0, 0, 0.1)",
              }}
            >
              <ul class={styles.suggestionsList}>
                <li class="flex cursor-default items-center p-[5px]">
                  No results found
                </li>
              </ul>
            </div>
          )}
      </Show>
    </div>
  );
}

export default SearchBar;
