const fs = require('fs');

const files = [
  'C:/Users/lambj/OneDrive/Desktop/anti/portfolio/frontend/src/pages/AdminDashboard.jsx',
  'C:/Users/lambj/OneDrive/Desktop/anti/portfolio/frontend/src/pages/RecruiterDashboard.jsx'
];

const replacements = [
  { search: /bg-\[\#070B14\]/g, replace: 'bg-slate-100 dark:bg-[#070B14]' },
  { search: /(?<!dark:)bg-slate-900/g, replace: 'bg-white dark:bg-slate-900' },
  { search: /(?<!dark:)bg-slate-800/g, replace: 'bg-slate-50 dark:bg-slate-800' },
  { search: /(?<!dark:)text-white/g, replace: 'text-slate-900 dark:text-white' },
  { search: /(?<!dark:)text-slate-400/g, replace: 'text-slate-500 dark:text-slate-400' },
  { search: /(?<!dark:)text-slate-300/g, replace: 'text-slate-700 dark:text-slate-300' },
  { search: /(?<!dark:)text-slate-200/g, replace: 'text-slate-800 dark:text-slate-200' },
  { search: /(?<!dark:)border-slate-800/g, replace: 'border-slate-200 dark:border-slate-800' },
  { search: /(?<!dark:)border-slate-700/g, replace: 'border-slate-300 dark:border-slate-700' },
  { search: /(?<!dark:)border-white\/10/g, replace: 'border-slate-300 dark:border-white/10' },
  { search: /(?<!dark:)border-white\/5/g, replace: 'border-slate-200 dark:border-white/5' },
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    replacements.forEach(r => {
      content = content.replace(r.search, r.replace);
    });
    fs.writeFileSync(file, content);
    console.log('Processed', file);
  } else {
    console.log('File not found:', file);
  }
});
