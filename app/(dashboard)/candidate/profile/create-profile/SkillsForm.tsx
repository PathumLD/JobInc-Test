'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFormContext } from 'react-hook-form';
import { Plus, Trash2, ChevronDown, ChevronUp, GripVertical, ArrowUpDown, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect, useMemo } from 'react';
import { BasicInfoFormValues } from './BasicInfoForm';

// Job field definitions with their respective skill categories
const JOB_FIELDS = {
  'technology': {
    name: 'Technology & IT',
    categories: [
      'Programming Languages',
      'Frontend Development',
      'Backend Development',
      'Mobile Development',
      'Databases',
      'Cloud Services',
      'DevOps',
      'Cybersecurity',
      'Data Science & Analytics',
      'AI & Machine Learning',
      'Testing & QA',
      'Tools & Platforms',
      'Soft Skills',
      'Other'
    ]
  },
  'healthcare': {
    name: 'Healthcare & Medicine',
    categories: [
      'Clinical Skills',
      'Medical Specialties',
      'Diagnostic Skills',
      'Patient Care',
      'Medical Equipment',
      'Pharmacology',
      'Medical Software',
      'Research & Analysis',
      'Regulatory & Compliance',
      'Communication Skills',
      'Leadership & Management',
      'Other'
    ]
  },
  'engineering': {
    name: 'Engineering',
    categories: [
      'Engineering Disciplines',
      'Technical Skills',
      'Design & Modeling',
      'Project Management',
      'Quality Control',
      'Safety & Compliance',
      'Materials & Manufacturing',
      'Analysis & Testing',
      'Software & Tools',
      'Communication Skills',
      'Leadership & Management',
      'Other'
    ]
  },
  'finance': {
    name: 'Finance & Accounting',
    categories: [
      'Financial Analysis',
      'Accounting Principles',
      'Tax & Compliance',
      'Investment & Trading',
      'Risk Management',
      'Financial Software',
      'Auditing',
      'Budgeting & Forecasting',
      'Banking Operations',
      'Communication Skills',
      'Leadership & Management',
      'Other'
    ]
  },
  'marketing': {
    name: 'Marketing & Sales',
    categories: [
      'Digital Marketing',
      'Content Creation',
      'Sales Techniques',
      'Market Research',
      'Brand Management',
      'Social Media',
      'Analytics & Reporting',
      'Customer Relations',
      'Marketing Tools',
      'Communication Skills',
      'Leadership & Management',
      'Other'
    ]
  },
  'education': {
    name: 'Education & Training',
    categories: [
      'Teaching Methods',
      'Curriculum Development',
      'Assessment & Evaluation',
      'Educational Technology',
      'Student Management',
      'Special Education',
      'Research & Development',
      'Administrative Skills',
      'Communication Skills',
      'Leadership & Management',
      'Subject Expertise',
      'Other'
    ]
  },
  'legal': {
    name: 'Legal',
    categories: [
      'Legal Practice Areas',
      'Legal Research',
      'Document Drafting',
      'Litigation Skills',
      'Contract Law',
      'Regulatory Compliance',
      'Legal Software',
      'Client Relations',
      'Negotiation Skills',
      'Communication Skills',
      'Leadership & Management',
      'Other'
    ]
  },
  'creative': {
    name: 'Creative & Design',
    categories: [
      'Graphic Design',
      'Web Design',
      'Video & Animation',
      'Photography',
      'Writing & Content',
      'Creative Software',
      'Brand Development',
      'User Experience',
      'Project Management',
      'Communication Skills',
      'Client Relations',
      'Other'
    ]
  },
  'operations': {
    name: 'Operations & Management',
    categories: [
      'Operations Management',
      'Supply Chain',
      'Quality Management',
      'Process Improvement',
      'Team Leadership',
      'Strategic Planning',
      'Budget Management',
      'Vendor Relations',
      'Analytics & Reporting',
      'Communication Skills',
      'Project Management',
      'Other'
    ]
  },
  'construction': {
    name: 'Construction & Architecture',
    categories: [
      'Construction Methods',
      'Project Management',
      'Design & Planning',
      'Safety Management',
      'Building Codes',
      'Construction Software',
      'Materials Knowledge',
      'Quality Control',
      'Team Leadership',
      'Communication Skills',
      'Cost Estimation',
      'Other'
    ]
  }
};

