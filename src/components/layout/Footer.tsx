import Link from 'next/link';
import { Mail, Linkedin, Twitter } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';
import NewsletterForm from '@/components/shared/NewsletterForm';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand & Copyright */}
          <div>
            <Link href="/" className="text-xl font-bold text-gray-900">
              {SITE_CONFIG.name}
            </Link>
            <p className="mt-2 text-gray-600 text-sm">
              Thoughts, stories, and artwork.
            </p>
            <p className="mt-4 text-gray-500 text-sm">
              © {currentYear} {SITE_CONFIG.author}. All rights reserved.
            </p>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Connect</h3>
            <div className="flex space-x-4">
              {SITE_CONFIG.social.twitter && (
                <a
                  href={SITE_CONFIG.social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter size={20} />
                </a>
              )}
              {SITE_CONFIG.social.linkedin && (
                <a
                  href={SITE_CONFIG.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={20} />
                </a>
              )}
              {SITE_CONFIG.social.email && (
                <a
                  href={`mailto:${SITE_CONFIG.social.email}`}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                  aria-label="Email"
                >
                  <Mail size={20} />
                </a>
              )}
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Newsletter</h3>
            <p className="text-gray-600 text-sm mb-4">
              Subscribe to get updates on new posts and artwork.
            </p>
            <NewsletterForm compact />
          </div>
        </div>
      </div>
    </footer>
  );
}
