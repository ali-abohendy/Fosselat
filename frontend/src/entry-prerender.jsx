import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppRoutes } from './App';
import { TEACHERS_DATA } from './data/teachersData';

export function render(url) {
  return renderToString(
    <AuthProvider>
      <StaticRouter location={url}>
        <div className="app">
          <AppRoutes />
        </div>
      </StaticRouter>
    </AuthProvider>
  );
}

export const PRERENDER_ROUTES = [
  {
    path: '/',
    title: "Fosselat Academy — Learn Qur'an, Arabic & Islamic Studies Online",
    description:
      "Learn to read and recite the Qur'an online 1-on-1 in clear English for adults & kids. Al-Azhar and Ijazah-certified teachers, free 30-min trial, and 30-day money-back guarantee.",
  },
  {
    path: '/learn-quran-from-zero',
    title: "Learn to Read the Qur'an from Zero Online (1-on-1 in English) — Fosselat Academy",
    description:
      "Start from absolute zero with 1-on-1 online Qur'an classes taught in clear English for adults and kids. Noorani Qaida foundation, free 30-minute trial, and 30-day money-back guarantee.",
  },
  {
    path: '/pricing',
    title: 'Pricing & Monthly Plans — Fosselat Academy',
    description:
      "Transparent 1-on-1 monthly plans starting from $32/month with up to 10% multi-class savings. Pay securely with PayPal or Credit/Debit Card (no PayPal account needed).",
  },
  {
    path: '/teachers',
    title: 'Our Qualified Teachers — Fosselat Academy',
    description:
      "Meet Fosselat Academy's vetted teachers — Al-Azhar graduates and Ijazah-certified Qur'an & Tajweed scholars fluent in English and Arabic.",
  },
  {
    path: '/curriculum',
    title: 'Curriculum & Noorani Qaida Roadmap — Fosselat Academy',
    description:
      "Explore our structured Qur'an, Noorani Qaida, Tajweed, Arabic, and Islamic Studies curriculum from complete beginner to fluent recitation. Download the 42-page syllabus PDF.",
  },
  {
    path: '/placement-tests',
    title: 'Free Adaptive Placement Test — Fosselat Academy',
    description:
      "100% free 3–5 minute placement assessment with no account required. Discover your exact starting level in Qur'an, Arabic, or Islamic Studies.",
  },
  {
    path: '/about',
    title: 'About Us — Fosselat Academy',
    description:
      "Learn how Fosselat Academy delivers live 1-on-1 Qur'an, Arabic, and Islamic Studies classes in clear English across all global time zones.",
  },
  {
    path: '/contact',
    title: 'Contact Us — Fosselat Academy',
    description:
      'Contact Fosselat Academy directly on WhatsApp (+966 59 579 6177) or by email to book your free 30-minute trial class.',
  },
  {
    path: '/terms',
    title: 'Terms & Conditions — Fosselat Academy',
    description: 'Terms and Conditions for enrolling in 1-on-1 online classes at Fosselat Academy.',
  },
  {
    path: '/privacy-policy',
    title: 'Privacy Policy — Fosselat Academy',
    description: "How Fosselat Academy protects your family's personal and payment information.",
  },
  {
    path: '/refund-policy',
    title: '30-Day Money-Back Guarantee & Refund Policy — Fosselat Academy',
    description: 'Full refund within 30 calendar days if you are not satisfied with your Fosselat Academy classes.',
  },
  {
    path: '/thank-you',
    title: 'Thank You for Enrolling — Fosselat Academy',
    description: 'Your Fosselat Academy enrollment payment confirmation and next steps.',
  },
  ...TEACHERS_DATA.map((t) => ({
    path: `/teachers/${t._id}`,
    title: `${t.name} — Fosselat Academy`,
    description: t.shortBio,
  })),
];
