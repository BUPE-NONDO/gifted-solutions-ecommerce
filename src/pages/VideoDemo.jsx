import React from 'react';
import { Play, Youtube, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const VideoDemo = () => {
  return (
    <div className="min-h-screen bg-gray-800 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <div className="bg-gray-800 dark:bg-gray-800 shadow-sm border-b border-gray-700 dark:border-gray-700 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="flex items-center text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Home
              </Link>
              <div className="h-6 w-px bg-gray-600"></div>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center">
                  <Youtube className="w-6 h-6 mr-3 text-red-600" />
                  Featured Video Tutorials
                </h1>
                <p className="text-gray-300 mt-1">
                  Watch our latest tutorials and guides to master electronics and shopping on our platform.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Video Tutorials Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Shopping Guide Video */}
          <div className="bg-gray-700 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-200">
            <div className="relative">
              <img
                src="https://img.youtube.com/vi/L_8o7VTXusI/maxresdefault.jpg"
                alt="Shopping Guide Thumbnail"
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <a
                  href="https://youtu.be/L_8o7VTXusI?si=8vRso5NuAr5jnaFW"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4 transition-colors duration-200"
                >
                  <Play className="w-8 h-8 fill-current" />
                </a>
              </div>
              <div className="absolute top-2 right-2">
                <Youtube className="w-6 h-6 text-red-600 bg-white rounded p-1" />
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                How to Shop for Electronic Components in Zambia
              </h3>
              <p className="text-gray-300 text-sm">
                Complete guide to shopping for electronic components on Gifted Solutions website in Zambia.
              </p>
            </div>
          </div>

          {/* Electronics Basics Video */}
          <div className="bg-gray-700 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-200">
            <div className="relative">
              <img
                src="https://img.youtube.com/vi/qXv-TvTnEPA/maxresdefault.jpg"
                alt="Electronics Basics Thumbnail"
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <a
                  href="https://youtube.com/shorts/qXv-TvTnEPA?si=Ybbmp5_BK-C2nnSk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4 transition-colors duration-200"
                >
                  <Play className="w-8 h-8 fill-current" />
                </a>
              </div>
              <div className="absolute top-2 right-2">
                <Youtube className="w-6 h-6 text-red-600 bg-white rounded p-1" />
              </div>
              <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                SHORT
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                Electronics Basics - Quick Start Guide
              </h3>
              <p className="text-gray-300 text-sm">
                Short tutorial covering essential electronics concepts and getting started tips.
              </p>
            </div>
          </div>

          {/* Component Identification Video */}
          <div className="bg-gray-700 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-200">
            <div className="relative">
              <img
                src="https://img.youtube.com/vi/L8rdew823M4/maxresdefault.jpg"
                alt="Component Identification Thumbnail"
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <a
                  href="https://youtube.com/shorts/L8rdew823M4?si=dKSC2IVpI53KPRfc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4 transition-colors duration-200"
                >
                  <Play className="w-8 h-8 fill-current" />
                </a>
              </div>
              <div className="absolute top-2 right-2">
                <Youtube className="w-6 h-6 text-red-600 bg-white rounded p-1" />
              </div>
              <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                SHORT
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                Component Identification Guide
              </h3>
              <p className="text-gray-300 text-sm">
                Quick guide to identifying common electronic components and their functions.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Content Section */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Learn Electronics with Gifted Solutions
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Our comprehensive video tutorials cover everything from basic electronics concepts to advanced project implementations.
              Whether you're a beginner or an experienced maker, our content will help you master electronics and get the most out of your purchases.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-700 rounded-lg p-6 text-center">
              <Youtube className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Video Tutorials</h3>
              <p className="text-gray-300">
                Step-by-step video guides for all skill levels, from basic concepts to advanced projects.
              </p>
            </div>

            <div className="bg-gray-700 rounded-lg p-6 text-center">
              <Play className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Product Demos</h3>
              <p className="text-gray-300">
                See our products in action with detailed demonstrations and usage examples.
              </p>
            </div>

            <div className="bg-gray-700 rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">?</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Expert Tips</h3>
              <p className="text-gray-300">
                Learn from electronics experts with tips, tricks, and best practices for your projects.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDemo;
