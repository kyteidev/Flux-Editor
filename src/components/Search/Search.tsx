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

import { createSignal, createEffect, For, Show, Match, Switch } from "solid-js";

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
        class={`${query().length === 0 || !isFocused() ? "rounded-b-xl" : ""} h-[26px] w-full rounded-t-xl bg-primary p-[10px] text-content outline-none hover:bg-primary-hover`}
        type="text"
        value={query()}
        onInput={handleInputChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Search"
        autocomplete="off"
        autocorrect="off"
      />
      <Show when={isFocused()}>
        {/* Displays line when query is not empty and is focused */}
        <div
          class="w-full bg-content opacity-50"
          style={{ height: query().length === 0 || !isFocused() ? "0" : "1px" }}
        />
        <div class="absolute left-0 top-full w-full rounded-b-xl border-t-0 bg-primary text-content shadow-xl">
          <ul class="m-0 list-none p-0">
            <Switch>
              {/* Displays loading while loading results */}
              <Match when={query() && isLoading()}>
                <li class="flex cursor-default items-center p-[5px] last:rounded-b-xl">
                  Loading...
                </li>
              </Match>
              {/* Displays results if query is not empty and there are results */}
              <Match
                when={query() && Object.keys(filteredSuggestions()).length > 0}
              >
                <For each={Object.keys(filteredSuggestions())}>
                  {(category) => (
                    <>
                      <li class="pl-2">
                        <strong>{category}</strong>
                      </li>
                      <For each={filteredSuggestions()[category]}>
                        {(suggestion) => (
                          <li class="flex h-[26px] cursor-pointer items-center pb-1 pl-5 last:rounded-b-xl hover:bg-primary-hover">
                            {suggestion.name}
                          </li>
                        )}
                      </For>
                    </>
                  )}
                </For>
              </Match>
              {/* Displays no results if query is not empty and there are no results */}
              <Match
                when={
                  !isLoading() &&
                  Object.keys(filteredSuggestions()).length === 0
                }
              >
                <li class="flex cursor-default items-center p-[5px] last:rounded-b-xl">
                  No results found
                </li>
              </Match>
            </Switch>
          </ul>
        </div>
      </Show>
    </div>
  );
}

export default SearchBar;
