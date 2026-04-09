import { useState, useEffect } from 'react';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Plus, Edit, Settings, Trash, LogOut, UploadCloud, GripVertical, Image as ImageIcon, Video, Grid, User, Lock, Eye, EyeOff, Menu, X } from 'lucide-react';

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    api.get('/profile').then(res => setProfile(res.data)).catch(console.error);
  }, []);
  
  const menu = [
    { label: 'Profile & Resume', icon: <LayoutDashboard size={20} />, path: '/admin/dashboard' },
    { label: 'Manage Projects', icon: <Edit size={20} />, path: '/admin/projects' },
    { label: 'Manage Skills', icon: <Settings size={20} />, path: '/admin/skills' },
    { label: 'Custom Sections', icon: <Plus size={20} />, path: '/admin/sections' },
    { label: 'Media Gallery', icon: <Grid size={20} />, path: '/admin/gallery' },
  ];

  return (
    <>
      <button onClick={() => setMobileMenuOpen(true)} className="md:hidden fixed top-4 right-4 z-40 bg-purple-600 text-white p-2.5 rounded-lg shadow-lg">
        <Menu size={24} />
      </button>

      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      <aside className={`h-screen z-50 group transition-all duration-500 ease-in-out shrink-0 ${mobileMenuOpen ? 'fixed top-0 left-0 w-64 block' : 'sticky top-0 left-0 w-2 md:w-4 md:hover:w-64 hidden md:block'}`}>
        <div className={`absolute top-0 left-0 w-64 bg-slate-900 border-r border-slate-800 h-screen flex flex-col p-6 transition-transform duration-500 ease-in-out shadow-2xl text-left ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-[15rem] md:group-hover:translate-x-0'}`}>
          
          <div className="md:hidden absolute top-4 right-4 cursor-pointer text-slate-400 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
            <X size={24} />
          </div>

          <div className="mb-10 flex flex-col items-center text-center mt-4 md:mt-0">
            <div className="w-16 h-16 bg-[#070B14] rounded-full flex items-center justify-center mb-4 border border-slate-800 shrink-0">
            <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 to-purple-500">LV</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-wide whitespace-nowrap overflow-hidden">{profile?.name || 'Lamb Joseph'}</h3>
          <p className="text-xs text-purple-400 uppercase tracking-widest font-semibold mt-1 whitespace-nowrap overflow-hidden">Admin Panel</p>
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          {menu.map((item, i) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={i} 
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap overflow-hidden ${isActive ? 'bg-purple-500/20 text-purple-400 font-medium border border-purple-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
              >
                {item.icon}
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <button onClick={() => navigate('/')} className="mt-auto flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors whitespace-nowrap overflow-hidden">
          <LogOut size={20} /> <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">Logout</span>
        </button>
      </div>
      </aside>
    </>
  );
};

const AdminProjectsConfig = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '', desc: '', tech: '', link: '', images: [], videos: []
  });
  const [uploading, setUploading] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Do you want to delete?')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects(projects.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        title: project.title,
        desc: project.desc,
        tech: project.tech.join(', '),
        link: project.link,
        images: project.images || [],
        videos: project.videos || []
      });
    } else {
      setEditingProject(null);
      setFormData({ title: '', desc: '', tech: '', link: '', images: [], videos: [] });
    }
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData(); fd.append('file', file);
    try {
      const res = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data'}});
      if (type === 'image') {
        setFormData({ ...formData, images: [...formData.images, res.data.url] });
      } else {
        setFormData({ ...formData, videos: [...formData.videos, res.data.url] });
      }
    } catch(err) { console.error(err); alert('Upload failed'); }
    finally { setUploading(false); }
  };

  const handleRemoveMedia = (type, index) => {
    if (!window.confirm('Do you want to delete?')) return;
    if (type === 'image') {
      setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) });
    } else {
      setFormData({ ...formData, videos: formData.videos.filter((_, i) => i !== index) });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      tech: formData.tech.split(',').map(t => t.trim()).filter(t => t)
    };

    try {
      if (editingProject) {
        const res = await api.put(`/projects/${editingProject.id}`, payload);
        setProjects(projects.map(p => p.id === editingProject.id ? res.data : p));
      } else {
        const res = await api.post('/projects', payload);
        setProjects([...projects, res.data]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Manage Projects</h1>
        <button onClick={() => handleOpenModal()} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(147,51,234,0.3)]">
          <Plus size={18} /> Add New Project
        </button>
      </div>

      {loading ? (
        <div className="text-slate-400">Loading projects...</div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="text-slate-500 cursor-grab active:cursor-grabbing hover:text-white transition-colors">
                  <GripVertical size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200">{project.title}</h4>
                  <p className="text-xs text-slate-400 truncate max-w-sm mt-1">{project.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleOpenModal(project)} className="p-2 text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all">
                  <Edit size={18} />
                </button>
                <button onClick={() => handleDelete(project.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                  <Trash size={18} />
                </button>
              </div>
            </div>
          ))}
          {projects.length === 0 && <p className="text-slate-500 italic">No projects added yet.</p>}
        </div>
      )}

      {/* Admin Add/Edit Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-md shadow-2xl relative">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Edit size={24} className="text-purple-500"/> 
              {editingProject ? 'Edit Project' : 'Add New Project'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Project Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500" placeholder="e.g. E-Commerce Platform" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                <textarea required value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500" placeholder="Describe the purpose and solution..." rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Technologies (comma separated)</label>
                <input type="text" value={formData.tech} onChange={e => setFormData({...formData, tech: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500" placeholder="React, Node.js, Tailwind" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Live/Demo Link</label>
                <input type="text" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500" placeholder="https://..." />
              </div>

              {/* Project Media Handling */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 relative overflow-hidden group">
                  <h4 className="text-xs font-bold text-white mb-2 flex justify-between tracking-wide uppercase">Images <span>({formData.images.length})</span></h4>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.images.map((img, i) => (
                      <div key={i} className="relative w-12 h-12 rounded bg-black">
                        <img src={img} className="w-full h-full object-cover rounded" />
                        <button type="button" onClick={(e) => { e.preventDefault(); handleRemoveMedia('image', i); }} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 z-20"><Trash size={10} /></button>
                      </div>
                    ))}
                  </div>
                  <div className={`mt-2 block text-center border border-dashed border-slate-600 rounded-lg p-2 text-xs ${uploading ? 'opacity-50' : 'group-hover:bg-slate-700 border-purple-500/50 text-purple-400'} transition-colors relative`}>
                    Browse Images
                    <input type="file" accept="image/*" onChange={e => handleFileUpload(e, 'image')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" disabled={uploading}/>
                  </div>
                </div>

                <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 relative overflow-hidden group">
                  <h4 className="text-xs font-bold text-white mb-2 flex justify-between tracking-wide uppercase">Videos <span>({formData.videos.length})</span></h4>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.videos.map((vid, i) => (
                      <div key={i} className="relative w-12 h-12 rounded bg-black flex items-center justify-center">
                        <Video size={16} className="text-blue-400" />
                        <button type="button" onClick={(e) => { e.preventDefault(); handleRemoveMedia('video', i); }} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 z-20"><Trash size={10} /></button>
                      </div>
                    ))}
                  </div>
                  <div className={`mt-2 block text-center border border-dashed border-slate-600 rounded-lg p-2 text-xs ${uploading ? 'opacity-50' : 'group-hover:bg-slate-700 border-blue-500/50 text-blue-400'} transition-colors relative`}>
                    Browse Videos
                    <input type="file" accept="video/*" onChange={e => handleFileUpload(e, 'video')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" disabled={uploading}/>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-purple-600 dark:hover:bg-purple-500 rounded-lg text-sm font-bold transition-colors shadow-lg disabled:opacity-50">Save Project</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

const AdminProfileConfig = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [authUploading, setAuthUploading] = useState(false);
  const [showAuthPassword, setShowAuthPassword] = useState(false);
  const [authForm, setAuthForm] = useState({ newEmail: '', newPassword: '' });

  useEffect(() => {
    api.get('/profile').then(res => {
      setProfile({
        ...res.data, 
        about: res.data.about || '' 
      });
      setLoading(false);
    });
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Set the dynamic bio and replace resume link with new file url
      setProfile({ ...profile, resumeLink: res.data.url });
    } catch (err) {
      console.error('File upload failed:', err);
      alert('File upload failed. Ensure backend is running.');
    } finally {
      setUploading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoUploading(true);
    const fd = new FormData(); fd.append('file', file);
    try {
      const res = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' }});
      setProfile({ ...profile, profilePhoto: res.data.url });
    } catch (err) { alert('Failed to upload photo'); } 
    finally { setPhotoUploading(false); }
  };

  const handleAuthUpdate = async (e) => {
    e.preventDefault();
    setAuthUploading(true);
    try {
      const res = await api.post('/auth/update', authForm);
      alert(res.data.message);
      setAuthForm({ newEmail: '', newPassword: '' });
    } catch(err) {
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      setAuthUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/profile', profile);
      alert('Profile Configuration Saved!');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-slate-400">Loading profile...</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <h1 className="text-3xl font-bold text-white mb-8">Manage Profile & Resume</h1>
      
      <form onSubmit={handleSubmit} className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl w-full space-y-6 mb-8">
        
        <div className="flex items-center gap-6 mb-6">
          <div className="relative w-24 h-24 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
            {profile.profilePhoto ? <img src={profile.profilePhoto} className="w-full h-full object-cover" /> : <User size={40} className="text-slate-600" />}
            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" title="Click to browse for an image" />
            {photoUploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20"><div className="w-6 h-6 border-2 border-purple-500 border-t-white rounded-full animate-spin"></div></div>}
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-400 mb-1">Display Name</label>
            <input required type="text" value={profile.name || ''} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500" placeholder="e.g. Lamb Joseph" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">About (Recruiter View Bio)</label>
          <textarea required value={profile.about} onChange={e => setProfile({...profile, about: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500" rows={3} placeholder="Write a short summary..." />
        </div>
        
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Years Exp.</label>
            <input required type="text" value={profile.yearsExperience} onChange={e => setProfile({...profile, yearsExperience: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Projects</label>
            <input required type="text" value={profile.totalProjects} onChange={e => setProfile({...profile, totalProjects: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Certificates</label>
            <input required type="text" value={profile.certificates} onChange={e => setProfile({...profile, certificates: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Resume (URL or Local File)</label>
          <div className="flex gap-4 items-center">
            <input required type="text" value={profile.resumeLink} onChange={e => setProfile({...profile, resumeLink: e.target.value})} className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500" placeholder="https://..." />
            
            <label className={`cursor-pointer border border-slate-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center min-w-[120px] ${uploading ? 'bg-slate-700 opacity-50 cursor-not-allowed' : 'bg-slate-800 hover:bg-slate-700'}`}>
              {uploading ? 'Uploading...' : 'Browse File...'}
              <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileUpload} disabled={uploading} />
            </label>
          </div>
        </div>

        <div className="border-t border-slate-700 pt-6">
          <h3 className="text-lg font-bold text-white mb-4">Contact & Socials</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Gmail Address</label>
              <input type="email" value={profile.email || ''} onChange={e => setProfile({...profile, email: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500" placeholder="yourname@gmail.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Location</label>
              <input type="text" value={profile.location || ''} onChange={e => setProfile({...profile, location: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">WhatsApp Number</label>
              <input type="text" value={profile.whatsapp || ''} onChange={e => setProfile({...profile, whatsapp: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500" placeholder="+1 234 567 8900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">LinkedIn Link</label>
              <input type="text" value={profile.linkedin || ''} onChange={e => setProfile({...profile, linkedin: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">GitHub Link</label>
              <input type="text" value={profile.github || ''} onChange={e => setProfile({...profile, github: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Facebook Link</label>
              <input type="text" value={profile.facebook || ''} onChange={e => setProfile({...profile, facebook: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Instagram Link</label>
              <input type="text" value={profile.instagram || ''} onChange={e => setProfile({...profile, instagram: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">YouTube Link</label>
              <input type="text" value={profile.youtube || ''} onChange={e => setProfile({...profile, youtube: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500" />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={saving} className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-purple-600 dark:hover:bg-purple-500 px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Overview Settings'}
          </button>
        </div>
      </form>

      <form onSubmit={handleAuthUpdate} className="bg-slate-800/50 border border-red-900/50 p-6 rounded-2xl w-full space-y-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1"><Lock size={20} className="text-red-400" /> Security & Authentication</h3>
          <p className="text-slate-400 text-sm mb-6">Update the master email address and password used to access this Admin panel.</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">New Admin Email ID</label>
            <input type="email" value={authForm.newEmail} onChange={e => setAuthForm({...authForm, newEmail: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-red-500" placeholder="Optional..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">New Master Password</label>
            <div className="relative">
              <input type={showAuthPassword ? "text" : "password"} minLength="6" value={authForm.newPassword} onChange={e => setAuthForm({...authForm, newPassword: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 pr-12 text-white focus:outline-none focus:border-red-500" placeholder="Optional... (min 6 chars)" />
              <button type="button" onClick={() => setShowAuthPassword(!showAuthPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                {showAuthPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end pt-4">
          <button type="submit" disabled={authUploading || (!authForm.newEmail && !authForm.newPassword)} className="bg-red-600/80 hover:bg-red-500 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50">
            {authUploading ? 'Updating...' : 'Update Login Credentials'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

const AdminSkillsConfig = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [formData, setFormData] = useState({ name: '', category: 'Frontend' });
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const categoriesList = ['All', 'Frontend', 'Backend', 'Database', 'Cloud / DevOps', 'General'];

  useEffect(() => {
    api.get('/skills').then(res => {
      setSkills(res.data);
      setLoading(false);
    });
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Do you want to delete?')) return;
    await api.delete(`/skills/${id}`);
    setSkills(skills.filter(s => s.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingSkill) {
      const res = await api.put(`/skills/${editingSkill.id}`, formData);
      setSkills(skills.map(s => s.id === editingSkill.id ? res.data : s));
    } else {
      const res = await api.post('/skills', formData);
      setSkills([...skills, res.data]);
    }
    setIsModalOpen(false);
  };

  const handleOpenModal = (skill = null) => {
    setEditingSkill(skill);
    setFormData(skill ? { name: skill.name, category: skill.category, proficiency: skill.proficiency } : { name: '', category: 'Frontend', proficiency: 50 });
    setIsModalOpen(true);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex justify-between items-start md:items-center mb-8 flex-col md:flex-row gap-4">
        <h1 className="text-3xl font-bold text-white">Manage Skills</h1>
        <button onClick={() => handleOpenModal()} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-[0_0_15px_rgba(147,51,234,0.3)]">
          <Plus size={18} /> Add Skill
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {categoriesList.map(c => (
          <button 
            key={c}
            onClick={() => setSelectedCategory(c)}
            className={`px-4 py-2 rounded-full text-sm transition-colors ${selectedCategory === c ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'}`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? <div className="text-slate-400">Loading skills...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {(selectedCategory === 'All' ? skills : skills.filter(s => s.category === selectedCategory)).map(skill => (
            <div key={skill.id} className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex justify-between items-center group">
              <div className="flex-1 mr-4">
                <h4 className="font-semibold text-white">{skill.name}</h4>
                <p className="text-xs text-purple-400 mb-2">{skill.category}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleOpenModal(skill)} className="p-2 text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all"><Edit size={16}/></button>
                <button onClick={() => handleDelete(skill.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"><Trash size={16}/></button>
              </div>
            </div>
          ))}
          {skills.length === 0 && <p className="text-slate-500 italic">No skills added yet.</p>}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-sm">
            <h2 className="text-xl font-bold text-white mb-4">{editingSkill ? 'Edit Skill' : 'Add Skill'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Skill Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-800 border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
                <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-800 border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-purple-500">
                  <option>Frontend</option>
                  <option>Backend</option>
                  <option>Database</option>
                  <option>Cloud / DevOps</option>
                  <option>General</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white px-3 py-2">Cancel</button>
                <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg transition-colors">Save</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

const AdminSectionsConfig = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '', internalSections: []
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api.get('/sections').then(res => {
      setSections(res.data); setLoading(false);
    });
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Do you want to delete?')) return;
    await api.delete(`/sections/${id}`);
    setSections(sections.filter(s => s.id !== id));
  };

  const handleOpenModal = (sec = null) => {
    setEditingSection(sec);
    setFormData(sec ? { ...sec } : { title: '', internalSections: [{ text: '', images: [], videos: [], files: [], links: [] }] });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingSection) {
      const res = await api.put(`/sections/${editingSection.id}`, formData);
      setSections(sections.map(s => s.id === editingSection.id ? res.data : s));
    } else {
      const res = await api.post('/sections', formData);
      setSections([...sections, res.data]);
    }
    setIsModalOpen(false);
  };

  const addInternalSection = () => {
    setFormData({
      ...formData, 
      internalSections: [...formData.internalSections, { text: '', images: [], videos: [], files: [], links: [] }]
    });
  };

  const removeInternalSection = (index) => {
    if (!window.confirm('Do you want to delete?')) return;
    const newItems = formData.internalSections.filter((_, i) => i !== index);
    setFormData({...formData, internalSections: newItems});
  };

  const updateInternalSection = (index, field, value) => {
    const newItems = [...formData.internalSections];
    newItems[index][field] = value;
    setFormData({...formData, internalSections: newItems});
  };

  const handleFileUpload = async (e, type, index) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData(); fd.append('file', file);
    try {
      const res = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data'}});
      const newItems = [...formData.internalSections];
      if (type === 'image') newItems[index].images.push(res.data.url);
      if (type === 'video') newItems[index].videos.push(res.data.url);
      if (type === 'file') newItems[index].files.push({ name: file.name, url: res.data.url });
      setFormData({...formData, internalSections: newItems});
    } catch(err) { console.error(err); alert('Upload failed'); }
    finally { setUploading(false); }
  };

  const handleAddLink = (index) => {
    const title = prompt('Link Title:');
    if (!title) return;
    const url = prompt('URL:');
    if (!url) return;
    const newItems = [...formData.internalSections];
    newItems[index].links.push({ title, url });
    setFormData({...formData, internalSections: newItems});
  };

  const handleRemoveMediaFromBlock = async (blockIndex, type, mediaIndex) => {
    if (!window.confirm('Do you want to permanently delete this media from the server? This cannot be undone.')) return;
    const newItems = [...formData.internalSections];
    let mediaUrl = '';

    if (type === 'image') {
      mediaUrl = newItems[blockIndex].images[mediaIndex];
      newItems[blockIndex].images = newItems[blockIndex].images.filter((_, i) => i !== mediaIndex);
    }
    if (type === 'video') {
      mediaUrl = newItems[blockIndex].videos[mediaIndex];
      newItems[blockIndex].videos = newItems[blockIndex].videos.filter((_, i) => i !== mediaIndex);
    }
    if (type === 'file') {
      mediaUrl = newItems[blockIndex].files[mediaIndex].url;
      newItems[blockIndex].files = newItems[blockIndex].files.filter((_, i) => i !== mediaIndex);
    }
    if (type === 'link') {
      newItems[blockIndex].links = newItems[blockIndex].links.filter((_, i) => i !== mediaIndex);
    }
    
    setFormData({...formData, internalSections: newItems});

    if (mediaUrl && (type === 'image' || type === 'video' || type === 'file')) {
      try {
        await api.post('/delete-file', { url: mediaUrl });
      } catch(err) {
        console.error('Failed to permanently purge physical file:', err);
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Custom Sections</h1>
        <button onClick={() => handleOpenModal()} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-[0_0_15px_rgba(147,51,234,0.3)]">
          <Plus size={18} /> Create New Section
        </button>
      </div>

      {loading ? <div className="text-slate-400">Loading...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sections.map(sec => (
            <div key={sec.id} className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl flex flex-col justify-between group">
              <div>
                <h4 className="text-xl font-bold text-white mb-2">{sec.title}</h4>
                <p className="text-sm text-slate-400 mb-4">{sec.internalSections?.length || 0} Internal Blocks</p>
              </div>
              <div className="flex gap-2 border-t border-slate-700 pt-4">
                <button onClick={() => handleOpenModal(sec)} className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center gap-2"><Edit size={14}/> Edit</button>
                <button onClick={() => handleDelete(sec.id)} className="px-3 py-1.5 text-sm bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg flex items-center gap-2"><Trash size={14}/> Delete</button>
              </div>
            </div>
          ))}
          {sections.length === 0 && <p className="text-slate-500 italic">No custom sections built yet.</p>}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Plus className="text-purple-500" />
              {editingSection ? 'Edit Section' : 'Add Custom Section'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                <label className="block text-sm font-medium text-slate-400 mb-1">Master Section Title</label>
                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-purple-500" placeholder="e.g. My Coding Journey" />
              </div>

              <div className="space-y-8">
                {formData.internalSections.map((block, idx) => (
                  <div key={idx} className="border border-slate-700 rounded-xl p-5 bg-slate-800/30 relative">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-slate-200">Internal Block #{idx + 1}</h3>
                      {formData.internalSections.length > 1 && (
                        <button type="button" onClick={() => removeInternalSection(idx)} className="text-red-400 hover:bg-red-400/10 p-1.5 rounded-lg"><Trash size={16} /></button>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Text / Paragraph</label>
                        <textarea value={block.text} onChange={e => updateInternalSection(idx, 'text', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-purple-500" rows={3} placeholder="Add descriptive text for this particular block..." />
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-700">
                          <h4 className="text-xs font-bold text-white mb-2 flex justify-between">Images <span>({block.images.length})</span></h4>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {block.images.map((img, i) => (
                              <div key={i} className="relative w-10 h-10 rounded bg-black">
                                <img src={img} className="w-full h-full object-cover rounded" />
                                <button type="button" onClick={() => handleRemoveMediaFromBlock(idx, 'image', i)} className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 z-30 shadow transition-colors"><Trash size={10} /></button>
                              </div>
                            ))}
                          </div>
                          <div className={`relative block text-center border border-dashed border-slate-600 rounded-lg p-2 text-xs hover:bg-slate-800 transition-colors cursor-pointer text-purple-400 ${uploading ? 'opacity-50' : ''}`}>
                            + Add Image
                            <input type="file" accept="image/*" onChange={e => handleFileUpload(e, 'image', idx)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" disabled={uploading}/>
                          </div>
                        </div>

                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-700">
                          <h4 className="text-xs font-bold text-white mb-2 flex justify-between">Videos <span>({block.videos.length})</span></h4>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {block.videos.map((vid, i) => (
                              <div key={i} className="relative w-10 h-10 rounded bg-black flex items-center justify-center">
                                <Video size={14} className="text-blue-400" />
                                <button type="button" onClick={() => handleRemoveMediaFromBlock(idx, 'video', i)} className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 z-30 shadow transition-colors"><Trash size={10} /></button>
                              </div>
                            ))}
                          </div>
                          <div className={`relative block text-center border border-dashed border-slate-600 rounded-lg p-2 text-xs hover:bg-slate-800 transition-colors cursor-pointer text-blue-400 ${uploading ? 'opacity-50' : ''}`}>
                            + Add Video
                            <input type="file" accept="video/*" onChange={e => handleFileUpload(e, 'video', idx)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" disabled={uploading}/>
                          </div>
                        </div>

                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-700">
                          <h4 className="text-xs font-bold text-white mb-2 flex justify-between">Files <span>({block.files.length})</span></h4>
                          <div className="flex flex-col gap-1 mb-2">
                            {block.files.map((file, i) => (
                              <div key={i} className="relative bg-slate-800 rounded p-1.5 flex justify-between items-center group">
                                <span className="text-[10px] text-cyan-400 truncate w-14">{file.name}</span>
                                <button type="button" onClick={() => handleRemoveMediaFromBlock(idx, 'file', i)} className="text-red-500 hover:text-red-400 transition-colors"><Trash size={10} /></button>
                              </div>
                            ))}
                          </div>
                          <div className={`relative block text-center border border-dashed border-slate-600 rounded-lg p-2 text-xs hover:bg-slate-800 transition-colors cursor-pointer text-cyan-400 ${uploading ? 'opacity-50' : ''}`}>
                            + Add File
                            <input type="file" accept=".pdf,.doc,.docx,.zip" onChange={e => handleFileUpload(e, 'file', idx)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" disabled={uploading}/>
                          </div>
                        </div>

                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-700">
                          <h4 className="text-xs font-bold text-white mb-2 flex justify-between">Links <span>({block.links.length})</span></h4>
                          <div className="flex flex-col gap-1 mb-2">
                            {block.links.map((link, i) => (
                              <div key={i} className="relative bg-slate-800 rounded p-1.5 flex justify-between items-center">
                                <span className="text-[10px] text-slate-300 truncate w-14">{link.title}</span>
                                <button type="button" onClick={() => handleRemoveMediaFromBlock(idx, 'link', i)} className="text-red-500 hover:text-red-400 transition-colors"><Trash size={10} /></button>
                              </div>
                            ))}
                          </div>
                          <button type="button" onClick={() => handleAddLink(idx)} className="w-full text-center border border-dashed border-slate-600 rounded-lg p-2 text-xs hover:bg-slate-800 transition-colors text-slate-400">+ Add Link</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <button type="button" onClick={addInternalSection} className="w-full border-2 border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 p-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
                  <Plus size={18} /> Add Another Internal Block
                </button>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-800 sticky bottom-0 bg-slate-900 pb-2">
                <button type="button" disabled={uploading} onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white px-4 py-2">Cancel</button>
                <button type="submit" disabled={uploading} className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">Save Section</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

const AdminGalleryConfig = () => {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');

  useEffect(() => {
    api.get('/gallery').then(res => {
      setGallery(res.data); setLoading(false);
    });
  }, []);

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData(); fd.append('file', file);
    try {
      const uploadRes = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data'}});
      const res = await api.post('/gallery', {
        title: title || 'Untitled Media',
        type: type,
        url: uploadRes.data.url
      });
      setGallery([...gallery, res.data]);
      setTitle(''); // Reset title input
    } catch(err) { console.error(err); alert('Upload failed'); }
    finally { setUploading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Do you want to delete?')) return;
    await api.delete(`/gallery/${id}`);
    setGallery(gallery.filter(item => item.id !== id));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Media Gallery</h1>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl mb-8">
        <h3 className="text-lg font-bold text-white mb-4">Upload New Media</h3>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-slate-400 mb-1">Optional Title/Caption</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500" placeholder="e.g. My Workspace UI" disabled={uploading} />
          </div>
          
          <div className="flex gap-4">
            <div className={`relative px-5 py-2.5 rounded-lg border border-purple-500/50 bg-purple-500/10 text-purple-400 font-medium overflow-hidden cursor-pointer hover:bg-purple-500/20 transition-all flex items-center gap-2 ${uploading ? 'opacity-50' : ''}`}>
              <ImageIcon size={18} /> Upload Image
              <input type="file" accept="image/*" onChange={e => handleFileUpload(e, 'image')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={uploading}/>
            </div>
            
            <div className={`relative px-5 py-2.5 rounded-lg border border-blue-500/50 bg-blue-500/10 text-blue-400 font-medium overflow-hidden cursor-pointer hover:bg-blue-500/20 transition-all flex items-center gap-2 ${uploading ? 'opacity-50' : ''}`}>
              <Video size={18} /> Upload Video
              <input type="file" accept="video/*" onChange={e => handleFileUpload(e, 'video')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={uploading}/>
            </div>
          </div>
        </div>
      </div>

      {loading ? <div className="text-slate-400">Loading gallery...</div> : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {gallery.map((item, index) => (
            <motion.div 
              key={item.id} 
              initial={{ opacity: 0, x: 50 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group bg-slate-800 rounded-xl overflow-hidden border border-slate-700 aspect-square"
            >
              {item.type === 'image' ? (
                <img src={item.url} alt={item.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
              ) : (
                <video src={item.url} className="w-full h-full object-cover" muted />
              )}
              
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                <span className="text-white font-semibold text-sm truncate">{item.title}</span>
                <span className="text-slate-400 text-xs uppercase absolute top-3 left-3">{item.type}</span>
                <button onClick={() => handleDelete(item.id)} className="absolute top-3 right-3 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-400 transition-colors shadow-lg">
                  <Trash size={14} />
                </button>
              </div>
            </motion.div>
          ))}
          {gallery.length === 0 && <p className="text-slate-500 italic col-span-full">No media uploaded yet.</p>}
        </div>
      )}
    </motion.div>
  );
};

const AdminDashboard = () => {
  return (
    <div className="flex min-h-screen bg-[#070B14] w-full max-w-[100vw] overflow-x-hidden">
      <AdminSidebar />
      <main className="flex-1 w-full px-4 py-20 md:p-12 h-screen overflow-y-auto transition-all duration-500 ease-in-out">
        <Routes>
          <Route path="/dashboard" element={<AdminProfileConfig />} />
          <Route path="/projects" element={<AdminProjectsConfig />} />
          <Route path="/skills" element={<AdminSkillsConfig />} />
          <Route path="/sections" element={<AdminSectionsConfig />} />
          <Route path="/gallery" element={<AdminGalleryConfig />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;
