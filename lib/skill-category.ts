// Gemini-powered skill categorization utility
import { GoogleGenerativeAI } from "@google/generative-ai";

class GeminiSkillCategorizer {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  // Single skill categorization
  async categorizeSkill(skill, jobField, categories) {
    const prompt = `
You are a professional skills categorization expert. 

Task: Categorize the skill "${skill}" for a ${jobField} professional.

Available categories:
${categories.map((cat, index) => `${index + 1}. ${cat}`).join('\n')}

Rules:
- Return ONLY the exact category name from the list above
- Consider the context of ${jobField} field
- If unsure, choose the most relevant category
- Do not add explanations or additional text

Skill to categorize: "${skill}"
Category:`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const category = response.text().trim();
      
      // Validate that the response is one of our categories
      const validCategory = categories.find(cat => 
        cat.toLowerCase() === category.toLowerCase()
      );
      
      return validCategory || 'Other';
    } catch (error) {
      console.error('Error categorizing skill:', error);
      return 'Other';
    }
  }

  // Batch skill categorization (more efficient)
  async categorizeSkillsBatch(skills, jobField, categories) {
    const skillsList = skills.map((skill, index) => 
      `${index + 1}. ${typeof skill === 'string' ? skill : skill.name || skill.skill_name}`
    ).join('\n');

    const prompt = `
You are a professional skills categorization expert.

Task: Categorize these skills for a ${jobField} professional.

Available categories:
${categories.map((cat, index) => `${index + 1}. ${cat}`).join('\n')}

Skills to categorize:
${skillsList}

Instructions:
- Return the results in this exact JSON format:
- For each skill, return: {"skillIndex": number, "skillName": "exact skill name", "category": "exact category name"}
- Choose the most appropriate category from the list above
- If uncertain, use "Other"
- Return valid JSON only, no additional text

Example format:
[
  {"skillIndex": 1, "skillName": "JavaScript", "category": "Programming Languages"},
  {"skillIndex": 2, "skillName": "Leadership", "category": "Soft Skills"}
]

JSON Response:`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let jsonText = response.text().trim();
      
      // Clean up the response (remove markdown formatting if present)
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      const categorizations = JSON.parse(jsonText);
      
      // Validate and map results
      return skills.map((skill, index) => {
        const skillName = typeof skill === 'string' ? skill : skill.name || skill.skill_name;
        const categorization = categorizations.find(cat => 
          cat.skillIndex === index + 1 || 
          cat.skillName.toLowerCase() === skillName.toLowerCase()
        );
        
        const category = categorization ? 
          categories.find(cat => cat.toLowerCase() === categorization.category.toLowerCase()) || 'Other' 
          : 'Other';
          
        return {
          skill: skillName,
          category: category,
          originalData: skill
        };
      });
    } catch (error) {
      console.error('Error in batch categorization:', error);
      // Fallback to individual categorization
      const results = [];
      for (const skill of skills) {
        const skillName = typeof skill === 'string' ? skill : skill.name || skill.skill_name;
        const category = await this.categorizeSkill(skillName, jobField, categories);
        results.push({
          skill: skillName,
          category: category,
          originalData: skill
        });
      }
      return results;
    }
  }

  // Enhanced categorization with confidence scores
  async categorizeSkillsWithConfidence(skills, jobField, categories) {
    const skillsList = skills.map((skill, index) => 
      `${index + 1}. ${typeof skill === 'string' ? skill : skill.name || skill.skill_name}`
    ).join('\n');

    const prompt = `
You are a professional skills categorization expert.

Task: Categorize these skills for a ${jobField} professional with confidence scores.

Available categories:
${categories.map((cat, index) => `${index + 1}. ${cat}`).join('\n')}

Skills to categorize:
${skillsList}

Instructions:
- Return results in JSON format with confidence scores (1-100)
- Higher confidence = more certain about the categorization
- Format: {"skillIndex": number, "skillName": "name", "category": "category", "confidence": number, "reasoning": "brief reason"}

JSON Response:`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let jsonText = response.text().trim();
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      const categorizations = JSON.parse(jsonText);
      
      return skills.map((skill, index) => {
        const skillName = typeof skill === 'string' ? skill : skill.name || skill.skill_name;
        const categorization = categorizations.find(cat => 
          cat.skillIndex === index + 1 || 
          cat.skillName.toLowerCase() === skillName.toLowerCase()
        );
        
        return {
          skill: skillName,
          category: categorization?.category || 'Other',
          confidence: categorization?.confidence || 50,
          reasoning: categorization?.reasoning || 'Default categorization',
          originalData: skill
        };
      });
    } catch (error) {
      console.error('Error in confidence categorization:', error);
      return this.categorizeSkillsBatch(skills, jobField, categories);
    }
  }

  // Auto-detect job field from skills
  async detectJobField(skills, availableFields) {
    const skillsList = skills.map(skill => 
      typeof skill === 'string' ? skill : skill.name || skill.skill_name
    ).join(', ');

    const prompt = `
You are a career field detection expert.

Task: Analyze these skills and determine the most likely job field.

Skills: ${skillsList}

Available job fields:
${Object.entries(availableFields).map(([key, field]) => 
  `${key}: ${field.name}`
).join('\n')}

Instructions:
- Return ONLY the field key (e.g., 'technology', 'healthcare', etc.)
- Choose the field that best matches the majority of skills
- Consider skill combinations and patterns
- If unclear, choose the most general applicable field

Job field key:`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const detectedField = response.text().trim().toLowerCase();
      
      // Validate the response
      return availableFields[detectedField] ? detectedField : 'technology';
    } catch (error) {
      console.error('Error detecting job field:', error);
      return 'technology';
    }
  }

  // Smart skill suggestions based on existing skills
  async suggestRelatedSkills(existingSkills, jobField, limit = 10) {
    const skillsList = existingSkills.map(skill => 
      typeof skill === 'string' ? skill : skill.name || skill.skill_name
    ).join(', ');

    const prompt = `
You are a career development expert.

Task: Suggest ${limit} related skills that would complement these existing skills for a ${jobField} professional.

Existing skills: ${skillsList}

Instructions:
- Suggest skills that naturally complement the existing ones
- Focus on skills that would enhance career prospects in ${jobField}
- Return as a simple JSON array of skill names
- Include both technical and soft skills as appropriate
- Avoid duplicating existing skills

Example format: ["Skill 1", "Skill 2", "Skill 3"]

JSON Response:`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let jsonText = response.text().trim();
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      const suggestions = JSON.parse(jsonText);
      return Array.isArray(suggestions) ? suggestions.slice(0, limit) : [];
    } catch (error) {
      console.error('Error suggesting skills:', error);
      return [];
    }
  }
}

