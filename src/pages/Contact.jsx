import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Music
} from 'lucide-react';

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Create WhatsApp message with form data
      const contactMessage = `
📞 CONTACT FORM SUBMISSION

👤 CONTACT DETAILS:
Name: ${data.name}
Email: ${data.email}
${data.phone ? `Phone: ${data.phone}` : ''}

📋 SUBJECT: ${data.subject}

💬 MESSAGE:
${data.message}

Please respond to this inquiry. Thank you!
      `.trim();

      const whatsappUrl = `https://wa.me/260961288156?text=${encodeURIComponent(contactMessage)}`;
      window.open(whatsappUrl, '_blank');

      setSubmitStatus('success');
      reset();
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus(null), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-black via-gray-900 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Get in <span className="text-primary-400">Touch</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Have questions about our electronics components or need project consultation?
              We're here to help you build amazing projects!
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-black mb-6">Contact Information</h2>

              <div className="space-y-6">
                {/* Phone */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="text-primary-500" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-black mb-1">Phone Numbers</h3>
                    <p className="text-gray-600">0961288156</p>
                    <p className="text-gray-600">0779421717</p>
                    <p className="text-sm text-primary-500 mt-1">WhatsApp available</p>
                    <a
                      href="https://wa.me/260961288156"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-green-600 hover:text-green-700 text-sm mt-2"
                    >
                      <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.787"/>
                      </svg>
                      Chat on WhatsApp
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="text-primary-500" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-black mb-1">Email</h3>
                    <p className="text-gray-600">giftedsolutions20@gmail.com</p>
                    <p className="text-sm text-gray-500 mt-1">We reply within 24 hours</p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="text-primary-500" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-black mb-1">Location</h3>
                    <p className="text-gray-600">Lusaka, Chalala near ICU</p>
                    <p className="text-sm text-gray-500 mt-1">Zambia</p>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="text-primary-500" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-black mb-1">Business Hours</h3>
                    <div className="text-gray-600 space-y-1">
                      <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                      <p>Saturday: 9:00 AM - 4:00 PM</p>
                      <p>Sunday: Closed</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="font-semibold text-black mb-4">Follow Us</h3>
                <div className="flex space-x-4">
                  <a
                    href="https://www.facebook.com/bupelifestyle?mibextid=ZbWKwL"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center hover:bg-primary-500 hover:text-white transition-colors"
                    aria-label="Follow us on Facebook"
                  >
                    <Facebook size={20} />
                  </a>
                  <a
                    href="https://x.com/giftedsolutionz?t=y9lbNX_xt2CnQHgWSAbnfw&s=09"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center hover:bg-primary-500 hover:text-white transition-colors"
                    aria-label="Follow us on X (Twitter)"
                  >
                    <Twitter size={20} />
                  </a>
                  <a
                    href="https://www.facebook.com/bupelifestyle?mibextid=ZbWKwL"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center hover:bg-primary-500 hover:text-white transition-colors"
                    aria-label="Follow us on TikTok"
                  >
                    <Music size={20} />
                  </a>
                  <a
                    href="https://www.linkedin.com/company/gifted-solutions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center hover:bg-primary-500 hover:text-white transition-colors"
                    aria-label="Connect with us on LinkedIn"
                  >
                    <Linkedin size={20} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <MessageCircle className="text-primary-500 mr-3" size={28} />
                <h2 className="text-2xl font-bold text-black">Send us a Message</h2>
              </div>

              {submitStatus && (
                <div className={`mb-6 p-4 rounded-lg flex items-center ${
                  submitStatus === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {submitStatus === 'success' ? (
                    <CheckCircle className="mr-2" size={20} />
                  ) : (
                    <AlertCircle className="mr-2" size={20} />
                  )}
                  {submitStatus === 'success'
                    ? 'Message sent successfully! We\'ll get back to you soon.'
                    : 'Failed to send message. Please try again or contact us directly.'
                  }
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      {...register('name', { required: 'Name is required' })}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Your full name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="your.email@example.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      {...register('phone')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="0961288156"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      {...register('subject', { required: 'Subject is required' })}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        errors.subject ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select a subject</option>
                      <option value="product-inquiry">Product Inquiry</option>
                      <option value="project-consultation">Project Consultation</option>
                      <option value="custom-order">Custom Order</option>
                      <option value="technical-support">Technical Support</option>
                      <option value="partnership">Partnership</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.subject && (
                      <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                    )}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    {...register('message', { required: 'Message is required' })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.message ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Tell us about your project or inquiry..."
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Opening WhatsApp...
                    </>
                  ) : (
                    <>
                      <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.787"/>
                      </svg>
                      Send via WhatsApp
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Payment Methods Section */}
        <div className="mt-16">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <CreditCard className="mx-auto text-primary-500 mb-4" size={48} />
              <h2 className="text-2xl font-bold text-black mb-2">Payment Methods</h2>
              <p className="text-gray-600">We accept multiple payment options for your convenience</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-6 border border-gray-200 rounded-lg hover:border-primary-200 transition-colors">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="text-green-600" size={32} />
                </div>
                <h3 className="font-semibold text-black mb-2">Airtel Money</h3>
                <p className="text-gray-600 text-sm">Quick and secure mobile payments</p>
              </div>

              <div className="text-center p-6 border border-gray-200 rounded-lg hover:border-primary-200 transition-colors">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="text-yellow-600" size={32} />
                </div>
                <h3 className="font-semibold text-black mb-2">MTN Money</h3>
                <p className="text-gray-600 text-sm">Convenient mobile money transfers</p>
              </div>

              <div className="text-center p-6 border border-gray-200 rounded-lg hover:border-primary-200 transition-colors">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="text-blue-600" size={32} />
                </div>
                <h3 className="font-semibold text-black mb-2">Bank Transfer</h3>
                <p className="text-gray-600 text-sm">Direct bank account transfers</p>
              </div>

              <div className="text-center p-6 border border-gray-200 rounded-lg hover:border-primary-200 transition-colors">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-gray-600 font-bold text-lg">K</span>
                </div>
                <h3 className="font-semibold text-black mb-2">Cash</h3>
                <p className="text-gray-600 text-sm">Cash on delivery or pickup</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Contact Cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-8 text-white">
            <h3 className="text-xl font-bold mb-4">Need Immediate Help?</h3>
            <p className="mb-6">Call or WhatsApp us directly for urgent inquiries or technical support.</p>
            <a
              href="tel:0961288156"
              className="inline-flex items-center bg-white text-primary-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Phone className="mr-2" size={20} />
              Call Now: 0961288156
            </a>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-black rounded-xl p-8 text-white">
            <h3 className="text-xl font-bold mb-4">Project Consultation</h3>
            <p className="mb-6">Get expert help with your EC3 or final year electronics projects.</p>
            <a
              href="mailto:giftedsolutions20@gmail.com"
              className="inline-flex items-center bg-white text-gray-800 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Mail className="mr-2" size={20} />
              Email Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
