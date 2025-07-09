import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Cloud, 
  Database,
  RefreshCw,
  ExternalLink,
  Copy,
  Eye
} from 'lucide-react';

const SupabaseUploadStatus = ({ 
  isUploading, 
  uploadProgress, 
  uploadResults, 
  onRetry,
  showDetails = true 
}) => {
  const [showUrls, setShowUrls] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(null);

  // Copy URL to clipboard
  const copyUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  // Get upload statistics
  const getUploadStats = () => {
    if (!uploadResults) return { total: 0, successful: 0, failed: 0 };
    
    const total = uploadResults.length;
    const successful = uploadResults.filter(r => r.success).length;
    const failed = total - successful;
    
    return { total, successful, failed };
  };

  const stats = getUploadStats();

  if (!isUploading && !uploadResults) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Upload Progress */}
      {isUploading && uploadProgress && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <Cloud className="h-5 w-5 text-blue-500 mr-2" />
            <h4 className="font-medium text-blue-900">
              Uploading to Supabase Storage
            </h4>
          </div>
          
          <div className="space-y-3">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-sm text-blue-700 mb-1">
                <span>Progress: {uploadProgress.current}/{uploadProgress.total}</span>
                <span>{Math.round((uploadProgress.current / uploadProgress.total) * 100)}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Current File */}
            {uploadProgress.fileName && (
              <div className="flex items-center text-sm text-blue-700">
                <Upload className="h-4 w-4 mr-2 animate-pulse" />
                <span>
                  {uploadProgress.status === 'uploading' ? 'Uploading' : 'Processing'}: 
                  <span className="font-medium ml-1">{uploadProgress.fileName}</span>
                </span>
              </div>
            )}

            {/* Status Message */}
            <div className="text-xs text-blue-600 bg-blue-100 rounded p-2">
              <div className="flex items-center">
                <Database className="h-3 w-3 mr-1" />
                Images are being securely stored in Supabase cloud storage
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Results */}
      {uploadResults && (
        <div className={`border rounded-lg p-4 ${
          stats.failed === 0 
            ? 'bg-green-50 border-green-200' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              {stats.failed === 0 ? (
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
              )}
              <h4 className={`font-medium ${
                stats.failed === 0 ? 'text-green-900' : 'text-yellow-900'
              }`}>
                Upload Complete
              </h4>
            </div>
            
            {showDetails && (
              <button
                onClick={() => setShowUrls(!showUrls)}
                className="text-sm text-gray-600 hover:text-gray-800 flex items-center"
              >
                <Eye className="h-4 w-4 mr-1" />
                {showUrls ? 'Hide' : 'Show'} URLs
              </button>
            )}
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.successful}</div>
              <div className="text-sm text-gray-600">Successful</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
          </div>

          {/* Detailed Results */}
          {showDetails && (
            <div className="space-y-2">
              {uploadResults.map((result, index) => (
                <div key={index} className={`flex items-center justify-between p-2 rounded text-sm ${
                  result.success 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  <div className="flex items-center">
                    {result.success ? (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    ) : (
                      <AlertCircle className="h-4 w-4 mr-2" />
                    )}
                    <span className="font-medium">{result.file}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {result.success ? (
                      <>
                        <span className="text-xs">✓ Stored in Supabase</span>
                        {result.publicUrl && (
                          <>
                            <button
                              onClick={() => copyUrl(result.publicUrl)}
                              className="p-1 hover:bg-green-200 rounded"
                              title="Copy URL"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => window.open(result.publicUrl, '_blank')}
                              className="p-1 hover:bg-green-200 rounded"
                              title="Open Image"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </button>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <span className="text-xs">✗ Upload failed</span>
                        {onRetry && (
                          <button
                            onClick={() => onRetry(result)}
                            className="p-1 hover:bg-red-200 rounded"
                            title="Retry Upload"
                          >
                            <RefreshCw className="h-3 w-3" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* URLs Display */}
          {showUrls && stats.successful > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded border">
              <h5 className="font-medium text-gray-900 mb-2">Supabase URLs:</h5>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {uploadResults
                  .filter(r => r.success && r.publicUrl)
                  .map((result, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <span className="font-mono text-gray-600 truncate flex-1 mr-2">
                        {result.publicUrl}
                      </span>
                      <button
                        onClick={() => copyUrl(result.publicUrl)}
                        className={`p-1 rounded ${
                          copiedUrl === result.publicUrl 
                            ? 'bg-green-200 text-green-700' 
                            : 'hover:bg-gray-200'
                        }`}
                        title={copiedUrl === result.publicUrl ? 'Copied!' : 'Copy URL'}
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Success Message */}
          {stats.failed === 0 && (
            <div className="mt-3 text-sm text-green-700 bg-green-100 rounded p-2">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                All images successfully uploaded to Supabase and are now accessible worldwide!
              </div>
            </div>
          )}

          {/* Partial Success Message */}
          {stats.failed > 0 && stats.successful > 0 && (
            <div className="mt-3 text-sm text-yellow-700 bg-yellow-100 rounded p-2">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                {stats.successful} images uploaded successfully, {stats.failed} failed. 
                {onRetry && ' Click retry buttons to attempt failed uploads again.'}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Copy Confirmation */}
      {copiedUrl && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm">
          URL copied to clipboard!
        </div>
      )}
    </div>
  );
};

export default SupabaseUploadStatus;
