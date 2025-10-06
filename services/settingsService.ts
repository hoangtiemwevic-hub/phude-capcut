// NOTE: This service is a placeholder for a feature that is not fully feasible in a web browser.
// Due to browser security restrictions, web applications cannot access or store
// the full file path of a user's local files. When a user selects a file, the browser
// provides the file's name and content but deliberately hides its full directory path.
// Therefore, saving the "last opened directory" as a traditional desktop application would
// is not possible.

/**
 * In a desktop application, this function would save the path of the last directory
 * the user accessed. In a web browser environment, this functionality cannot be
 * implemented due to security sandboxing. This function is a placeholder and has no effect.
 *
 * @param _path The directory path, which is unavailable to the browser.
 */
export const saveLastUsedDirectory = (_path: string): void => {
    // This function is intentionally left empty.
    // We cannot access the file's full path from the browser.
    // console.log('Attempted to save a directory path, but this is not possible in a web environment.');
};

/**
 * In a desktop application, this function would retrieve the last saved directory path
 * to prime the file-open dialog. In a web browser, since we cannot save the path,
 * this function will always return a default value (e.g., an empty string).
 *
 * @returns An empty string, as no path can be stored.
 */
export const getLastUsedDirectory = (): string => {
    // We cannot retrieve a saved path, so we return a default value.
    return '';
};