// Job field detection function
const detectJobField = (skills: any[], jobTitle: string = '', summary: string = ''): string => {
  const allText = `${jobTitle} ${summary} ${skills.map(s => s.skill_name || s.name || '').join(' ')}`.toLowerCase();
  
  // Healthcare indicators
  const healthcareKeywords = [
    'doctor', 'physician', 'nurse', 'medical', 'clinical', 'patient', 'hospital', 
    'surgery', 'diagnosis', 'treatment', 'medicine', 'healthcare', 'cardiology',
    'neurology', 'oncology', 'pediatrics', 'radiology', 'anesthesia', 'emergency',
    'md', 'rn', 'pharmd', 'dds', 'therapy', 'rehabilitation', 'dental', 'pharmacy'
  ];
  
  // Technology indicators
  const techKeywords = [
    'software', 'developer', 'programmer', 'javascript', 'python', 'react', 'angular',
    'java', 'coding', 'programming', 'web development', 'mobile app', 'database',
    'cloud', 'aws', 'azure', 'devops', 'api', 'frontend', 'backend', 'fullstack'
  ];
  
  // Engineering indicators
  const engineeringKeywords = [
    'engineer', 'engineering', 'mechanical', 'electrical', 'civil', 'chemical',
    'aerospace', 'industrial', 'autocad', 'solidworks', 'design', 'manufacturing',
    'construction', 'structural', 'thermal', 'systems'
  ];
  
  // Finance indicators
  const financeKeywords = [
    'finance', 'accounting', 'accountant', 'financial', 'analyst', 'banking',
    'investment', 'audit', 'tax', 'budget', 'cpa', 'cfa', 'treasury', 'risk',
    'portfolio', 'trading', 'economics', 'bookkeeping'
  ];
  
  // Marketing indicators
  const marketingKeywords = [
    'marketing', 'sales', 'digital marketing', 'seo', 'sem', 'social media',
    'advertising', 'brand', 'campaign', 'content', 'copywriting', 'analytics',
    'lead generation', 'customer acquisition', 'market research'
  ];
  
  // Education indicators
  const educationKeywords = [
    'teacher', 'professor', 'education', 'teaching', 'curriculum', 'instructor',
    'academic', 'school', 'university', 'training', 'learning', 'pedagogy',
    'assessment', 'classroom', 'student'
  ];
  
  // Legal indicators
  const legalKeywords = [
    'lawyer', 'attorney', 'legal', 'law', 'litigation', 'contract', 'compliance',
    'paralegal', 'court', 'case', 'counsel', 'bar', 'juris', 'legal research',
    'regulatory', 'intellectual property'
  ];
  
  // Creative indicators
  const creativeKeywords = [
    'designer', 'creative', 'graphic', 'ui/ux', 'photoshop', 'illustrator',
    'creative director', 'art', 'visual', 'branding', 'photography', 'video',
    'animation', 'multimedia', 'adobe'
  ];
  
  // Operations indicators
  const operationsKeywords = [
    'operations', 'manager', 'management', 'supply chain', 'logistics', 'process',
    'quality', 'lean', 'six sigma', 'project management', 'business analyst',
    'operations manager', 'plant manager'
  ];
  
  // Construction indicators
  const constructionKeywords = [
    'construction', 'architect', 'builder', 'contractor', 'project manager',
    'site manager', 'building', 'infrastructure', 'renovation', 'blueprint',
    'construction management', 'safety', 'surveyor'
  ];
  
  // Count matches for each field
  const fieldScores = {
    healthcare: healthcareKeywords.filter(keyword => allText.includes(keyword)).length,
    technology: techKeywords.filter(keyword => allText.includes(keyword)).length,
    engineering: engineeringKeywords.filter(keyword => allText.includes(keyword)).length,
    finance: financeKeywords.filter(keyword => allText.includes(keyword)).length,
    marketing: marketingKeywords.filter(keyword => allText.includes(keyword)).length,
    education: educationKeywords.filter(keyword => allText.includes(keyword)).length,
    legal: legalKeywords.filter(keyword => allText.includes(keyword)).length,
    creative: creativeKeywords.filter(keyword => allText.includes(keyword)).length,
    operations: operationsKeywords.filter(keyword => allText.includes(keyword)).length,
    construction: constructionKeywords.filter(keyword => allText.includes(keyword)).length,
  };
  
  // Find the field with the highest score
  const maxScore = Math.max(...Object.values(fieldScores));
  const detectedField = Object.entries(fieldScores).find(([field, score]) => score === maxScore)?.[0];
  
  // Return detected field if confidence is high enough, otherwise default to technology
  return maxScore >= 2 ? detectedField || 'technology' : 'technology';
};

