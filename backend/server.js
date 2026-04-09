import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = process.env.FRONTEND_URL ? [process.env.FRONTEND_URL, 'http://localhost:5173'] : '*';
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Serve the /uploads folder publicly (for local fallback)
app.use('/uploads', express.static('uploads'));

// Cloudinary config
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// Storage Strategy (Hybrid)
let storage;
if (process.env.CLOUDINARY_CLOUD_NAME) {
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'portfolio_uploads',
      allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'mp4', 'webm', 'pdf']
    }
  });
} else {
  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });
}
const upload = multer({ storage: storage });

// --- MongoDB Configuration ---
const schemaOptions = {
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
};

const projectSchema = new mongoose.Schema({
  title: String, tech: [String], desc: String, link: String, images: [String], videos: [String]
}, schemaOptions);

const skillSchema = new mongoose.Schema({
  name: String, category: String, proficiency: Number
}, schemaOptions);

const sectionSchema = new mongoose.Schema({
  title: String,
  internalSections: [{
    text: String,
    images: [String],
    videos: [String],
    files: [{ name: String, url: String }],
    links: [{ title: String, url: String }]
  }]
}, schemaOptions);

const gallerySchema = new mongoose.Schema({
  title: String, type: String, url: String
}, schemaOptions);

const profileSchema = new mongoose.Schema({
  name: String,
  profilePhoto: String,
  about: String, yearsExperience: String, totalProjects: String, certificates: String, resumeLink: String,
  email: String, location: String, whatsapp: String, facebook: String, instagram: String, linkedin: String, github: String, youtube: String
}, schemaOptions);

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, schemaOptions);

const Project = mongoose.model('Project', projectSchema);
const Skill = mongoose.model('Skill', skillSchema);
const Section = mongoose.model('Section', sectionSchema);
const Gallery = mongoose.model('Gallery', gallerySchema);
const Profile = mongoose.model('Profile', profileSchema);
const User = mongoose.model('User', userSchema);

mongoose.connect(process.env.MONGO_URI, { 
  dbName: 'portfolioCMS',
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
})
  .then(async () => {
    console.log('MongoDB successfully connected!');
    const p = await Profile.findOne();
    if (!p) {
      await Profile.create({
        name: "Lamb Joseph",
        profilePhoto: "",
        about: "Explore my professional background. This view provides a structured, read-only experience of my skills, projects, and achievements.",
        yearsExperience: "4+", totalProjects: "20+", certificates: "12", resumeLink: "", email: "contact@example.com", location: "Remote / Open to Relocation", whatsapp: "+91 9876543210", facebook: "", instagram: "", linkedin: "https://linkedin.com", github: "https://github.com", youtube: ""
      });
    }

    // Seed Admin User
    const adminUser = await User.findOne();
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({ email: 'admin@portfolio.com', password: hashedPassword });
    }
  })
  .catch(err => console.error('MongoDB initial connection error:', err));

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected. Waiting for internet to return...');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected dynamically!');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB runtime error:', err);
});


// --- Core Routes ---
app.get('/api/health', (req, res) => res.json({ status: 'success', message: 'Backend is active.' }));

// --- Authentication Endpoints ---
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-123';

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id, role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, user: { id: user.id, email: user.email, role: 'admin' } });
});

app.post('/api/auth/update', async (req, res) => {
  const { newEmail, newPassword } = req.body;
  let user = await User.findOne();
  if (!user) return res.status(404).json({ message: 'User not found' });
  
  if (newEmail) user.email = newEmail;
  if (newPassword) {
    user.password = await bcrypt.hash(newPassword, 10);
  }
  await user.save();
  res.json({ message: 'Credentials updated successfully' });
});

app.post('/api/auth/forgot-password', async (req, res) => {
  const { email, newPassword } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'Email not found in system' });
  
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({ message: 'Password reset successful. Please login.' });
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const fileUrl = process.env.CLOUDINARY_CLOUD_NAME 
    ? req.file.path // Cloudinary URL
    : `http://localhost:${PORT}/uploads/${req.file.filename}`; // Local URL fallback
  res.status(200).json({ url: fileUrl });
});

