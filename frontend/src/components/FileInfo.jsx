import React from 'react';
import { FileText, Calendar, HardDrive } from 'lucide-react';

export default function FileInfo({ file, darkMode }) {
  return (
    <div className={`rounded-lg shadow-md p-6 space-y-4 ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-800'}`}>
      <h3 className="text-lg font-semibold mb-4">File Information</h3>
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <FileText className="w-5 h-5 text-blue-500" />
          <div>
            <p className="text-sm text-gray-500">File Name</p>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{file.name}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Calendar className="w-5 h-5 text-blue-500" />
          <div>
            <p className="text-sm text-gray-500">Last Modified</p>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {new Date(file.lastModified).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <HardDrive className="w-5 h-5 text-blue-500" />
          <div>
            <p className="text-sm text-gray-500">Size</p>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
