import React, { useRef } from 'react';
import { Project } from '../types';
import { FolderIcon, ChevronRightIcon, ProjectIcon } from './icons';

interface ProjectSelectorProps {
    onDirectorySelect: (files: FileList | null) => void;
    projects: Project[];
    onProjectSelect: (project: Project) => void;
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({ onDirectorySelect, projects, onProjectSelect }) => {
    const directoryInputRef = useRef<HTMLInputElement>(null);

    const handleSelectFolderClick = () => {
        directoryInputRef.current?.click();
    };

    const handleDirectoryInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onDirectorySelect(event.target.files);
    };

    if (projects.length === 0) {
        return (
            <div className="w-full max-w-3xl flex flex-col items-center justify-center p-8 bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-xl text-center transition-all duration-300 animate-fade-in">
                <input
                    type="file"
                    ref={directoryInputRef}
                    onChange={handleDirectoryInputChange}
                    className="hidden"
                    // @ts-ignore
                    webkitdirectory="true"
                    directory="true"
                />
                <div className="w-full p-10">
                    <div className="flex flex-col items-center">
                        <FolderIcon />
                        <p className="mt-4 text-xl font-semibold text-slate-100">
                            Chọn thư mục chứa các dự án CapCut của bạn
                        </p>
                        <p className="mt-2 text-slate-400">Ứng dụng sẽ quét thư mục này để tìm tất cả các dự án của bạn.</p>
                        <button
                            onClick={handleSelectFolderClick}
                            className="mt-6 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200 text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500"
                        >
                            Chọn Thư mục
                        </button>
                    </div>
                </div>
                <div className="mt-6 text-left text-slate-400 text-sm w-full bg-slate-800 p-4 rounded-lg">
                    <h3 className="font-semibold text-slate-200 mb-2">Nơi tìm thư mục dự án:</h3>
                    <p className="mb-2">Thư mục này thường được đặt tại:</p>
                    <ul className="space-y-1">
                        <li>
                            <strong className="text-slate-300">Windows:</strong>
                            <code className="block bg-slate-900 text-cyan-400 px-2 py-1 rounded text-xs break-all mt-1">C:\Users\[YourUsername]\AppData\Local\CapCut\User Data\Projects\com.lveditor.draft</code>
                        </li>
                         <li className="pt-2">
                             <strong className="text-slate-300">macOS:</strong>
                             <code className="block bg-slate-900 text-cyan-400 px-2 py-1 rounded text-xs break-all mt-1">~/Library/Containers/com.lemon.lvoverseas/Data/Projects/com.lveditor.draft</code>
                        </li>
                    </ul>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl flex flex-col animate-fade-in">
            <h2 className="text-2xl font-bold text-center mb-6 text-cyan-400">Chọn một Dự án</h2>
            <div className="bg-slate-800/50 rounded-xl shadow-lg border border-slate-700 overflow-hidden">
                <div className="h-[70vh] overflow-y-auto p-4">
                    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {projects.map(project => (
                            <li key={project.id}>
                                <button
                                    onClick={() => onProjectSelect(project)}
                                    className="w-full h-full flex flex-col justify-between p-5 text-left bg-slate-800 hover:bg-slate-700/50 rounded-lg border border-slate-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 group"
                                >
                                    <div className="flex items-start gap-4">
                                       <div className="bg-slate-700 p-2 rounded-md mt-1">
                                            <ProjectIcon />
                                       </div>
                                       <div className="flex-grow">
                                            <p className="font-semibold text-lg text-slate-100 group-hover:text-cyan-400 transition-colors">{project.name}</p>
                                            <p className="text-sm text-slate-400 font-mono mt-1">
                                                {project.modifiedDate 
                                                    ? `Sửa đổi: ${project.modifiedDate.toLocaleString('vi-VN')}` 
                                                    : 'Không rõ ngày'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex justify-end items-center mt-4">
                                        <span className="text-sm font-semibold text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity">Mở dự án</span>
                                        <ChevronRightIcon />
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ProjectSelector;