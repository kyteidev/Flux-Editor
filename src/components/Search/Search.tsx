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
          suggestion.name.toLowerCase().includes(query().toLowerCase())
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
    <div class={styles.searchContainer}>
      <input
        class={`bg-primary hover:bg-secondary text-primary-content ${styles.searchInput} ${
          isFocused() ? styles.focused : ""
        }`}
        type="text"
        value={query()}
        onInput={handleInputChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Search..."
        autocomplete="off"
        autocorrect="off"
        style={{
          "border-top-left-radius": "20px",
          "border-top-right-radius": "20px",
          "border-bottom-left-radius": query().length === 0 || !isFocused() ? "20px" : "0",
          "border-bottom-right-radius": query().length === 0 || !isFocused() ? "20px" : "0",
        }}
      />
      <Show when={isFocused()}>
        <div
          class="absolute bottom-0 left-0 w-full bg-gray-300"
          style={{ height: query().length === 0 ? "0" : "1px" }}
        ></div>
        {query() && isLoading() && <div>Loading...</div>}
        {query() && Object.keys(filteredSuggestions()).length > 0 && (
          <div
            class={`bg-primary text-primary-content ${styles.suggestionsContainer}`}
          >
            <ul class={styles.suggestionsList}>
              <For each={Object.keys(filteredSuggestions())}>
                {(category) => (
                  <>
                    <li>
                      <strong>{category}</strong>
                    </li>
                    <For each={filteredSuggestions()[category]}>
                      {(suggestion) => (
                        <li class={`hover:bg-secondary ${styles.suggestionItem}`}>{suggestion.name}</li>
                      )}
                    </For>
                  </>
                )}
              </For>
            </ul>
          </div>
        )}
        {!isLoading() &&
          Object.keys(filteredSuggestions()).length === 0 &&
          query() && (
            <div
              class={`bg-primary text-primary-content ${styles.suggestionsContainer}`}
            >
              <ul class={styles.suggestionsList}>
                <li class={styles.suggestionItem}>No results found</li>
              </ul>
            </div>
          )}
      </Show>
    </div>
  );
}

export default SearchBar;
