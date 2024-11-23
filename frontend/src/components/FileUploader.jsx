import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';

export default function FileUploader({ onFileSelect, darkMode }) {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false
  });

  return (
    <div
      {...getRootProps()}
      className={`w-full p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors
        ${isDragActive 
          ? 'border-blue-500 bg-blue-50' 
          : darkMode 
          ? 'border-gray-600 bg-gray-800 hover:border-blue-500 hover:bg-gray-700' 
          : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-gray-50'
        }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center space-y-4">
        <Upload className={`w-12 h-12 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
        <div className="text-center">
          {isDragActive ? (
            <p className="text-blue-500">Drop your DOCX file here</p>
          ) : (
            <>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Drag and drop your DOCX file here, or</p>
              <p className="text-blue-500 font-medium">click to select a file</p>
            </>
          )}
        </div>
        <p className={`${darkMode ? 'text-gray-500' : 'text-gray-500'} text-sm`}>Only .docx files are supported</p>
      </div>
    </div>
  );
}
