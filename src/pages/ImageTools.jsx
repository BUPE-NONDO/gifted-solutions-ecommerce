import React from 'react';
import { Wand2, Download, Upload, RefreshCw, ExternalLink, ArrowRight, Rocket } from 'lucide-react';

const ImageTools = () => {
  const tools = [
    {
      title: "🚀 Deploy with Real Images",
      description: "Download real product images from official sources and prepare for production deployment",
      icon: <Rocket className="h-8 w-8" />,
      url: "/deploy-with-real-images",
      color: "blue",
      recommended: true,
      deployment: true,
      features: [
        "Real product images from official sources",
        "Arduino, ESP32, sensor images from manufacturers",
        "Automatic Supabase upload",
        "Production deployment ready",
        "Download deployment files"
      ]
    },
    {
      title: "Auto-Generate Unique Images",
      description: "Automatically generates unique, colorful images for each product using canvas and uploads them to Supabase",
      icon: <Wand2 className="h-8 w-8" />,
      url: "/auto-update-images",
      color: "purple",
      features: [
        "Generates unique images for each product",
        "Canvas-based image creation",
        "Automatic Supabase upload",
        "No external dependencies",
        "Instant results"
      ]
    },
    {
      title: "Download from PNGWing",
      description: "Downloads accurate product images from pngwing.com and uploads them to Supabase storage",
      icon: <Download className="h-8 w-8" />,
      url: "/update-accurate-images",
      color: "blue",
      features: [
        "Real product images from PNGWing",
        "Batch download capability",
        "CORS proxy support",
        "Progress tracking",
        "Error handling"
      ]
    },
    {
      title: "📸 Check Supabase for New Images",
      description: "Scan Supabase storage for new uploaded images and automatically update products",
      icon: <RefreshCw className="h-8 w-8" />,
      url: "/check-supabase-images",
      color: "green",
      recommended: true,
      features: [
        "Scan Supabase storage for new images",
        "Automatic product matching",
        "Smart update suggestions",
        "Bulk image updates",
        "Download updated products file"
      ]
    },
    {
      title: "Manual Image Upload",
      description: "Upload and manage product images manually with full control over the process",
      icon: <Upload className="h-8 w-8" />,
      url: "/update-product-images",
      color: "orange",
      features: [
        "Manual image selection",
        "Individual product updates",
        "Preview before upload",
        "Custom image URLs",
        "Selective updates"
      ]
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      purple: {
        bg: "bg-purple-50",
        border: "border-purple-200",
        button: "bg-purple-600 hover:bg-purple-700",
        text: "text-purple-600",
        icon: "text-purple-500"
      },
      blue: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        button: "bg-blue-600 hover:bg-blue-700",
        text: "text-blue-600",
        icon: "text-blue-500"
      },
      green: {
        bg: "bg-green-50",
        border: "border-green-200",
        button: "bg-green-600 hover:bg-green-700",
        text: "text-green-600",
        icon: "text-green-500"
      },
      orange: {
        bg: "bg-orange-50",
        border: "border-orange-200",
        button: "bg-orange-600 hover:bg-orange-700",
        text: "text-orange-600",
        icon: "text-orange-500"
      }
    };
    return colors[color];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🖼️ Image Management Tools
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Choose the best tool for updating your product images
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <RefreshCw className="h-4 w-4" />
            <span>All tools upload directly to Supabase storage</span>
          </div>
        </div>

        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {tools.map((tool, index) => {
            const colors = getColorClasses(tool.color);

            return (
              <div
                key={index}
                className={`relative ${colors.bg} ${colors.border} border-2 rounded-xl p-8 transition-all duration-300 hover:shadow-lg ${tool.recommended ? (tool.deployment ? 'ring-2 ring-blue-300' : 'ring-2 ring-purple-300') : ''}`}
              >
                {tool.recommended && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className={`${tool.deployment ? 'bg-blue-600' : 'bg-purple-600'} text-white px-4 py-1 rounded-full text-sm font-medium`}>
                      {tool.deployment ? '🚀 Deploy Ready' : 'Recommended'}
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className={`inline-flex items-center justify-center w-16 h-16 ${colors.icon} mb-4`}>
                    {tool.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {tool.title}
                  </h3>
                  <p className="text-gray-600">
                    {tool.description}
                  </p>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-gray-700 mb-3">Features:</h4>
                  <ul className="space-y-2">
                    {tool.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2 text-sm text-gray-600">
                        <div className={`w-1.5 h-1.5 rounded-full ${colors.text.replace('text-', 'bg-')} mt-2 flex-shrink-0`}></div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href={tool.url}
                  className={`w-full ${colors.button} text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 group`}
                >
                  <span>Open Tool</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            );
          })}
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Quick Links
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="/"
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <ExternalLink className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-gray-800">Main Website</div>
                <div className="text-sm text-gray-500">View live site</div>
              </div>
            </a>

            <a
              href="/admin"
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Upload className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="font-medium text-gray-800">Admin Panel</div>
                <div className="text-sm text-gray-500">Manage products</div>
              </div>
            </a>

            <a
              href="/test-supabase-only"
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="font-medium text-gray-800">Test Page</div>
                <div className="text-sm text-gray-500">Verify functionality</div>
              </div>
            </a>

            <a
              href="https://www.pngwing.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <ExternalLink className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="font-medium text-gray-800">PNGWing</div>
                <div className="text-sm text-gray-500">Image source</div>
              </div>
            </a>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-800 mb-3">💡 Recommendations:</h3>
          <div className="space-y-2 text-blue-700">
            <p><strong>For quick results:</strong> Use the Auto-Generate tool (purple) - it creates unique images instantly</p>
            <p><strong>For real product images:</strong> Use the PNGWing download tool (blue) - requires internet connection</p>
            <p><strong>For custom control:</strong> Use the Manual upload tool (green) - upload your own images</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageTools;
