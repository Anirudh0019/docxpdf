import { useDarkMode } from './DarkMode';
import { Sun, Moon } from 'lucide-react';

export default function DarkModeToggle() {
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      className="fixed top-4 right-4 p-2 rounded-full focus:outline-none"
      aria-label="Toggle dark mode"
    >
      {darkMode ? (
        <Sun className="text-yellow-500 w-6 h-6" />
      ) : (
        <Moon className="text-gray-700 w-6 h-6" />
      )}
    </button>
  );
}