app.post('/api/delete-file', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ message: 'No URL provided' });

  // Cloudinary Deletion
  if (process.env.CLOUDINARY_CLOUD_NAME && url.includes('cloudinary.com')) {
    try {
      const urlParts = url.split('/');
      const filenameWithExtension = urlParts[urlParts.length - 1];
      const publicId = `portfolio_uploads/${filenameWithExtension.split('.')[0]}`;
      await cloudinary.uploader.destroy(publicId);
      return res.json({ message: 'File securely purged from Cloudinary' });
    } catch (err) {
      return res.status(500).json({ message: 'Failed to purge file from Cloudinary' });
    }
  }

  // Local Physical Deletion
  try {
    const filename = url.split('/uploads/')[1];
    if (filename) {
      const filepath = path.join(process.cwd(), 'uploads', filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        return res.json({ message: 'File securely purged from hard drive' });
      }
    }
    return res.status(404).json({ message: 'File not matched on disk' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to purge file execution' });
  }
});

// --- Dynamic Portfolio Content API (Mongoose Wrapper) ---

// Projects
app.get('/api/projects', async (req, res) => res.json(await Project.find()));
app.post('/api/projects', async (req, res) => res.status(201).json(await Project.create(req.body)));
app.put('/api/projects/:id', async (req, res) => {
  const p = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
  p ? res.json(p) : res.status(404).json({ message: 'Not found' });
});
app.delete('/api/projects/:id', async (req, res) => {
  const p = await Project.findByIdAndDelete(req.params.id);
  p ? res.json({ message: 'Deleted' }) : res.status(404).json({ message: 'Not found' });
});

// Profile
app.get('/api/profile', async (req, res) => res.json(await Profile.findOne()));
app.put('/api/profile', async (req, res) => {
  let p = await Profile.findOne();
  if(!p) p = new Profile(req.body);
  else Object.assign(p, req.body);
  await p.save();
  res.json(p);
});

// Skills
app.get('/api/skills', async (req, res) => res.json(await Skill.find()));
app.post('/api/skills', async (req, res) => res.status(201).json(await Skill.create(req.body)));
app.put('/api/skills/:id', async (req, res) => {
  const s = await Skill.findByIdAndUpdate(req.params.id, req.body, { new: true });
  s ? res.json(s) : res.status(404).json({ message: 'Not found' });
});
app.delete('/api/skills/:id', async (req, res) => {
  const s = await Skill.findByIdAndDelete(req.params.id);
  s ? res.json({ message: 'Deleted' }) : res.status(404).json({ message: 'Not found' });
});

// Custom Sections
app.get('/api/sections', async (req, res) => res.json(await Section.find()));
app.post('/api/sections', async (req, res) => res.status(201).json(await Section.create(req.body)));
app.put('/api/sections/:id', async (req, res) => {
  const s = await Section.findByIdAndUpdate(req.params.id, req.body, { new: true });
  s ? res.json(s) : res.status(404).json({ message: 'Not found' });
});
app.delete('/api/sections/:id', async (req, res) => {
  const s = await Section.findByIdAndDelete(req.params.id);
  s ? res.json({ message: 'Deleted' }) : res.status(404).json({ message: 'Not found' });
});

// Gallery
app.get('/api/gallery', async (req, res) => res.json(await Gallery.find()));
app.post('/api/gallery', async (req, res) => res.status(201).json(await Gallery.create(req.body)));
app.delete('/api/gallery/:id', async (req, res) => {
  const g = await Gallery.findByIdAndDelete(req.params.id);
  g ? res.json({ message: 'Deleted' }) : res.status(404).json({ message: 'Not found' });
});

app.listen(PORT, () => console.log(`Enterprise Portfolio Server running on port ${PORT}`));
