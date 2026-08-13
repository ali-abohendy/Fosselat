import API from '../config.js';

// Helper to get auth header
function getAuthHeaders() {
  const token = localStorage.getItem('fossclat_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Generic fetch wrapper
async function request(endpoint, options = {}) {
  const { method = 'GET', body, auth = false } = options;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(auth ? getAuthHeaders() : {}),
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    // If backend is not running, return fallback data
    if (error.message === 'Failed to fetch') {
      console.warn('Backend not available, using fallback data');
      return null;
    }
    throw error;
  }
}

// ========== AUTH ==========
export const authAPI = {
  register: (userData) => request('/auth/register', { method: 'POST', body: userData }),
  login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
  getMe: () => request('/auth/me', { auth: true }),
};

// ========== COURSES ==========
export const coursesAPI = {
  getAll: () => request('/courses'),
  getPopular: () => request('/courses/popular'),
  getById: (id) => request(`/courses/${id}`),
};

// ========== TEACHERS ==========
export const teachersAPI = {
  getAll: () => request('/teachers'),
  getById: (id) => request(`/teachers/${id}`),
};

// ========== ENROLLMENTS ==========
export const enrollmentsAPI = {
  create: (data) => request('/enrollments', { method: 'POST', body: data }),
  getMy: () => request('/enrollments/my', { auth: true }),
};

// ========== CONTACT ==========
export const contactAPI = {
  submit: (data) => request('/contact', { method: 'POST', body: data }),
};

// ========== FALLBACK DATA ==========
// Used when backend is not running
export const fallbackData = {
  courses: [
    {
      _id: '1',
      title: 'Noorani Qaida',
      slug: 'noorani-qaida',
      description: 'Start your journey with Noorani Qaida. This comprehensive beginner course covers the Arabic alphabet, basic pronunciation rules, and foundational reading skills. Perfect for those who are just beginning their Qur\'an learning journey.',
      short_description: 'For Beginners. Start your journey with Noorani Qaida.',
      icon: 'noorani-qaida',
      level: 'Beginner',
      subjects: ['Arabic Alphabet', 'Basic Pronunciation', 'Reading Fundamentals', 'Letter Recognition'],
      teacher_id: '1',
      is_popular: true,
    },
    {
      _id: '2',
      title: 'Tajweed Rules',
      slug: 'tajweed-rules',
      description: 'Master the art of Qur\'an recitation with proper Tajweed rules. Learn the correct pronunciation, articulation points (Makharij), and characteristics (Sifaat) of Arabic letters. This course covers Noon Sakinah, Meem Sakinah, Madd rules, and more.',
      short_description: 'Learn Tajweed the right way.',
      icon: 'tajweed-rules',
      level: 'Intermediate',
      subjects: ['Tajweed Rules', 'Makharij Al-Huruf', 'Sifaat Al-Huruf', 'Noon Sakinah', 'Meem Sakinah', 'Madd Rules'],
      teacher_id: '1',
      is_popular: true,
    },
    {
      _id: '3',
      title: 'Hifz Program',
      slug: 'hifz-program',
      description: 'Memorize the Qur\'an step by step with our structured Hifz program. Our experienced teachers will guide you through a proven methodology for memorization, revision, and retention of the Holy Qur\'an.',
      short_description: 'Memorize Qur\'an step by step.',
      icon: 'hifz-program',
      level: 'Advanced',
      subjects: ['Memorization Techniques', 'Daily Revision', 'Retention Methods', 'Progress Tracking'],
      teacher_id: '3',
      is_popular: true,
    },
    {
      _id: '4',
      title: 'Qur\'an Recitation',
      slug: 'quran-recitation',
      description: 'Improve your Qur\'an recitation with proper rhythm and melody. Learn various recitation styles and perfect your tilawah under the guidance of expert reciters.',
      short_description: 'Perfect your Qur\'an recitation skills.',
      icon: 'quran-recitation',
      level: 'Intermediate',
      subjects: ['Recitation Styles', 'Voice Training', 'Rhythm & Melody', 'Practice Sessions'],
      teacher_id: '2',
      is_popular: false,
    },
    {
      _id: '5',
      title: 'Arabic Language Basics',
      slug: 'arabic-language',
      description: 'Learn the fundamentals of Arabic language to better understand the Qur\'an. Covers basic grammar, vocabulary, and sentence structure.',
      short_description: 'Understand Arabic for Qur\'an comprehension.',
      icon: 'arabic-language',
      level: 'Beginner',
      subjects: ['Arabic Grammar', 'Vocabulary', 'Sentence Structure', 'Reading Practice'],
      teacher_id: '2',
      is_popular: false,
    },
    {
      _id: '6',
      title: 'Islamic Studies',
      slug: 'islamic-studies',
      description: 'Comprehensive Islamic Studies course covering Fiqh, Seerah, and Islamic history. Gain a deeper understanding of Islamic principles and teachings.',
      short_description: 'Learn Islamic principles and history.',
      icon: 'islamic-studies',
      level: 'All Levels',
      subjects: ['Fiqh Basics', 'Seerah', 'Islamic History', 'Islamic Ethics'],
      teacher_id: '3',
      is_popular: false,
    },
  ],
  teachers: [
    {
      _id: '1',
      name: 'Ustadh Ahmed',
      title: 'Tajweed Expert',
      bio: 'I have 8+ years of experience teaching Qur\'an with authentic teaching and modern methods. Specializing in Tajweed rules and Qur\'an recitation, I have helped hundreds of students master the art of proper Qur\'an reading.',
      experience_years: 8,
      specializations: ['Tajweed', 'Qur\'an Recitation', 'Noorani Qaida'],
    },
    {
      _id: '2',
      name: 'Ustadh Omar',
      title: 'Qur\'an Recitation Specialist',
      bio: 'With over 10 years of experience in Qur\'an recitation and Arabic language, I am passionate about helping students develop beautiful and accurate tilawah. My teaching approach combines traditional methods with modern techniques.',
      experience_years: 10,
      specializations: ['Qur\'an Recitation', 'Arabic Language', 'Voice Training'],
    },
    {
      _id: '3',
      name: 'Ustadh Bilal',
      title: 'Hifz Specialist',
      bio: 'Dedicated to helping students memorize the Holy Qur\'an, I have guided many students through the complete Hifz journey over the past 6 years. My structured approach ensures strong retention and regular revision.',
      experience_years: 6,
      specializations: ['Hifz', 'Memorization Techniques', 'Islamic Studies'],
    },
  ],
};
