import React from 'react';

const Test = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Test Page</h1>
        <p className="text-gray-600">If you can see this, React is working!</p>
        <div className="mt-4">
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Test Button
          </button>
        </div>
      </div>
    </div>
  );
};

export default Test;
