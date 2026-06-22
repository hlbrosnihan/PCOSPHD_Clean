import { Mail, Linkedin, GraduationCap, Award, BookOpen } from 'lucide-react';
import researcherImage from '../assets/595a855a0b3d852c95deb846a99baaec3ede9b5a.png';

export function AboutResearcher() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <div className="aspect-square rounded-lg overflow-hidden mb-6">
                <img
                  src={researcherImage}
                  alt="Hilary B Wray"
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="space-y-3">
                <a
                  href="mailto:wrayh@uni.coventry.ac.uk"
                  className="w-full bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Mail size={18} />
                  Contact
                </a>
                <a
                  href="https://www.linkedin.com/in/hlbrosnihan/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full border-2 border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:border-teal-600 hover:text-teal-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Linkedin size={18} />
                  LinkedIn
                </a>
              </div>
            </div>

            <div className="md:col-span-2">
              <h1 className="mb-2">Hilary B Wray</h1>
              <p className="text-teal-600 mb-6">PhD Candidate in Arts and Creative Cultures Research Centre</p>
              
              <div className="prose max-w-none">
                <p className="text-gray-600 mb-4">I am a dedicated researcher specializing in Polycystic Ovary Syndrome (PCOS), 
                with a focus on understanding the lived experience of this complex condition, as well as, the digital interventions related 
                to self-management within the NHS. My research aims to bridge the gap between lived experience, user interface design and 
                clinical applications to improve self-management for individuals affected by PCOS. This focus is on preventive care.</p>
                
                <p className="text-gray-600 mb-4">With a background in Product Design and UX/UI, I employ multidisciplinary 
                approaches to investigate the self-management of PCOS by looking at lived experience and digital usage both 
                in a clinical environment and personal private product experience. My work is driven by the belief that 
                personalized and preventive approaches will be key to addressing the diverse presentations and needs of PCOS patients.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Education & Experience */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <GraduationCap className="text-teal-600" size={20} />
              </div>
              <h2>Education</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-gray-900">PhD in Postdigital Cultures and Digital Health</p>
                <p className="text-gray-600">Coventry University</p>
                <p className="text-gray-500">2024 - Present</p>
              </div>
              
              <div>
                <p className="text-gray-900">MDes in Consumer Product Design</p>
                <p className="text-gray-600">Coventry University</p>
                <p className="text-gray-500">2008 - 2010</p>
              </div>
              
              <div>
                <p className="text-gray-900">BSc in Computer Art and Computer Science</p>
                <p className="text-gray-600">State University of New York College at Oneonta</p>
                <p className="text-gray-500">2003 - 2006</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <Award className="text-teal-600" size={20} />
              </div>
              <h2>Awards & Honors</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-gray-900">Midlands 4 Cities Scholarship</p>
                <p className="text-gray-600">M4C</p>
                <p className="text-gray-500">2024</p>
              </div>
            </div>
          </div>
        </div>

        {/* Publications */}
        <div className="bg-white rounded-lg shadow-sm p-6 relative overflow-hidden opacity-60">
          <div className="absolute top-6 -right-12 bg-teal-600 text-white px-12 py-1 transform rotate-45 text-sm font-bold shadow-lg">
            COMING SOON
          </div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <BookOpen className="text-teal-600" size={20} />
            </div>
            <h2>Selected Publications</h2>
          </div>
          
          <div className="space-y-4">
            <p className="text-gray-500 text-center py-8">
              Publication list will be available soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
