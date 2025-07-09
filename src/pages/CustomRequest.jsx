import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  Upload,
  FileText,
  User,
  Mail,
  Phone,
  MessageSquare,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Cpu,
  Zap,
  Settings,
  ArrowRight
} from 'lucide-react';

const CustomRequest = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // Personal Information
    name: '',
    email: '',
    phone: '',
    company: '',

    // Project Details
    projectTitle: '',
    projectType: '',
    description: '',
    requirements: '',
    budget: '',
    timeline: '',
    priority: 'medium',

    // Technical Specifications
    components: '',
    specifications: '',

    // Additional Information
    inspiration: '',
    additionalNotes: '',

    // Contact Preferences
    preferredContact: 'email',
    contactTime: 'anytime'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errors, setErrors] = useState({});

  const projectTypes = [
    { value: 'arduino', label: 'Arduino Project', icon: Cpu },
    { value: 'iot', label: 'IoT Solution', icon: Zap },
    { value: 'automation', label: 'Home Automation', icon: Settings },
    { value: 'robotics', label: 'Robotics Project', icon: Settings },
    { value: 'sensor', label: 'Sensor Integration', icon: Cpu },
    { value: 'custom', label: 'Custom Electronics', icon: Lightbulb },
    { value: 'consultation', label: 'Technical Consultation', icon: MessageSquare },
    { value: 'other', label: 'Other', icon: FileText }
  ];

  const budgetRanges = [
    'Under K 50,000',
    'K 50,000 - K 100,000',
    'K 100,000 - K 250,000',
    'K 250,000 - K 500,000',
    'K 500,000 - K 1,000,000',
    'Over K 1,000,000',
    'To be discussed'
  ];

  const timelineOptions = [
    'ASAP (Rush job)',
    '1-2 weeks',
    '2-4 weeks',
    '1-2 months',
    '2-3 months',
    '3-6 months',
    'Flexible timeline'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.projectTitle.trim()) newErrors.projectTitle = 'Project title is required';
    if (!formData.projectType) newErrors.projectType = 'Project type is required';
    if (!formData.description.trim()) newErrors.description = 'Project description is required';

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation (if provided)
    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Create WhatsApp message with form details
      const requestDetails = `
🔧 CUSTOM PROJECT REQUEST

👤 CONTACT INFORMATION:
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
${formData.company ? `Company: ${formData.company}` : ''}

📋 PROJECT DETAILS:
Title: ${formData.projectTitle}
Type: ${formData.projectType}
Budget: ${formData.budget}
Timeline: ${formData.timeline}
Priority: ${formData.priority}

📝 DESCRIPTION:
${formData.description}

📋 REQUIREMENTS:
${formData.requirements}

${formData.components ? `🔧 COMPONENTS NEEDED:\n${formData.components}` : ''}

${formData.specifications ? `⚙️ SPECIFICATIONS:\n${formData.specifications}` : ''}

${formData.inspiration ? `💡 INSPIRATION:\n${formData.inspiration}` : ''}

${formData.additionalNotes ? `📝 ADDITIONAL NOTES:\n${formData.additionalNotes}` : ''}

📞 PREFERRED CONTACT: ${formData.preferredContact}
⏰ BEST TIME TO CONTACT: ${formData.contactTime}
      `.trim();

      const whatsappUrl = `https://wa.me/260961288156?text=${encodeURIComponent(requestDetails)}`;
      window.open(whatsappUrl, '_blank');

      setSubmitStatus('success');

      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          projectTitle: '',
          projectType: '',
          description: '',
          requirements: '',
          budget: '',
          timeline: '',
          priority: 'medium',
          components: '',
          specifications: '',
          inspiration: '',
          additionalNotes: '',
          preferredContact: 'email',
          contactTime: 'anytime'
        });
        setSubmitStatus(null);
      }, 3000);

    } catch (error) {
      console.error('Error submitting request:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Custom Project Request
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have a unique electronics project in mind? We specialize in custom Arduino projects,
            IoT solutions, and electronic prototypes. Tell us about your vision and we'll help bring it to life.
          </p>
        </div>

        {/* Success/Error Messages */}
        {submitStatus === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
              <div>
                <h3 className="text-green-800 font-medium">Request Submitted Successfully!</h3>
                <p className="text-green-700 text-sm mt-1">
                  We've received your custom project request. Our team will review it and get back to you within 24 hours.
                </p>
              </div>
            </div>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <div>
                <h3 className="text-red-800 font-medium">Submission Failed</h3>
                <p className="text-red-700 text-sm mt-1">
                  There was an error submitting your request. Please try again or contact us directly.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <User className="h-5 w-5 text-primary-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="your.email@example.com"
                />
                {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.phone ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="+265 xxx xxx xxx"
                />
                {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company/Organization
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Lightbulb className="h-5 w-5 text-primary-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Project Details</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  name="projectTitle"
                  value={formData.projectTitle}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.projectTitle ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Give your project a descriptive title"
                />
                {errors.projectTitle && <p className="text-red-600 text-xs mt-1">{errors.projectTitle}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Type *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {projectTypes.map((type) => {
                    const IconComponent = type.icon;
                    return (
                      <label
                        key={type.value}
                        className={`relative flex flex-col items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.projectType === type.value
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="projectType"
                          value={type.value}
                          checked={formData.projectType === type.value}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <IconComponent className={`h-6 w-6 mb-2 ${
                          formData.projectType === type.value ? 'text-primary-500' : 'text-gray-400'
                        }`} />
                        <span className={`text-xs text-center ${
                          formData.projectType === type.value ? 'text-primary-700 font-medium' : 'text-gray-600'
                        }`}>
                          {type.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
                {errors.projectType && <p className="text-red-600 text-xs mt-1">{errors.projectType}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Describe your project idea, what you want it to do, and any specific features you need..."
                />
                {errors.description && <p className="text-red-600 text-xs mt-1">{errors.description}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Technical Requirements
                </label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Any specific technical requirements, sensors needed, connectivity options, etc."
                />
              </div>
            </div>
          </div>

          {/* Budget and Timeline */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <DollarSign className="h-5 w-5 text-primary-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Budget & Timeline</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget Range
                </label>
                <select
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select budget range</option>
                  {budgetRanges.map((range) => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timeline
                </label>
                <select
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select timeline</option>
                  {timelineOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority Level
                </label>
                <div className="flex space-x-4">
                  {[
                    { value: 'low', label: 'Low Priority', color: 'text-green-600' },
                    { value: 'medium', label: 'Medium Priority', color: 'text-yellow-600' },
                    { value: 'high', label: 'High Priority', color: 'text-red-600' }
                  ].map((priority) => (
                    <label key={priority.value} className="flex items-center">
                      <input
                        type="radio"
                        name="priority"
                        value={priority.value}
                        checked={formData.priority === priority.value}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <span className={priority.color}>{priority.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Settings className="h-5 w-5 text-primary-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Technical Specifications</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Required Components
                </label>
                <textarea
                  name="components"
                  value={formData.components}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="List any specific components you need (Arduino boards, sensors, displays, etc.)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Technical Specifications
                </label>
                <textarea
                  name="specifications"
                  value={formData.specifications}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Power requirements, size constraints, environmental conditions, etc."
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <MessageSquare className="h-5 w-5 text-primary-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Additional Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Inspiration/References
                </label>
                <textarea
                  name="inspiration"
                  value={formData.inspiration}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Any existing projects, products, or ideas that inspired this request"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  name="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Any other information you think would be helpful"
                />
              </div>
            </div>
          </div>

          {/* Contact Preferences */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Phone className="h-5 w-5 text-primary-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Contact Preferences</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Contact Method
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'email', label: 'Email' },
                    { value: 'phone', label: 'Phone Call' },
                    { value: 'whatsapp', label: 'WhatsApp' },
                    { value: 'any', label: 'Any method' }
                  ].map((method) => (
                    <label key={method.value} className="flex items-center">
                      <input
                        type="radio"
                        name="preferredContact"
                        value={method.value}
                        checked={formData.preferredContact === method.value}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <span>{method.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Best Time to Contact
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'morning', label: 'Morning (8AM - 12PM)' },
                    { value: 'afternoon', label: 'Afternoon (12PM - 5PM)' },
                    { value: 'evening', label: 'Evening (5PM - 8PM)' },
                    { value: 'anytime', label: 'Anytime' }
                  ].map((time) => (
                    <label key={time.value} className="flex items-center">
                      <input
                        type="radio"
                        name="contactTime"
                        value={time.value}
                        checked={formData.contactTime === time.value}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <span>{time.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="text-sm text-gray-600">
                <p>* Required fields</p>
                <p>We'll review your request and get back to you within 24 hours.</p>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/shop')}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Browse Products Instead
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Opening WhatsApp...
                    </>
                  ) : (
                    <>
                      <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.787"/>
                      </svg>
                      Send via WhatsApp
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Information Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Custom Solutions</h3>
            <p className="text-gray-600 text-sm">
              We design and build custom electronics solutions tailored to your specific needs and requirements.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <Settings className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Expert Consultation</h3>
            <p className="text-gray-600 text-sm">
              Our experienced team provides technical consultation to help you choose the right approach for your project.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality Guarantee</h3>
            <p className="text-gray-600 text-sm">
              We stand behind our work with comprehensive testing and quality assurance for all custom projects.
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-8 bg-primary-50 rounded-lg p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Need Help with Your Request?
            </h3>
            <p className="text-gray-600 mb-4">
              Our team is here to help you define your project requirements and find the best solution.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center text-gray-700">
                <Mail className="h-4 w-4 mr-2" />
                <span>giftedsolutions20@gmail.com</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Phone className="h-4 w-4 mr-2" />
                <span>0779421717</span>
              </div>
              <a
                href="https://wa.me/260779421717"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-green-600 hover:text-green-700"
              >
                <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.787"/>
                </svg>
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomRequest;