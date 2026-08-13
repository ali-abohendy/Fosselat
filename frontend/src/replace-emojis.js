const fs = require('fs');

const p = 'd:/Foselat/frontend/src/pages/Curriculum.jsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(/import '\.\/Curriculum\.css';/g, "import './Curriculum.css';\nimport { BookOpen, Headphones, Star, Scroll, Globe, Heart, Scale, Leaf, MapPin, Users, Calendar, Clock, Trophy, ClipboardList, GraduationCap, ArrowRight, CheckCircle, FileText, BarChart } from '../components/Icons';");

c = c.replace(/icon: '📜'/g, "icon: <Scroll />");
c = c.replace(/icon: '📕'/g, "icon: <BookOpen />");
c = c.replace(/icon: '🕌'/g, "icon: <Globe />");
c = c.replace(/icon: '🤲'/g, "icon: <Heart />");
c = c.replace(/icon: '⚖️'/g, "icon: <Scale />");
c = c.replace(/icon: '🌿'/g, "icon: <Leaf />");

c = c.replace(/span>🎯/g, "span><MapPin size={16} /> ");
c = c.replace(/span>🏅/g, "span><Trophy size={16} /> ");

c = c.replace(/span>👤/g, "span><Users size={16} /> ");
c = c.replace(/span>📅/g, "span><Calendar size={16} /> ");
c = c.replace(/span>📚/g, "span><BookOpen size={16} /> ");
c = c.replace(/span>⏱/g, "span><Clock size={16} /> ");

c = c.replace(/h5>📖/g, "h5><BookOpen size={18} /> ");
c = c.replace(/h5>🛠/g, "h5><ClipboardList size={18} /> ");
c = c.replace(/h5 style={{ marginTop: '16px' }}>📝/g, "h5 style={{ marginTop: '16px' }}><FileText size={18} /> ");
c = c.replace(/h5 style={{ marginTop: '16px' }}>🎓/g, "h5 style={{ marginTop: '16px' }}><GraduationCap size={18} /> ");

c = c.replace(/span className="cur-principle-icon">✦/g, 'span className="cur-principle-icon"><Star size={24} />');
c = c.replace(/span className="check-gold">✓/g, 'span className="check-gold"><CheckCircle size={14} />');

c = c.replace(/label: '📖 Quran Track'/g, "label: <span style={{display:'flex', alignItems:'center', gap:'8px'}}><BookOpen size={18} /> Quran Track</span>");
c = c.replace(/label: '🗣 Arabic Track'/g, "label: <span style={{display:'flex', alignItems:'center', gap:'8px'}}><Headphones size={18} /> Arabic Track</span>");
c = c.replace(/label: '☪️ Islamic Studies'/g, "label: <span style={{display:'flex', alignItems:'center', gap:'8px'}}><Star size={18} /> Islamic Studies</span>");

c = c.replace(/div className="cur-cert-icon">📋/g, 'div className="cur-cert-icon"><ClipboardList size={32} />');
c = c.replace(/div className="cur-cert-icon">🎓/g, 'div className="cur-cert-icon"><GraduationCap size={32} />');
c = c.replace(/div className="cur-cert-icon">📜/g, 'div className="cur-cert-icon"><Scroll size={32} />');
c = c.replace(/div className="cur-cert-icon">📊/g, 'div className="cur-cert-icon"><BarChart size={32} />');

c = c.replace(/⬇ Download/g, "<FileText size={18} style={{marginRight: '8px'}} /> Download");
c = c.replace(/className="cur-structure-arrow">→/g, 'className="cur-structure-arrow"><ArrowRight size={24} />');
c = c.replace(/className="cur-roadmap-arrow">→/g, 'className="cur-roadmap-arrow"><ArrowRight size={14} />');

fs.writeFileSync(p, c, 'utf8');
console.log('done');
