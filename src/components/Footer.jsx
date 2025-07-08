import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Music } from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';

const Footer = () => {
  const { settings } = useSiteSettings();

  return (
    <footer className="bg-secondary-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              {settings.logo && (
                <img
                  src={settings.logo}
                  alt={settings.siteName}
                  className="h-8 w-auto"
                />
              )}
              <span className="text-2xl font-bold">{settings.siteName || 'Gifted Solutions'}</span>
            </div>
            <p className="text-secondary-300 text-sm">
              {settings.footerDescription || 'Your premier destination for electronic components, Arduino projects, and electronics consultation. Helping students and professionals build amazing projects.'}
            </p>
            {settings.showSocialLinks && (
              <div className="flex space-x-4">
                {settings.socialLinks?.facebook && (
                  <a
                    href={`https://www.facebook.com/${settings.socialLinks.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary-400 hover:text-primary-500 transition-colors"
                    aria-label="Follow us on Facebook"
                  >
                    <Facebook size={20} />
                  </a>
                )}
                {settings.socialLinks?.twitter && (
                  <a
                    href={`https://x.com/${settings.socialLinks.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary-400 hover:text-primary-500 transition-colors"
                    aria-label="Follow us on X (Twitter)"
                  >
                    <Twitter size={20} />
                  </a>
                )}
                {settings.socialLinks?.tiktok && (
                  <a
                    href={`https://www.tiktok.com/@${settings.socialLinks.tiktok}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary-400 hover:text-primary-500 transition-colors"
                    aria-label="Follow us on TikTok"
                  >
                    <Music size={20} />
                  </a>
                )}
                {settings.socialLinks?.linkedin && (
                  <a
                    href={`https://www.linkedin.com/company/${settings.socialLinks.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary-400 hover:text-primary-500 transition-colors"
                    aria-label="Connect with us on LinkedIn"
                  >
                    <Linkedin size={20} />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-secondary-300 hover:text-primary-500 transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-secondary-300 hover:text-primary-500 transition-colors text-sm">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-secondary-300 hover:text-primary-500 transition-colors text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/custom-request" className="text-secondary-300 hover:text-primary-500 transition-colors text-sm">
                  Project Consultation
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/shop/Microcontrollers" className="text-secondary-300 hover:text-primary-500 transition-colors text-sm">
                  Microcontrollers
                </Link>
              </li>
              <li>
                <Link to="/shop/WiFi Modules" className="text-secondary-300 hover:text-primary-500 transition-colors text-sm">
                  WiFi Modules
                </Link>
              </li>
              <li>
                <Link to="/shop/Sensors" className="text-secondary-300 hover:text-primary-500 transition-colors text-sm">
                  Sensors
                </Link>
              </li>
              <li>
                <Link to="/shop/Displays" className="text-secondary-300 hover:text-primary-500 transition-colors text-sm">
                  Displays
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Payment Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact & Payment</h3>
            <div className="space-y-3">
              {settings.email && (
                <div className="flex items-center space-x-3">
                  <Mail size={16} className="text-primary-500" />
                  <span className="text-secondary-300 text-sm">{settings.email}</span>
                </div>
              )}
              <div className="flex items-center space-x-3">
                <Phone size={16} className="text-primary-500" />
                <span className="text-secondary-300 text-sm">
                  {settings.phone1 || '0779421717'} | {settings.phone2 || '0961288156'}
                </span>
              </div>
              {settings.address && (
                <div className="flex items-center space-x-3">
                  <MapPin size={16} className="text-primary-500" />
                  <span className="text-secondary-300 text-sm">{settings.address}</span>
                </div>
              )}
              {settings.whatsappNumber && (
                <a
                  href={`https://wa.me/${settings.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 text-green-400 hover:text-green-300 transition-colors"
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.787"/>
                  </svg>
                  <span className="text-sm">WhatsApp: {settings.phone1 || '0779421717'}</span>
                </a>
              )}
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-white mb-2">Payment Methods:</h4>
                <div className="text-secondary-300 text-sm space-y-1">
                  <div>• Airtel Money</div>
                  <div>• MTN Money</div>
                  <div>• Bank Transfer</div>
                  <div>• Cash</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-secondary-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-secondary-400 text-sm">
              © 2024 Gifted Solutions. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy-policy" className="text-secondary-400 hover:text-primary-500 transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link to="/data-deletion" className="text-secondary-400 hover:text-primary-500 transition-colors text-sm">
                Data Deletion
              </Link>
              <Link to="/contact" className="text-secondary-400 hover:text-primary-500 transition-colors text-sm">
                Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