// Fixed skill categorization function with priority-based matching
const categorizeSkill = (skillName: string, jobField: string) => {
  const lowerSkillName = skillName.toLowerCase().trim();
  
  // Technology skills with priority order (most specific first)
  const techSkills = {
    'AI & Machine Learning': [
      'ai', 'artificial intelligence', 'machine learning', 'deep learning',
      'neural networks', 'tensorflow', 'pytorch', 'keras', 'scikit-learn',
      'pandas', 'numpy', 'matplotlib', 'seaborn', 'plotly', 'streamlit',
      'nltk', 'spacy', 'nlp', 'chatbot', 'voice assistant', 'natural language processing'
    ],
    'Data Science & Analytics': [
      'data science', 'data analysis', 'data visualization', 'data engineering',
      'data mining', 'data warehousing', 'data modeling', 'data cleaning',
      'data integration', 'data transformation', 'data architecture', 'data governance'
    ],
    'Frontend Development': [
      'react', 'vue', 'angular', 'svelte', 'next.js', 'nuxt.js', 'gatsby',
      'webpack', 'vite', 'parcel', 'rollup', 'babel', 'eslint', 'prettier',
      'storybook', 'styled-components', 'emotion', 'sass', 'scss', 'less',
      'bootstrap', 'tailwind', 'tailwindcss', 'material ui', 'chakra ui',
      'ant design', 'jquery', 'alpine.js', 'ember.js', 'backbone.js'
    ],
    'Backend Development': [
      'node.js', 'nodejs', 'express', 'express.js', 'nest.js', 'nestjs',
      'django', 'flask', 'fastapi', 'spring', 'spring boot', 'laravel',
      'codeigniter', 'symfony', 'ruby on rails', 'rails', 'asp.net',
      '.net core', 'phoenix', 'gin', 'fiber', 'echo', 'beego'
    ],
    'Mobile Development': [
      'react native', 'flutter', 'ionic', 'cordova', 'phonegap',
      'xamarin', 'native script', 'swift', 'objective-c', 'kotlin',
      'java android', 'android development', 'ios development',
      'mobile development', 'app development', 'hybrid apps',
      'progressive web apps', 'pwa'
    ],
    'Programming Languages': [
      'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'php',
      'ruby', 'go', 'rust', 'scala', 'r', 'matlab', 'perl', 'lua',
      'dart', 'elixir', 'haskell', 'clojure', 'f#', 'assembly',
      'cobol', 'fortran', 'pascal', 'delphi', 'vb.net', 'powershell', 'c'
    ],
    'Databases': [
      'mysql', 'postgresql', 'postgres', 'mongodb', 'redis', 'sqlite',
      'oracle', 'sql server', 'mariadb', 'cassandra', 'dynamodb',
      'elasticsearch', 'solr', 'neo4j', 'couchdb', 'firebase',
      'firestore', 'realm', 'couchbase', 'influxdb', 'clickhouse',
      'snowflake', 'bigquery', 'redshift', 'athena', 'sql', 'nosql', 'supabase'
    ],
    'Cloud Services': [
      'aws', 'amazon web services', 'azure', 'microsoft azure', 'gcp', 
      'google cloud', 'google cloud platform', 'heroku', 'digitalocean',
      'linode', 'vultr', 'cloudflare', 'netlify', 'vercel', 'firebase',
      'supabase', 'planetscale', 'railway', 'render', 'fly.io'
    ],
    'DevOps': [
      'git', 'github', 'gitlab', 'bitbucket', 'docker', 'kubernetes', 'k8s',
      'jenkins', 'travis ci', 'circle ci', 'github actions', 'gitlab ci',
      'ansible', 'terraform', 'vagrant', 'chef', 'puppet', 'saltstack',
      'nginx', 'apache', 'haproxy', 'microservices', 'ci/cd', 'devops'
    ],
    'Testing & QA': [
      'testing', 'qa', 'quality assurance', 'manual testing', 'automation testing',
      'selenium', 'cypress', 'playwright', 'puppeteer', 'jest', 'mocha',
      'chai', 'jasmine', 'junit', 'testng', 'robot framework'
    ],
    'Tools & Platforms': [
      'vs code', 'visual studio', 'intellij', 'eclipse', 'sublime text',
      'atom', 'vim', 'emacs', 'webstorm', 'pycharm', 'phpstorm',
      'android studio', 'xcode', 'postman', 'insomnia', 'swagger',
      'jira', 'confluence', 'trello', 'asana', 'slack', 'notion'
    ],
    'Soft Skills': [
      'leadership', 'teamwork', 'communication', 'problem solving',
      'critical thinking', 'time management', 'project management',
      'adaptability', 'creativity', 'attention to detail', 'collaboration'
    ]
  };

  // HTML and CSS are special cases - they go to Frontend if it's a tech field
  if ((lowerSkillName === 'html' || lowerSkillName === 'css') && jobField === 'technology') {
    return 'Frontend Development';
  }

  // Universal soft skills that apply to all fields
  const universalSoftSkills = [
    'leadership', 'teamwork', 'communication', 'problem solving', 'critical thinking',
    'time management', 'project management', 'adaptability', 'creativity',
    'attention to detail', 'organization', 'presentation', 'negotiation',
    'collaboration', 'analytical thinking', 'web api'
  ];

  // Check universal soft skills first
  if (universalSoftSkills.some(skill => lowerSkillName === skill || lowerSkillName.includes(skill))) {
    return jobField === 'technology' ? 'Soft Skills' : 'Communication Skills';
  }

  // Field-specific categorization with exact matching priority
  if (jobField === 'technology') {
    // Use priority order - check more specific categories first
    const priorityOrder = [
      'AI & Machine Learning',
      'Data Science & Analytics', 
      'Frontend Development',
      'Backend Development',
      'Mobile Development',
      'Databases',
      'Cloud Services',
      'DevOps',
      'Testing & QA',
      'Tools & Platforms',
      'Programming Languages' // Check this last as it's most general
    ];

    for (const category of priorityOrder) {
      const skills = techSkills[category] || [];
      // First try exact match
      if (skills.includes(lowerSkillName)) {
        return category;
      }
      // Then try partial match for longer skills
      if (skills.some(skill => skill.length > 3 && lowerSkillName.includes(skill))) {
        return category;
      }
    }
  }

  // Healthcare skills
  const healthcareSkills = {
    'Clinical Skills': [
      'patient assessment', 'diagnosis', 'treatment planning', 'clinical examination',
      'vital signs', 'medical history', 'physical examination', 'patient monitoring'
    ],
    'Medical Specialties': [
      'cardiology', 'neurology', 'oncology', 'pediatrics', 'surgery', 'radiology',
      'anesthesia', 'emergency medicine', 'internal medicine', 'dermatology'
    ],
    'Patient Care': [
      'patient communication', 'bedside manner', 'patient education', 'comfort care',
      'discharge planning', 'family support', 'cultural sensitivity', 'empathy'
    ]
  };

  // Engineering skills
  const engineeringSkills = {
    'Engineering Disciplines': [
      'mechanical engineering', 'electrical engineering', 'civil engineering',
      'chemical engineering', 'software engineering', 'aerospace engineering'
    ],
    'Design & Modeling': [
      'autocad', 'solidworks', 'catia', '3d modeling', 'cad', 'simulation',
      'finite element analysis', 'computational fluid dynamics', 'illustrator'
    ]
  };

  // Finance skills
  const financeSkills = {
    'Financial Analysis': [
      'financial modeling', 'valuation', 'ratio analysis', 'forecasting',
      'budgeting', 'variance analysis', 'cash flow analysis'
    ],
    'Accounting Principles': [
      'gaap', 'ifrs', 'bookkeeping', 'journal entries', 'financial statements',
      'accounts payable', 'accounts receivable', 'reconciliation'
    ]
  };

  // Apply field-specific categorization for non-tech fields
  let fieldSkills = {};
  switch (jobField) {
    case 'healthcare':
      fieldSkills = healthcareSkills;
      break;
    case 'engineering':
      fieldSkills = engineeringSkills;
      break;
    case 'finance':
      fieldSkills = financeSkills;
      break;
  }

  for (const [category, skills] of Object.entries(fieldSkills)) {
    if (skills.some(skill => lowerSkillName === skill || lowerSkillName.includes(skill))) {
      return category;
    }
  }

  return 'Other';
};

