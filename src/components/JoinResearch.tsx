// =============================================================
// JoinResearch.tsx — Version History
// =============================================================
// v1 — Original (from project repo)
//      - Inclusion Criteria: "Women aged 18-45 years"
//      - Studies Participation: plain text, no formatting
//
// v2 — 2026-04-27
//      CHANGED: "Women aged 18-45 years" → "People aged 18 or over"
//               (removes gender restriction and age upper limit)
//      ADDED:   "Based in the UK" as a fourth inclusion criterion
//      CHANGED: Studies Participation wording tidied for consistency:
//               - "Survey is 20-30 minutes online"
//                 → "Survey — 20–30 minutes, completed online"
//               - "Digital Pathway Mapping is an in person workshop"
//                 → "Digital Pathway Mapping — in-person workshop using digital tools"
//               - "Co-Design experience is an in person workshop"
//                 → "Co-Design Workshop — in-person session"
//
// v3 — 2026-04-27
//      MOVED:   "Already Interested? Take Our Survey" section
//               — was below Express Your Interest form
//               — now sits above Express Your Interest form
// =============================================================

import { Users, CheckCircle, FileText, Mail, Clock, Heart, ClipboardList } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function JoinResearch() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/interest.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', phone: '', age: '', message: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch (err) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Hero Section */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="relative h-64 md:h-80">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwdGVhbSUyMGNvbGxhYm9yYXRpb258ZW58MXx8fHwxNzYyMzQxMDE5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Research Collaboration"
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0 flex items-center"
              style={{
                backgroundImage: `linear-gradient(to right, rgba(17, 94, 89, 0.9), rgba(13, 148, 136, 0.7))`,
              }}
            >
              <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-white text-center">
                <h1 className="text-white mb-4">Join Our Research Study</h1>
                <p className="text-teal-50">
                  Help advance PCOS research by participating in our study.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Why Participate Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="mb-6">Why Participate in Our Study?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-teal-50 rounded-lg">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="text-teal-600" size={28} />
              </div>
              <h3 className="mb-2">Your Experience Matters</h3>
              <p className="text-gray-600">
                Help highlight the real challenges of living with PCOS.
                Your insights shape a more accurate and compassionate understanding of the condition.
              </p>
            </div>

            <div className="text-center p-6 bg-teal-50 rounded-lg">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="text-teal-600" size={28} />
              </div>
              <h3 className="mb-2">Improve Future PCOS Care</h3>
              <p className="text-gray-600">
                By sharing your journey, you contribute directly to designing better
                NHS pathways and digital tools that support long-term health and self-management.
              </p>
            </div>

            <div className="text-center p-6 bg-teal-50 rounded-lg">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-teal-600" size={28} />
              </div>
              <h3 className="mb-2">Be Part of Meaningful Change</h3>
              <p className="text-gray-600">
                Your voice helps build solutions that reflect lived experience not assumptions.
                Together, we can create more personalised, effective support for people with PCOS.
              </p>
            </div>
          </div>
        </div>

        {/* Eligibility Criteria */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-teal-600" size={20} />
            </div>
            <h2>Eligibility Criteria</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="mb-3 text-teal-600">Inclusion Criteria</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex gap-3">
                  <CheckCircle className="text-teal-600 flex-shrink-0 mt-1" size={18} />
                  <span>People aged 18 or over</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="text-teal-600 flex-shrink-0 mt-1" size={18} />
                  <span>Diagnosed with PCOS</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="text-teal-600 flex-shrink-0 mt-1" size={18} />
                  <span>Able to provide informed consent</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="text-teal-600 flex-shrink-0 mt-1" size={18} />
                  <span>Based in the UK</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-teal-600">Studies Participation</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex gap-3">
                  <Clock className="text-teal-600 flex-shrink-0 mt-1" size={18} />
                  <span>Survey — 20–30 minutes, completed online</span>
                </li>
                <li className="flex gap-3">
                  <Clock className="text-teal-600 flex-shrink-0 mt-1" size={18} />
                  <span>Digital Pathway Mapping — in-person workshop using digital tools</span>
                </li>
                <li className="flex gap-3">
                  <Clock className="text-teal-600 flex-shrink-0 mt-1" size={18} />
                  <span>Co-Design Workshop — in-person session</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* What to Expect */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="mb-6">What to Expect</h2>
          <div className="space-y-6">
            <div className="border-l-4 border-teal-600 pl-6">
              <h3 className="mb-2">Initial Survey</h3>
              <p className="text-gray-600">
                You'll complete a short online questionnaire about your PCOS experiences, symptoms, and digital health use.
              </p>
            </div>
            <div className="border-l-4 border-teal-600 pl-6">
              <h3 className="mb-2">Digital Pathway Mapping Focus Group</h3>
              <p className="text-gray-600">
                You'll create a digital visual map of your care journey, showing key moments,
                challenges, and interactions with healthcare and apps.
              </p>
            </div>
            <div className="border-l-4 border-teal-600 pl-6">
              <h3 className="mb-2">Co-design Workshop</h3>
              <p className="text-gray-600">
                You'll work collaboratively with others to shape ideas, tools,
                or features that could improve future PCOS care and digital support.
              </p>
            </div>
          </div>
        </div>

        {/* v3: Survey Button Section — MOVED above Express Your Interest */}
        <div className="bg-gradient-to-r from-teal-50 to-teal-100 rounded-lg shadow-sm p-8 border-2 border-teal-200 mb-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="text-white" size={32} />
            </div>
            <h2 className="mb-4">Already Interested? Take Our Survey</h2>
            <p className="text-gray-700 mb-6">
              If you've already expressed interest or want to contribute to our research immediately,
              you can complete our comprehensive PCOS survey. This survey helps us gather valuable
              data about PCOS experiences and takes approximately 15-20 minutes to complete.
            </p>
            <button
              onClick={() => navigate('/survey')}
              className="bg-teal-600 text-white px-8 py-4 rounded-lg hover:bg-teal-700 transition-colors inline-flex items-center gap-2"
            >
              <ClipboardList size={20} />
              Participate in Our Survey
            </button>
          </div>
        </div>

        {/* Express Your Interest Form — now sits below the survey link */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <Mail className="text-teal-600" size={20} />
            </div>
            <h2>Express Your Interest</h2>
          </div>

          <p className="text-gray-600 mb-6">
            Fill out the form below to express your interest in participating. A member of our research team
            will contact you within 2-3 business days to discuss the study in more detail.
          </p>

          {submitStatus === 'success' ? (
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-8 text-center">
              <CheckCircle className="text-teal-600 mx-auto mb-3" size={48} />
              <h3 className="text-teal-900 mb-2">Thank You for Your Interest!</h3>
              <p className="text-teal-800">
                Your expression of interest has been received. We will be in touch within 2-3 business days.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block mb-2 text-gray-700">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block mb-2 text-gray-700">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block mb-2 text-gray-700">
                  Additional Information (Optional)
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent resize-none"
                  placeholder="Tell us about your PCOS diagnosis, any questions you have, or other relevant information..."
                />
              </div>

              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <p className="text-gray-700">
                  <strong>Privacy Notice:</strong> Your information will be kept confidential and used solely for
                  research screening purposes. By submitting this form, you consent to be contacted by our
                  research team.
                </p>
              </div>

              {submitStatus === 'error' && (
                <p className="text-red-600 text-sm">
                  Something went wrong. Please try again or email us directly at{' '}
                  <a href="mailto:wrayh@uni.coventry.ac.uk" className="underline">
                    wrayh@uni.coventry.ac.uk
                  </a>.
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto bg-teal-600 text-white px-8 py-3 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Interest Form'}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}