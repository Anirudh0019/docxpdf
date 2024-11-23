import React from 'react';
import { FileText, AlertCircle } from 'lucide-react';
import FileUploader from './components/FileUploader';
import FileInfo from './components/FileInfo';
import { useDarkMode } from './DarkMode'; // Importing context hook
import DarkModeToggle from './DarkModeToggle';

function App() {
  const { darkMode } = useDarkMode(); // Accessing darkMode from context

  const [selectedFile, setSelectedFile] = React.useState(null);
  const [converting, setConverting] = React.useState(false);
  const [error, setError] = React.useState(null);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setError(null);
  };

  const handleConvert = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    try {
      setConverting(true);
      setError(null);

      // Prepare form data for file upload
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Send file to backend for conversion
      const response = await fetch('http://localhost:3000/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error converting file. Please try again.');
      }

      // Download the converted PDF
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedFile.name.replace('.docx', '')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || 'Error converting file. Please try again.');
      console.error('Conversion error:', err);
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-50 text-gray-900'}`}>
      {/* Dark Mode Toggle */}
      <DarkModeToggle />

      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <FileText className="h-12 w-12 text-blue-500" />
          </div>
          <h1 className="text-4xl font-bold mb-4">DOCX to PDF Converter</h1>
          <p className="text-lg">
            Convert your Word documents to high-quality PDFs with preserved formatting
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          <FileUploader onFileSelect={handleFileSelect} darkMode={darkMode} />

          {selectedFile && (
            <div className="space-y-6">
              <FileInfo file={selectedFile} darkMode={darkMode} />

              <div className="flex justify-center">
                <button
                  onClick={handleConvert}
                  disabled={converting}
                  className={`px-6 py-3 rounded-lg text-white font-medium ${
                    converting ? 'bg-blue-400 cursor-not-allowed' :
                    darkMode ? 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700' : 
                    'bg-blue-500 hover:bg-blue-500 active:bg-blue-600'
                  } transition-colors duration-200`}
                >
                  {converting ? 'Converting...' : 'Convert to PDF'}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center space-x-2 text-red-500 bg-red-50 dark:bg-red-900 p-4 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