// Usage examples and integration helpers
export class SkillsManager {
  constructor(geminiApiKey, jobFields) {
    this.categorizer = new GeminiSkillCategorizer(geminiApiKey);
    this.jobFields = jobFields;
  }

  // Main categorization function for your form
  async categorizeExtractedSkills(candidateSkills, jobField) {
    if (!candidateSkills || candidateSkills.length === 0) {
      return [];
    }

    const categories = this.jobFields[jobField]?.categories || this.jobFields.technology.categories;
    
    try {
      // Use batch categorization for efficiency
      const categorizedSkills = await this.categorizer.categorizeSkillsBatch(
        candidateSkills, 
        this.jobFields[jobField]?.name || 'Technology', 
        categories
      );

      // Transform to match your existing structure
      return categorizedSkills.map((item, index) => ({
        id: `extracted-skill-${index}`,
        name: item.skill,
        category: item.category,
        description: item.originalData.proficiency ? 
          `Proficiency: ${item.originalData.proficiency}%` : 
          'Extracted from CV',
        isExtracted: true,
        originalData: item.originalData
      }));
    } catch (error) {
      console.error('Error categorizing skills:', error);
      // Fallback to your existing manual categorization
      return candidateSkills.map((skill, index) => ({
        id: `extracted-skill-${index}`,
        name: skill.skill_name || `Skill ${index + 1}`,
        category: 'Other',
        description: `Proficiency: ${skill.proficiency || 50}%`,
        isExtracted: true,
        originalData: skill
      }));
    }
  }

  // Auto-detect job field with Gemini
  async autoDetectJobField(candidateSkills, jobTitle = '', summary = '') {
    try {
      // Combine all text sources
      const allSkills = candidateSkills.map(skill => skill.skill_name || '');
      const combinedSkills = [...allSkills, jobTitle, summary].filter(Boolean);
      
      if (combinedSkills.length === 0) {
        return 'technology';
      }

      return await this.categorizer.detectJobField(combinedSkills, this.jobFields);
    } catch (error) {
      console.error('Error auto-detecting job field:', error);
      return 'technology';
    }
  }

  // Get skill suggestions for incomplete profiles
  async getSkillSuggestions(existingSkills, jobField, limit = 5) {
    try {
      return await this.categorizer.suggestRelatedSkills(existingSkills, jobField, limit);
    } catch (error) {
      console.error('Error getting skill suggestions:', error);
      return [];
    }
  }

  // Categorize a single custom skill
  async categorizeCustomSkill(skillName, jobField) {
    const categories = this.jobFields[jobField]?.categories || this.jobFields.technology.categories;
    
    try {
      return await this.categorizer.categorizeSkill(
        skillName, 
        this.jobFields[jobField]?.name || 'Technology', 
        categories
      );
    } catch (error) {
      console.error('Error categorizing custom skill:', error);
      return 'Other';
    }
  }
}

// Export for use in your component
export default GeminiSkillCategorizer;