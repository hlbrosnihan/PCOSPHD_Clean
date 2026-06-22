import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ImageWithFallback } from './figma/ImageWithFallback';
import pcosImage from 'figma:asset/d811313cf936f3f034bb44f185987dda85afd784.png';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {/* Header Image */}
        <div className="mb-12 relative overflow-hidden rounded-2xl shadow-xl">
          <div className="relative h-64 md:h-80">
            <ImageWithFallback
              src={pcosImage}
              alt="Polycystic Ovary Ultrasound"
              className="w-full h-full object-cover opacity-40"
            />
            {/* Text Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/30 px-8 py-4 rounded-lg backdrop-blur-sm">
                <h2 className="text-white text-4xl md:text-5xl lg:text-6xl font-bold tracking-wide">
                  PCOS PhD
                </h2>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-teal-600 mb-4">
            PCOS PhD Research
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto mb-8">
            Advancing Polycystic Ovary Syndrome care through lived experience, evidence-based insights, and design based thinking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/join')}
              className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors inline-flex items-center justify-center gap-2"
            >
              Join the Research
            </button>
            <button
              onClick={() => navigate('/research')}
              className="bg-teal-700 text-white px-6 py-3 rounded-lg hover:bg-teal-800 transition-colors inline-flex items-center justify-center gap-2"
            >
              Explore Research
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
        
        <button
  onClick={() => navigate('blog')}
  className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer text-left"
>
  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
    <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
  </div>
  <h3 className="mb-2">Blog & Insights</h3>
  <p className="text-gray-600">
    Regular updates on research progress, insights, and discussions about PCOS.
  </p>
</button>

          <button
            onClick={() => navigate('/research')}
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer text-left"
          >
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="mb-2">About the Research</h3>
            <p className="text-gray-600">
              Discover the research objectives, methodology, and approach to advancing PCOS understanding.
            </p>
          </button>

          <div className="bg-white p-6 rounded-lg shadow-sm relative overflow-hidden opacity-60 cursor-not-allowed">
            {/* Coming Soon Banner */}
            <div className="absolute top-6 -right-12 bg-teal-600 text-white px-12 py-1 transform rotate-45 text-sm font-bold shadow-lg">
              COMING SOON
            </div>
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="mb-2">Research Publications</h3>
            <p className="text-gray-600">
              Access peer-reviewed publications and ongoing research findings in PCOS studies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}