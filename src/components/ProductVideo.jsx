import { useState } from 'react';
import { Play, ExternalLink, Video, Youtube } from 'lucide-react';

const ProductVideo = ({ 
  videoUrl, 
  youtubeTutorialUrl, 
  videoTitle, 
  videoDescription, 
  productTitle,
  className = "" 
}) => {
  const [activeVideo, setActiveVideo] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Get YouTube thumbnail
  const getYouTubeThumbnail = (url) => {
    const videoId = getYouTubeVideoId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
  };

  // Check if URL is a YouTube video
  const isYouTubeUrl = (url) => {
    return url && (url.includes('youtube.com') || url.includes('youtu.be'));
  };

  // Open video in modal
  const openVideoModal = (url, title) => {
    setActiveVideo({ url, title });
    setShowVideoModal(true);
  };

  // Close video modal
  const closeVideoModal = () => {
    setShowVideoModal(false);
    setActiveVideo(null);
  };

  // Render YouTube embed
  const renderYouTubeEmbed = (url) => {
    const videoId = getYouTubeVideoId(url);
    if (!videoId) return null;

    return (
      <iframe
        width="100%"
        height="315"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="rounded-lg"
      ></iframe>
    );
  };

  // Render regular video
  const renderRegularVideo = (url) => {
    return (
      <video
        controls
        className="w-full h-auto rounded-lg"
        preload="metadata"
      >
        <source src={url} type="video/mp4" />
        <source src={url} type="video/webm" />
        <source src={url} type="video/ogg" />
        Your browser does not support the video tag.
      </video>
    );
  };

  // If no videos, return null
  if (!videoUrl && !youtubeTutorialUrl) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Video Section Header */}
      <div className="flex items-center space-x-2">
        <Video className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Product Videos</h3>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Main Product Video */}
        {videoUrl && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-800 dark:text-gray-200 flex items-center">
              <Play className="w-4 h-4 mr-2 text-green-600" />
              {videoTitle || 'Product Demo'}
            </h4>
            
            {isYouTubeUrl(videoUrl) ? (
              <div className="relative">
                <img
                  src={getYouTubeThumbnail(videoUrl)}
                  alt={videoTitle || 'Video thumbnail'}
                  className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => openVideoModal(videoUrl, videoTitle || 'Product Demo')}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-red-600 hover:bg-red-700 text-white rounded-full p-3 cursor-pointer transition-colors">
                    <Play className="w-6 h-6 fill-current" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative">
                <video
                  className="w-full h-48 object-cover rounded-lg cursor-pointer"
                  preload="metadata"
                  onClick={() => openVideoModal(videoUrl, videoTitle || 'Product Demo')}
                >
                  <source src={videoUrl} type="video/mp4" />
                </video>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-3 cursor-pointer transition-colors">
                    <Play className="w-6 h-6 fill-current" />
                  </div>
                </div>
              </div>
            )}
            
            {videoDescription && (
              <p className="text-sm text-gray-600">{videoDescription}</p>
            )}
          </div>
        )}

        {/* YouTube Tutorial */}
        {youtubeTutorialUrl && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-800 dark:text-gray-200 flex items-center">
              <Youtube className="w-4 h-4 mr-2 text-red-600" />
              Tutorial Guide
            </h4>
            
            <div className="relative">
              <img
                src={getYouTubeThumbnail(youtubeTutorialUrl)}
                alt="Tutorial thumbnail"
                className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => openVideoModal(youtubeTutorialUrl, 'Tutorial Guide')}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-red-600 hover:bg-red-700 text-white rounded-full p-3 cursor-pointer transition-colors">
                  <Play className="w-6 h-6 fill-current" />
                </div>
              </div>
              <div className="absolute top-2 right-2">
                <Youtube className="w-6 h-6 text-red-600 bg-white rounded p-1" />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Step-by-step tutorial</p>
              <a
                href={youtubeTutorialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Open in YouTube
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Video Modal */}
      {showVideoModal && activeVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{activeVideo.title}</h3>
              <button
                onClick={closeVideoModal}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              {isYouTubeUrl(activeVideo.url) ? (
                renderYouTubeEmbed(activeVideo.url)
              ) : (
                renderRegularVideo(activeVideo.url)
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductVideo;
