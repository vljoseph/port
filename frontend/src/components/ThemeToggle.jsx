import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      onClick={toggleTheme}
      className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 ${
        theme === 'dark' 
        ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700 shadow-[0_0_15px_rgba(250,204,21,0.2)]' 
        : 'bg-white text-indigo-600 hover:bg-slate-100 shadow-[0_0_15px_rgba(79,70,229,0.2)] border border-slate-200'
      }`}
      aria-label="Toggle Theme"
    >
      {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
    </motion.button>
  );
};

export default ThemeToggle;
