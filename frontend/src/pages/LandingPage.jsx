import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { UserCircle, Briefcase, ChevronDown, LogIn, Plus, Edit, Trash, Lock, FileText, Mails, Settings } from 'lucide-react';
import { TypeAnimation } from 'react-type-animation';

const LandingPage = () => {
  const navigate = useNavigate();
  const [hoveredButton, setHoveredButton] = useState(null);

  const recruiterMenu = [
    { label: 'View Projects', icon: <Briefcase size={16} />, path: '/recruiter/projects' },
    { label: 'View Resume', icon: <FileText size={16} />, path: '/recruiter/resume' },
    { label: 'View Skills', icon: <Settings size={16} />, path: '/recruiter/skills' },
    { label: 'Contact Me', icon: <Mails size={16} />, path: '/recruiter/contact' },
  ];

  const adminMenu = [
    { label: 'Admin Login', icon: <LogIn size={16} />, path: '/admin/login' },
    { label: 'Edit Profile & Resume', icon: <Edit size={16} />, path: '/admin/dashboard' },
    { label: 'Manage Projects', icon: <Briefcase size={16} />, path: '/admin/projects' },
    { label: 'Manage Skills', icon: <Settings size={16} />, path: '/admin/skills' },
    { label: 'Add Custom Section', icon: <Plus size={16} />, path: '/admin/sections' },
  ];

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat bg-blend-overlay bg-black/60">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16 z-10 glass-card p-12 rounded-3xl"
      >
        <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-700 dark:from-cyan-400 dark:to-blue-600 mb-6 tracking-tight">
          Lamb Joseph vinjamuri
        </h1>
        <h2 className="text-xl md:text-3xl font-medium text-slate-700 dark:text-slate-300 h-10 mb-8">
          <TypeAnimation
            sequence={[
              'Software Developer', 1000,
              'Full Stack Developer', 1000,
              'Azure Solutions Expert', 1000,
              'Python & Java Specialist', 1000,
            ]}
            wrapper="span"
            speed={50}
            repeat={Infinity}
          />
        </h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto mb-10 text-lg">
          Building scalable, premium, and performant digital experiences. Choose your view mode below to explore my portfolio.
        </p>

        <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">

          {/* Recruiter Button */}
          <div
            className="relative"
            onMouseEnter={() => setHoveredButton('recruiter')}
            onMouseLeave={() => setHoveredButton(null)}
          >
            <button
              onClick={() => navigate('/recruiter')}
              className="glass-button flex items-center gap-3 px-8 py-4 rounded-xl text-lg font-semibold text-slate-900 dark:text-white group"
            >
              <Briefcase className="group-hover:text-cyan-400 transition-colors" size={24} />
              I'm a Recruiter
              <ChevronDown size={20} className={`transform transition-transform ${hoveredButton === 'recruiter' ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {hoveredButton === 'recruiter' && (
                <div className="absolute top-full w-full min-w-[200px] left-1/2 -translate-x-1/2 pt-2 z-20">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="rounded-xl glass-card border border-white/10 overflow-hidden"
                  >
                    {recruiterMenu.map((item, i) => (
                      <button
                        key={i}
                        onClick={(e) => { e.stopPropagation(); navigate(item.path); }}
                        className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors text-left text-sm"
                      >
                        {item.icon}
                        {item.label}
                      </button>
                    ))}
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Admin Button */}
          <div
            className="relative"
            onMouseEnter={() => setHoveredButton('admin')}
            onMouseLeave={() => setHoveredButton(null)}
          >
            <button
              onClick={() => navigate('/admin/login')}
              className="glass-button flex items-center gap-3 px-8 py-4 rounded-xl text-lg font-semibold text-slate-900 dark:text-white group"
            >
              <Lock className="group-hover:text-purple-400 transition-colors" size={24} />
              Admin
              <ChevronDown size={20} className={`transform transition-transform ${hoveredButton === 'admin' ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {hoveredButton === 'admin' && (
                <div className="absolute top-full w-full min-w-[200px] left-1/2 -translate-x-1/2 pt-2 z-20">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="rounded-xl glass-card border border-white/10 overflow-hidden"
                  >
                    {adminMenu.map((item, i) => (
                      <button
                        key={i}
                        onClick={(e) => { e.stopPropagation(); navigate(item.path); }}
                        className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-left text-sm"
                      >
                        {item.icon}
                        {item.label}
                      </button>
                    ))}
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default LandingPage;
