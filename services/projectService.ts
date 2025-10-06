import { Project } from '../types';

/**
 * Scans a FileList from a directory input to find subdirectories that are CapCut projects.
 * A project is identified by the presence of a 'draft_content.json' file.
 *
 * @param files The FileList object from an `<input type="file" webkitdirectory />`.
 * @returns A promise that resolves to an array of Project objects, sorted by most recent.
 */
export const discoverProjects = async (files: FileList): Promise<Project[]> => {
    const projectsMap = new Map<string, File>();

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // The `webkitRelativePath` property gives the path relative to the selected directory.
        // e.g., "MyProjectFolder/draft_content.json"
        const path = file.webkitRelativePath;

        if (path.endsWith('draft_content.json')) {
            // Split by either '/' or '\' to handle different OS path separators
            const pathParts = path.split(/[/\\]/);
            
            // The project name is the directory containing the draft file.
            if (pathParts.length >= 2) {
                const projectName = pathParts[pathParts.length - 2];
                // Ensure we don't overwrite a valid project with one from a nested folder
                if (!projectsMap.has(projectName)) {
                    projectsMap.set(projectName, file);
                }
            }
        }
    }

    const projects: Project[] = Array.from(projectsMap.entries()).map(([name, draftFile]) => ({
        id: name,
        name: name,
        draftFile: draftFile,
        modifiedDate: new Date(draftFile.lastModified),
    }));

    // Sort projects with the most recently modified first
    projects.sort((a, b) => {
        if (!a.modifiedDate) return 1;
        if (!b.modifiedDate) return -1;
        return b.modifiedDate.getTime() - a.modifiedDate.getTime();
    });

    return projects;
};
