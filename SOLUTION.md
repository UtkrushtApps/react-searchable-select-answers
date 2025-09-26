# Solution Steps

1. Create a reusable SearchableSelect component that accepts fetchOptions, value, onChange, getOptionLabel, getOptionValue props, etc.

2. Implement input state (controlled/uncontrolled), dropdown open/close state, highlightedIndex for keyboard navigation, and refs for input and dropdown scroll container.

3. Use a debounced input state (custom hook) to avoid excessive querying while typing. Use useDebouncedState for this.

4. Implement async fetching of options using a custom hook useAsyncOptions that calls the fetchOptions prop and manages loading, error, and result states. This hook should safely ignore stale requests.

5. Support keyboard navigation: ArrowDown/ArrowUp to move highlight, Enter to select, Escape to close. Scroll highlighted item into view.

6. Implement an accessible input field and dropdown using correct ARIA roles (combobox, listbox, option), live region announcements for loading and errors, and active descendant management.

7. Use react-virtual (or similar) for virtualized rendering: only render DOM rows for visible dropdown options.

8. Handle option selection: update controlled and uncontrolled selection (value/onChange), and populate input field accordingly.

9. Render loading, error, and no results states accessibly in the dropdown with live updates.

10. Implement dropdown open/close behavior on input focus, blur, and ESC key (with blur delay for option click).

11. Integrate SearchableSelect with a large candidate dataset using the provided mockFetchCandidates async function.

12. Demonstrate custom option rendering (avatar, email, etc.) via getOptionLabel in the App.js demo.

13. Support both controlled and uncontrolled value modes.

14. Export the component and example usage so that it's easily reusable and extensible for other entity types.