interface Skill {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
}

interface CustomSkill {
  id: string;
  name: string;
  category: string | null;
  isCustom: true;
}

interface CandidateSkill {
  id?: string;
  skill_name: string;
  skill_source: string;
  proficiency: number;
}

interface SkillsFormProps {
  onBack: () => void;
  onSubmit: () => void;
  availableSkills?: Skill[];
}

export default function SkillsForm({
  onBack,
  onSubmit,
  availableSkills = []
}: SkillsFormProps) {
  const { watch, setValue } = useFormContext<BasicInfoFormValues>();
  const [customSkills, setCustomSkills] = useState<CustomSkill[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [categoryInputs, setCategoryInputs] = useState<Record<string, string>>({});
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [draggedCategory, setDraggedCategory] = useState<string | null>(null);
  const [hasAutoDetected, setHasAutoDetected] = useState(false);
  
  // Watch form values
  const jobField = watch('job_field');
  const selectedSkillIds = watch('skills') || [];
  const candidateSkills = watch('candidate_skills') || [];
  const jobTitle = watch('job_title') || '';
  const summary = watch('summary') || '';
  
  console.log('🔍 SkillsForm - Current form values:', {
    jobField,
    selectedSkillIds,
    candidateSkills,
    jobTitle,
    summary
  });
  
  // Auto-detect job field when candidate skills are loaded
  useEffect(() => {
    if (candidateSkills.length > 0 && !jobField && !hasAutoDetected) {
      const detectedField = detectJobField(candidateSkills, jobTitle, summary);
      console.log('🎯 Auto-detected job field:', detectedField);
      setValue('job_field', detectedField);
      setHasAutoDetected(true);
    }
  }, [candidateSkills, jobTitle, summary, jobField, hasAutoDetected, setValue]);
  
  // Get current job field configuration
  const currentJobField = JOB_FIELDS[jobField] || JOB_FIELDS.technology;
  const [categoryOrder, setCategoryOrder] = useState<string[]>(currentJobField.categories);

  // Update category order when job field changes
  useEffect(() => {
    setCategoryOrder(currentJobField.categories);
    setExpandedCategories({});
  }, [jobField, currentJobField.categories]);

  // Convert extracted candidate_skills to skill objects with job-field-aware categorization
  const extractedSkills = useMemo(() => {
    console.log('🔄 Processing candidate skills:', candidateSkills);
    
    return candidateSkills.map((candidateSkill: CandidateSkill, index: number) => {
      const rawSkillName = candidateSkill.skill_name || `Skill ${index + 1}`;
      
      // Use job-field-aware categorization
      const category = categorizeSkill(rawSkillName, jobField || 'technology');
      
      // Create consistent ID format
      const skillId = candidateSkill.id || `extracted-skill-${index}`;
      
      const extractedSkill = {
        id: skillId,
        name: rawSkillName,
        category: category,
        description: `Proficiency: ${candidateSkill.proficiency || 50}%`
      };
      
      console.log('✅ Processed skill:', extractedSkill);
      return extractedSkill;
    });
  }, [candidateSkills, jobField]);
  
  // Combine available skills, custom skills, and extracted skills
  const allSkills = useMemo(() => {
    const combined = [...availableSkills];
    
    customSkills.forEach(customSkill => {
      if (!combined.some(skill => skill.name.toLowerCase() === customSkill.name.toLowerCase())) {
        combined.push(customSkill);
      }
    });
    
    extractedSkills.forEach(extractedSkill => {
      if (!combined.some(skill => skill.name.toLowerCase() === extractedSkill.name.toLowerCase())) {
        combined.push(extractedSkill);
      }
    });
    
    console.log('📦 All skills combined:', combined);
    return combined;
  }, [availableSkills, customSkills, extractedSkills]);
  
  // Auto-select extracted skills with proper ID mapping
  useEffect(() => {
    if (extractedSkills.length > 0) {
      const extractedSkillIds = extractedSkills.map(skill => skill.id);
      const currentSelectedIds = selectedSkillIds || [];
      
      console.log('🔗 Matching skill IDs:', {
        extractedSkillIds,
        currentSelectedIds
      });
      
      // Find missing extracted skills
      const missingExtractedIds = extractedSkillIds.filter(id => !currentSelectedIds.includes(id));
      
      if (missingExtractedIds.length > 0) {
        const newSelectedIds = [...currentSelectedIds, ...missingExtractedIds];
        console.log('✅ Auto-selecting skills:', newSelectedIds);
        setValue('skills', newSelectedIds);
      }
    }
  }, [extractedSkills, selectedSkillIds, setValue]);
  
  const selectedSkills = useMemo(() => {
    const selected = allSkills.filter(skill => selectedSkillIds.includes(skill.id));
    console.log('🎯 Selected skills:', selected);
    return selected;
  }, [allSkills, selectedSkillIds]);

  // Group skills by category
  const skillsByCategory = useMemo(() => {
    const grouped: Record<string, Skill[]> = {};
    
    categoryOrder.forEach(category => {
      grouped[category] = [];
    });
    
    allSkills.forEach(skill => {
      // Re-categorize skill based on current job field to ensure consistency
      const category = categorizeSkill(skill.name, jobField || 'technology');
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push({
        ...skill,
        category // Update the category
      });
    });
    
    return grouped;
  }, [allSkills, categoryOrder, jobField]);

  // Fixed selectedSkillsByCategory with re-categorization
  const selectedSkillsByCategory = useMemo(() => {
    const grouped: Record<string, Skill[]> = {};
    
    selectedSkills.forEach(skill => {
      // Re-categorize skill based on current job field
      const category = categorizeSkill(skill.name, jobField || 'technology');
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push({
        ...skill,
        category // Update the category
      });
    });
    
    return grouped;
  }, [selectedSkills, jobField]);

  const orderedCategoriesWithSkills = useMemo(() => {
    return categoryOrder.filter(category => 
      selectedSkillsByCategory[category] && selectedSkillsByCategory[category].length > 0
    );
  }, [categoryOrder, selectedSkillsByCategory]);

  const addSkill = (skill: Skill | CustomSkill) => {
    const newSelectedIds = [...selectedSkillIds, skill.id];
    setValue('skills', newSelectedIds);
    
    if ('isCustom' in skill && skill.isCustom) {
      const newCandidateSkill = {
        id: skill.id,
        skill_name: skill.name,
        skill_source: 'manual',
        proficiency: 50
      };
      setValue('candidate_skills', [...candidateSkills, newCandidateSkill]);
    }
  };

  const removeSkill = (skillId: string) => {
    const newSelectedIds = selectedSkillIds.filter(id => id !== skillId);
    setValue('skills', newSelectedIds);
    
    // Remove from candidate_skills if it's an extracted or custom skill
    const skillToRemove = allSkills.find(skill => skill.id === skillId);
    if (skillToRemove) {
      const newCandidateSkills = candidateSkills.filter(
        (candidateSkill: CandidateSkill) => {
          // Handle both cases: with and without IDs
          if (candidateSkill.id) {
            return candidateSkill.id !== skillId;
          }
          // Fallback: match by skill name
          return candidateSkill.skill_name !== skillToRemove.name;
        }
      );
      setValue('candidate_skills', newCandidateSkills);
    }
    
    // Remove from custom skills if it's custom
    if (skillId.startsWith('custom-')) {
      setCustomSkills(prev => prev.filter(skill => skill.id !== skillId));
    }
  };

  const addCustomSkill = (category: string, skillName: string) => {
    if (!skillName.trim()) return;
    
    const finalCategory = categorizeSkill(skillName.trim(), jobField || 'technology');
    const useCategory = finalCategory !== 'Other' ? finalCategory : category;
    
    const customSkillId = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const customSkill: CustomSkill = {
      id: customSkillId,
      name: skillName.trim(),
      category: useCategory,
      isCustom: true
    };
    
    setCustomSkills(prev => [...prev, customSkill]);
    addSkill(customSkill);
    setCategoryInputs(prev => ({ ...prev, [category]: '' }));
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleJobFieldChange = (newJobField: string) => {
    setValue('job_field', newJobField);
    setHasAutoDetected(true);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, category: string) => {
    setDraggedCategory(category);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetCategory: string) => {
    e.preventDefault();
    
    if (!draggedCategory || draggedCategory === targetCategory) {
      setDraggedCategory(null);
      return;
    }

    const newOrder = [...categoryOrder];
    const draggedIndex = newOrder.indexOf(draggedCategory);
    const targetIndex = newOrder.indexOf(targetCategory);
    
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedCategory);
    
    setCategoryOrder(newOrder);
    setDraggedCategory(null);
  };

  const resetCategoryOrder = () => {
    setCategoryOrder(currentJobField.categories);
    setIsReorderMode(false);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Skills</h2>
        <p className="text-muted-foreground">
          Select your job field and add relevant skills organized by category.
        </p>
      </div>

      {/* Job Field Selection */}
      <div className="p-4 border rounded-lg bg-blue-50">
        <Label htmlFor="job-field" className="text-base font-medium mb-3 block">
          <Briefcase className="h-4 w-4 inline mr-2" />
          Select Your Job Field
          {hasAutoDetected && (
            <Badge variant="secondary" className="ml-2 text-xs">
              Auto-detected
            </Badge>
          )}
        </Label>
        <Select value={jobField || 'technology'} onValueChange={handleJobFieldChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose your job field" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(JOB_FIELDS).map(([key, field]) => (
              <SelectItem key={key} value={key}>
                {field.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground mt-2">
          This helps categorize your skills appropriately for your field
          {hasAutoDetected && " (automatically detected from your CV)"}
        </p>
      </div>

      {/* Selected Skills Summary */}
      {selectedSkills.length > 0 && (
        <div className="p-4 border rounded-lg bg-green-50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Selected Skills ({selectedSkills.length})</h3>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsReorderMode(!isReorderMode)}
                className="text-xs"
              >
                <ArrowUpDown className="h-3 w-3 mr-1" />
                {isReorderMode ? 'Done' : 'Reorder'}
              </Button>
              {isReorderMode && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={resetCategoryOrder}
                  className="text-xs"
                >
                  Reset Order
                </Button>
              )}
            </div>
          </div>
          
          <div className="space-y-3">
            {orderedCategoriesWithSkills.map((category) => {
              const skills = selectedSkillsByCategory[category] || [];
              return (
                <div 
                  key={category} 
                  className={`space-y-1 ${isReorderMode ? 'cursor-move border rounded p-2 bg-white' : ''}`}
                  draggable={isReorderMode}
                  onDragStart={(e) => handleDragStart(e, category)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, category)}
                >
                  <div className="flex items-center gap-2">
                    {isReorderMode && (
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    )}
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      {category}
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <Badge
                        key={skill.id}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {skill.name}
                        {!isReorderMode && (
                          <button
                            type="button"
                            onClick={() => removeSkill(skill.id)}
                            className="text-muted-foreground hover:text-destructive ml-1"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Skills by Category */}
      {!isReorderMode && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Add Skills for {currentJobField.name}</h3>
          
          {categoryOrder.map((category) => {
            const categorySkills = skillsByCategory[category] || [];
            const availableCategorySkills = categorySkills.filter(skill => 
              !selectedSkillIds.includes(skill.id)
            );
            const isExpanded = expandedCategories[category];
            const hasSkills = availableCategorySkills.length > 0;
            
            return (
              <div key={category} className="border rounded-lg">
                <button
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{category}</span>
                    {hasSkills && (
                      <Badge variant="outline" className="text-xs">
                        {availableCategorySkills.length} available
                      </Badge>
                    )}
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                
                {isExpanded && (
                  <div className="p-4 border-t space-y-4">
                    {/* Add custom skill input */}
                    <div className="flex gap-2">
                      <Input
                        value={categoryInputs[category] || ''}
                        onChange={(e) => setCategoryInputs(prev => ({
                          ...prev,
                          [category]: e.target.value
                        }))}
                        placeholder={`Add ${category.toLowerCase()} skill...`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addCustomSkill(category, categoryInputs[category] || '');
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => addCustomSkill(category, categoryInputs[category] || '')}
                        disabled={!categoryInputs[category]?.trim()}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                    
                    {/* Available skills in this category */}
                    {availableCategorySkills.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Available skills:</p>
                        <div className="flex flex-wrap gap-2">
                          {availableCategorySkills.map((skill) => (
                            <Button
                              key={skill.id}
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addSkill(skill)}
                              className="text-xs"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              {skill.name}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {selectedSkills.length === 0 && (
        <div className="text-center py-8 border rounded-lg border-dashed">
          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No skills selected yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Choose your job field above and expand categories to add relevant skills
          </p>
        </div>
      )}

      <div className="flex justify-between pt-6">
        <Button type="button" variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={onSubmit}>
          Complete Profile
        </Button>
      </div>
    </div>
  );
}
