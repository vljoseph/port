import { useState, useEffect } from 'react';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { useNavigate, Routes, Route, Link, useLocation, useParams } from 'react-router-dom';
import { LayoutDashboard, Briefcase, FileText, Settings, Mails, ArrowLeft, ExternalLink, Github, Download, Phone, MapPin, Send, Linkedin, Facebook, Instagram, Youtube, Image as ImageIcon, Video, Grid, Menu, X } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [customSections, setCustomSections] = useState([]);
  const [profile, setProfile] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    api.get('/sections').then(res => setCustomSections(res.data)).catch(console.error);
    api.get('/profile').then(res => setProfile(res.data)).catch(console.error);
  }, []);

  const menu = [
    { label: 'Overview', icon: <LayoutDashboard size={20} />, path: '/recruiter' },
    { label: 'Contact', icon: <Mails size={20} />, path: '/recruiter/contact' },
    { label: 'Projects', icon: <Briefcase size={20} />, path: '/recruiter/projects' },
    { label: 'Resume', icon: <FileText size={20} />, path: '/recruiter/resume' },
    { label: 'Skills', icon: <Settings size={20} />, path: '/recruiter/skills' },
    { label: 'Gallery', icon: <Grid size={20} />, path: '/recruiter/gallery' },
    ...customSections.map(sec => ({
      label: sec.title, icon: <FileText size={20} />, path: `/recruiter/section/${sec.id}`
    }))
  ];

  return (
    <>
      <button onClick={() => setMobileMenuOpen(true)} className="md:hidden fixed top-4 right-4 z-40 bg-cyan-600 text-white p-2.5 rounded-lg shadow-lg">
        <Menu size={24} />
      </button>

      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      <aside className={`h-screen z-50 group transition-all duration-500 ease-in-out shrink-0 ${mobileMenuOpen ? 'fixed top-0 left-0 w-64 block' : 'sticky top-0 left-0 w-2 md:w-4 md:hover:w-64 hidden md:block'}`}>
        <div className={`absolute top-0 left-0 w-64 glass-card border-r border-white/10 h-screen flex flex-col p-6 transition-transform duration-500 ease-in-out shadow-2xl text-left ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-[15rem] md:group-hover:translate-x-0'}`}>
          
          <div className="md:hidden absolute top-4 right-4 cursor-pointer text-slate-400 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
            <X size={24} />
          </div>

          <div className="mb-10 text-center mt-4 md:mt-0">
            <div className="w-20 h-20 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-full mx-auto mb-4 p-1">
            <div className="w-full h-full bg-white dark:bg-slate-900 rounded-full flex items-center justify-center overflow-hidden">
              {profile?.profilePhoto ? (
                <img src={profile.profilePhoto} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-bold">LV</span>
              )}
            </div>
          </div>
          <h3 className="font-bold text-lg whitespace-nowrap overflow-hidden">{profile?.name || 'Lamb Joseph'}</h3>
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          {menu.map((item, i) => {
            const isActive = location.pathname === item.path || (item.path !== '/recruiter' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={i}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap overflow-hidden ${isActive ? 'bg-white dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-medium border border-slate-200 dark:border-cyan-500/30' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
              >
                {item.icon}
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <button onClick={() => navigate('/')} className="mt-auto flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white transition-colors whitespace-nowrap overflow-hidden">
          <ArrowLeft size={20} /> <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">Exit to Home</span>
        </button>
      </div>
      </aside>
    </>
  );
};

const ProjectsView = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get('/projects');
        setProjects(response.data);
      } catch (err) {
        console.error('Failed to fetch projects:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <h1 className="text-3xl font-bold text-white mb-4">Featured Projects</h1>
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 rounded-full border-4 border-cyan-500/30 border-t-cyan-500 animate-spin"></div>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-slate-400 p-8 text-center glass-card rounded-2xl">No projects to display yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((p, i) => (
            <div key={i} className="glass-card overflow-hidden rounded-2xl group hover:-translate-y-2 transition-transform duration-300 flex flex-col">

              {((p.images && p.images.length > 0) || (p.videos && p.videos.length > 0)) && (
                <div className="relative w-full h-48 bg-slate-900 border-b border-white/5">
                  {p.videos && p.videos.length > 0 ? (
                    <video src={p.videos[0]} controls className="w-full h-full object-cover" />
                  ) : (
                    <img src={p.images[0]} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  )}
                  <div className="absolute top-2 right-2 flex gap-1">
                    {p.images && p.images.length > 0 && <span className="bg-black/50 backdrop-blur-md px-2 py-1 rounded text-[10px] flex items-center gap-1"><ImageIcon size={10} /> {p.images.length}</span>}
                    {p.videos && p.videos.length > 0 && <span className="bg-black/50 backdrop-blur-md px-2 py-1 rounded text-[10px] flex items-center gap-1"><Video size={10} /> {p.videos.length}</span>}
                  </div>
                </div>
              )}

              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-white mb-2">{p.title}</h3>
                <p className="text-slate-400 mb-4 flex-1">{p.desc}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {p.tech.map((t, idx) => (
                    <span key={idx} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">{t}</span>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-auto">
                  <a href={p.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-white hover:text-cyan-400 transition-colors">
                    <ExternalLink size={16} /> Live Demo
                  </a>
                  <a href="#" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                    <Github size={16} /> Source Code
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

const OverviewView = () => {
  const [profile, setProfile] = useState(null);
  useEffect(() => {
    api.get('/profile').then(res => setProfile(res.data)).catch(console.error);
  }, []);

  if (!profile) return <div className="text-slate-400">Loading overview...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-3xl font-bold mb-6 text-white">Welcome, Recruiter</h1>
      <p className="text-slate-400 text-lg max-w-2xl text-justify">
        {profile.about}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
        <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-cyan-400">{profile.yearsExperience}</span>
          <span className="text-slate-400 mt-2 text-sm uppercase tracking-wider">Years Exp.</span>
        </div>
        <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-blue-400">{profile.totalProjects}</span>
          <span className="text-slate-400 mt-2 text-sm uppercase tracking-wider">Projects</span>
        </div>
        <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-purple-400">{profile.certificates}</span>
          <span className="text-slate-400 mt-2 text-sm uppercase tracking-wider">Certificates</span>
        </div>
      </div>
    </motion.div>
  );
};

const SkillsView = () => {
  const [skills, setSkills] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categoriesList = ['All', 'Frontend', 'Backend', 'Database', 'Cloud / DevOps', 'General'];

  useEffect(() => {
    api.get('/skills').then(res => setSkills(res.data)).catch(console.error);
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <h1 className="text-3xl font-bold text-white mb-6">Technical Skills</h1>

      <div className="flex flex-wrap gap-3 mb-8">
        {categoriesList.map(c => (
          <button
            key={c}
            onClick={() => setSelectedCategory(c)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors border ${selectedCategory === c ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' : 'bg-slate-800/50 border-white/5 text-slate-400 hover:bg-slate-700/50 hover:text-white'}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(selectedCategory === 'All' ? skills : skills.filter(s => s.category === selectedCategory)).map(skill => (
          <div key={skill.id} className="glass-card p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-white mb-1">{skill.name}</h3>
            <p className="text-xs text-cyan-400 mb-4">{skill.category}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const ResumeView = () => {
  const [profile, setProfile] = useState(null);
  useEffect(() => {
    api.get('/profile').then(res => setProfile(res.data)).catch(console.error);
  }, []);

  if (!profile) return <div className="text-slate-400">Loading resume info...</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-[90%] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">My Resume</h1>
        <a href={profile.resumeLink} target="_blank" rel="noopener noreferrer" className="bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-[0_0_15px_rgba(8,145,178,0.3)] text-sm">
          <ExternalLink size={18} /> Open Full Screen
        </a>
      </div>
      <div className="flex-1 glass-card rounded-2xl overflow-hidden p-1.5 border border-white/10">
        <iframe src={profile.resumeLink} className="w-full h-full rounded-xl bg-slate-900/50" title="Resume" frameBorder="0" />
      </div>
    </motion.div>
  );
};

const CustomSectionView = () => {
  const { id } = useParams();
  const [section, setSection] = useState(null);

  useEffect(() => {
    api.get('/sections')
      .then(res => {
        const found = res.data.find(s => String(s.id) === String(id));
        setSection(found);
      })
      .catch(console.error);
  }, [id]);

  if (!section) return <div className="text-slate-400 p-8">Loading section context...</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 pb-10">
      <div className="border-b border-white/10 pb-4 mb-6">
        <h1 className="text-3xl font-bold text-white">{section.title}</h1>
      </div>

      {section.internalSections?.map((block, index) => (
        <div key={index} className="space-y-8 glass-card p-8 rounded-3xl border border-white/5 relative bg-slate-800/30 backdrop-blur-md">
          <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-sm font-bold border border-cyan-500/20">
            {index + 1}
          </div>

          {block.text && (
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5">
              <p className="text-slate-300 text-lg whitespace-pre-wrap leading-relaxed">{block.text}</p>
            </div>
          )}

          {block.images?.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {block.images.map((img, i) => (
                <div key={i} className="relative w-full h-64 md:h-80 bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-lg">
                  <img src={img} alt="Visual Content" className="absolute inset-0 w-full h-full object-contain bg-black/50 backdrop-blur-sm" />
                </div>
              ))}
            </div>
          )}

          {block.videos?.length > 0 && (
            <div className="space-y-6">
              {block.videos.map((vid, i) => (
                <video key={i} src={vid} controls className="w-full max-w-4xl rounded-2xl border border-white/10 shadow-lg bg-black" />
              ))}
            </div>
          )}

          {(block.files?.length > 0 || block.links?.length > 0) && (
            <div className="flex flex-wrap gap-4 pt-4 border-t border-white/5">
              {block.files?.map((f, i) => (
                <a key={`f-${i}`} href={f.url} download className="glass-button bg-slate-800/80 hover:bg-slate-700 text-slate-200 px-5 py-3 rounded-xl flex items-center gap-3 transition-colors shadow-lg border border-slate-600">
                  <Download size={18} className="text-cyan-400" /> {f.name}
                </a>
              ))}
              {block.links?.map((link, i) => (
                <a key={`l-${i}`} href={link.url} target="_blank" rel="noopener noreferrer" className="glass-button bg-cyan-900/40 hover:bg-cyan-800/60 text-cyan-100 px-5 py-3 rounded-xl flex items-center gap-3 transition-colors border border-cyan-500/30 shadow-lg">
                  <ExternalLink size={18} className="text-cyan-400" /> {link.title}
                </a>
              ))}
            </div>
          )}
        </div>
      ))}

      {(!section.internalSections || section.internalSections.length === 0) && (
        <div className="text-slate-500 italic p-6">This section currently has no content blocks.</div>
      )}
    </motion.div>
  );
};

const ContactView = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.get('/profile').then(res => setProfile(res.data)).catch(console.error);
  }, []);

  if (!profile) return <div className="text-slate-400 p-8">Loading contact info...</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-10">
      <h1 className="text-3xl font-bold text-white mb-6">Get In Touch</h1>

      <div className="max-w-3xl">
        <div className="space-y-6">
          <div className="glass-card p-8 rounded-3xl">
            <h3 className="text-xl font-bold text-white mb-6">Contact Information</h3>
            <div className="space-y-5">
              {profile.email && (
                <a href={`mailto:${profile.email}`} className="flex items-center gap-4 text-slate-400 hover:text-cyan-400 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center group-hover:bg-cyan-500/10">
                    <Mails size={20} />
                  </div>
                  <span>{profile.email}</span>
                </a>
              )}
              {profile.whatsapp && (
                <a href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-slate-400 hover:text-green-400 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center">
                    <Phone size={20} />
                  </div>
                  <span>{profile.whatsapp}</span>
                </a>
              )}
              {profile.location && (
                <div className="flex items-center gap-4 text-slate-400">
                  <div className="w-12 h-12 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center">
                    <MapPin size={20} />
                  </div>
                  <span>{profile.location}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-white/10">
              {profile.github && (
                <a href={profile.github} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-cyan-500/20 hover:text-cyan-400 transition-all border border-slate-700">
                  <Github size={20} />
                </a>
              )}
              {profile.linkedin && (
                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-500/20 hover:text-blue-400 transition-all border border-slate-700">
                  <Linkedin size={20} />
                </a>
              )}
              {profile.youtube && (
                <a href={profile.youtube} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-all border border-slate-700">
                  <Youtube size={20} />
                </a>
              )}
              {profile.instagram && (
                <a href={profile.instagram} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-pink-500/20 hover:text-pink-400 transition-all border border-slate-700">
                  <Instagram size={20} />
                </a>
              )}
              {profile.facebook && (
                <a href={profile.facebook} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600/20 hover:text-blue-500 transition-all border border-slate-700">
                  <Facebook size={20} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const GalleryView = () => {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/gallery')
      .then(res => { setGallery(res.data); setLoading(false); })
      .catch(console.error);
  }, []);

  if (loading) return <div className="text-slate-400 p-8">Loading media...</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <h1 className="text-3xl font-bold text-white mb-6">Media Gallery</h1>

      {gallery.length === 0 ? (
        <div className="text-slate-400 p-8 text-center glass-card rounded-2xl">No media items available yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gallery.map((item, index) => (
            <motion.div 
              key={item.id} 
              initial={{ opacity: 0, x: 50 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group glass-card overflow-hidden rounded-3xl border border-white/10 aspect-square"
            >
              {item.type === 'image' ? (
                <img src={item.url} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              ) : (
                <div className="relative w-full h-full bg-slate-900">
                  <video src={item.url} controls className="w-full h-full object-cover" />
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 pointer-events-none">
                <h3 className="text-white font-bold text-lg">{item.title}</h3>
                <p className="text-cyan-400 text-xs uppercase font-medium mt-1 tracking-wider">{item.type} media</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

const RecruiterDashboard = () => {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 transition-colors duration-300 w-full max-w-[100vw] overflow-x-hidden">
      <Sidebar />
      <main className="flex-1 w-full px-4 py-20 md:p-12 h-screen overflow-y-auto transition-all duration-500 ease-in-out">
        <Routes>
          <Route path="/" element={<OverviewView />} />
          <Route path="/contact" element={<ContactView />} />
          <Route path="/projects" element={<ProjectsView />} />
          <Route path="/skills" element={<SkillsView />} />
          <Route path="/resume" element={<ResumeView />} />
          <Route path="/section/:id" element={<CustomSectionView />} />
          <Route path="/gallery" element={<GalleryView />} />
          <Route path="*" element={<div className="text-slate-400">Section coming soon...</div>} />
        </Routes>
      </main>
    </div>
  );
};

export default RecruiterDashboard;
