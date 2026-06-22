import { Target, Lightbulb, Users, TrendingUp, FileText, Beaker, Map, User, ChevronDown, ChevronUp } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState } from 'react';

export function AboutResearch() {
  const [objectivesExpanded, setObjectivesExpanded] = useState(false);
  const [methodologyExpanded, setMethodologyExpanded] = useState(false);
  const [outcomesExpanded, setOutcomesExpanded] = useState(false);
  const [impactExpanded, setImpactExpanded] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="relative h-48 md:h-64">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1627757757997-369fb38812e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBhcHAlMjB3aXJlZnJhbWUlMjBza2V0Y2glMjBwcm90b3R5cGV8ZW58MXx8fHwxNzcxNDE1ODAxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Mobile Wireframe Design"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-teal-900/80 to-teal-600/60 flex items-center">
              <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
                <h1 className="text-white mb-4">PCOS Creative Interventions Research</h1>
                <p className="text-teal-50">Investigating the multifaceted nature of Polycystic Ovary Syndrome to advance digital self-management solutions.</p>
              </div>
            </div>
          </div>
        </div>

{/* Research Overview */}
<div className="bg-white rounded-lg shadow-sm p-8 mb-8">
  <h2 className="mb-6">Research Overview</h2>
  <div className="prose max-w-none">
    <p className="text-gray-600 mb-4">
      My research takes a multidisciplinary approach to understanding PCOS, 
      bringing together lived experiences, everyday interactions with healthcare, and 
      the design of digital tools. By exploring how people manage their symptoms, navigate appointments,
      and use apps or online resources, the project builds a fuller picture of what PCOS care actually looks like 
      in real life.
    </p>

    <p className="text-gray-600 mb-4">
      The aim is to identify what genuinely supports people and where care systems fall short. By analysing these 
      insights and working directly with patients, the research contributes to developing more personalised and 
      responsive treatment strategies. Ultimately, the goal is to address the highly varied nature of PCOS and 
      support better long-term health outcomes for those affected.
    </p>

    {/* Spacer before second heading */}
    <div className="mt-10 mb-6">
      <h2>Research Questions</h2>
    </div>

    <p className="text-gray-600 mb-4">
      <strong>RQ1.</strong> How do PCOS users experience and respond to the current UX/UI systems of preventive care applications?
      <div className="mt-10 mb-6">
        
    </div>
    <strong>RQ2.</strong>  How can co-design approaches address the gaps in
       digital PCOS intervention, and provide UX/UI guidelines for future FemTech that are more user-informed? 
    </p>
  </div>
</div>

        {/* Research Objectives */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <Target className="text-teal-600" size={20} />
            </div>
            <h2 className="flex-1">Research Objectives</h2>
            <button
              className="md:hidden ml-auto text-teal-600 hover:bg-teal-50 p-2 rounded-lg transition-colors"
              onClick={() => setObjectivesExpanded(!objectivesExpanded)}
              aria-label={objectivesExpanded ? "Collapse objectives" : "Expand objectives"}
            >
              {objectivesExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
            </button>
          </div>
          
          <div className={`grid md:grid-cols-2 gap-6 ${objectivesExpanded ? 'block' : 'hidden'} md:grid`}>
            <div className="border-l-4 border-teal-600 pl-4">
              <h3 className="mb-2">Objective 1</h3>
              <p className="text-gray-600">
              To review existing systems/tools/apps to inform user discussions and look 
              at gap areas in more detail.
             
                
              </p>
            </div>
            
            <div className="border-l-4 border-teal-600 pl-4">
              <h3 className="mb-2">Objective 2</h3>
              <p className="text-gray-600">
              To better understand patient/user/women's needs and requirements in care and self-management 
              of PCOS both in the NHS and the wider digital world.
                
              </p>
            </div>
            
            <div className="border-l-4 border-teal-600 pl-4">
              <h3 className="mb-2">Objective 3</h3>
              <p className="text-gray-600">
              To understand the clinical/healthcare professional perspective in the managment of PCOS,
              the care pathways it takes and the interventions that can be implemented. 
              </p>
            </div>
            
            <div className="border-l-4 border-teal-600 pl-4">
              <h3 className="mb-2">Objective 4</h3>
              <p className="text-gray-600">
               To develop a co-designed framework with patients and healthcare professional that can solve painpoints in care.
              </p>
            </div>
          </div>
        </div>

        {/* Methodology */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <Beaker className="text-teal-600" size={20} />
            </div>
            <h2>Methodology</h2>
            <button
              className="md:hidden ml-auto text-teal-600 hover:bg-teal-50 p-2 rounded-lg transition-colors"
              onClick={() => setMethodologyExpanded(!methodologyExpanded)}
              aria-label={methodologyExpanded ? "Collapse methodology" : "Expand methodology"}
            >
              {methodologyExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
            </button>
          </div>
          
          <div className={`grid md:grid-cols-2 lg:grid-cols-4 gap-6 ${methodologyExpanded ? 'block' : 'hidden'} md:grid`}>
          
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="text-teal-600" size={24} />
              </div>
              <h3 className="mb-2">Autoethnography of PCOS Care Journey</h3>
              <p className="text-gray-600">
              This approach uses my personal PCOS journey as data. By reflecting on appointments, symptoms, 
              and self-management, I explore how PCOS care works in everyday life and where improvements 
              are needed.
              </p>
            </div>
            
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="text-teal-600" size={24} />
              </div>
              <h3 className="mb-2">Digital Survey</h3>
              <p className="text-gray-600">
              The survey collects anonymous information from PCOS patients about their 
              symptoms, appointments, app use, and self-management. 
              This helps identify common patterns and different needs.
              </p>
            </div>



            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Map className="text-teal-600" size={24} />
              </div>
              <h3 className="mb-2">Lived Experience Mapping</h3>
              <p className="text-gray-600">
              This method helps people map out their PCOS experiences. From symptoms 
              and appointments to self-care and digital tool use. 
              The maps reveal patterns that often get lost in standard medical histories.
              </p>
            </div>
            
        
            
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-teal-600" size={24} />
              </div>
              <h3 className="mb-2">Co-design</h3>
              <p className="text-gray-600">
              Patients actively take part in designing features, 
              pathways, and improvements. This ensures the final outcomes are grounded in lived experience, not assumptions.
              </p>
            </div>
            
          </div>
        </div>

        {/* Expected Outcomes */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <Lightbulb className="text-teal-600" size={20} />
              </div>
              <h2>Expected Outcomes</h2>
              <button
                className="md:hidden ml-auto text-teal-600 hover:bg-teal-50 p-2 rounded-lg transition-colors"
                onClick={() => setOutcomesExpanded(!outcomesExpanded)}
                aria-label={outcomesExpanded ? "Collapse outcomes" : "Expand outcomes"}
              >
                {outcomesExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
              </button>
            </div>
            
            <ul className={`space-y-3 text-gray-600 ${outcomesExpanded ? 'block' : 'hidden'} md:block`}>
              <li className="flex gap-3">
                <span className="text-teal-600 mt-1">•</span>
                <span>A deeper understanding of real PCOS care journeys, 
                  including where patients feel supported and where gaps or barriers occur.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-teal-600 mt-1">•</span>
                <span>Insights into how people with PCOS use digital 
                  tools and apps, and what features or experiences help or hinder their self-management.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-teal-600 mt-1">•</span>
                <span>Visual maps that show the full picture of lived experience, combining clinical 
                  appointments, symptoms, emotions, and digital interactions.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-teal-600 mt-1">•</span>
                <span>Practical design recommendations, created with patients, for 
                  improving digital health tools and NHS pathways for PCOS.</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <Users className="text-teal-600" size={20} />
              </div>
              <h2>Impact & Significance</h2>
              <button
                className="md:hidden ml-auto text-teal-600 hover:bg-teal-50 p-2 rounded-lg transition-colors"
                onClick={() => setImpactExpanded(!impactExpanded)}
                aria-label={impactExpanded ? "Collapse impact" : "Expand impact"}
              >
                {impactExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
              </button>
            </div>
            
            <p className={`text-gray-600 mb-4 ${impactExpanded ? 'block' : 'hidden'} md:block`}>
            This research helps make the real experiences of people with PCOS visible. By combining personal narratives, 
            lived experience mapping, and co-designed insights, it highlights what patients actually 
            need from both digital tools and NHS care. The outcomes have the potential to influence how PCOS support 
            is designed, delivered, and evaluated. Both in clinical settings and through digital health technologies.
            </p>
            
            <ul className={`space-y-3 text-gray-600 ${impactExpanded ? 'block' : 'hidden'} md:block`}>
              <li className="flex gap-3">
                <span className="text-teal-600 mt-1">•</span>
                <span>Improved understanding of patient needs</span>
              </li>
              <li className="flex gap-3">
                <span className="text-teal-600 mt-1">•</span>
                <span>Evidence for better digital health design</span>
              </li>
              <li className="flex gap-3">
                <span className="text-teal-600 mt-1">•</span>
                <span>A mapping model that can inform other long-term conditions</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}