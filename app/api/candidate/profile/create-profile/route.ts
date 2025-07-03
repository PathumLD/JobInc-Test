// app/api/candidate/profile/create-profile/route.ts
// Updated version with UPDATE logic for existing candidates

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  exp: number;
}

// Helper function to infer skill category
function inferSkillCategory(skillName: string): string {
  const skill = skillName.toLowerCase();
  
  if (/\b(javascript|typescript|python|java|c\+\+|c#|php|ruby|go|rust|swift|kotlin|react|vue|angular|node\.?js|django|flask|spring|laravel)\b/.test(skill)) {
    return 'programming';
  }
  if (/\b(mysql|postgresql|mongodb|redis|sqlite|oracle|sql server|firebase|dynamodb|cassandra)\b/.test(skill)) {
    return 'database';
  }
  if (/\b(aws|azure|google cloud|gcp|docker|kubernetes|jenkins|git|github|gitlab|terraform|ansible)\b/.test(skill)) {
    return 'devops';
  }
  if (/\b(photoshop|illustrator|figma|sketch|ui\/ux|graphic design|adobe|design)\b/.test(skill)) {
    return 'design';
  }
  if (/\b(tableau|power bi|excel|analytics|machine learning|data analysis|pandas|numpy)\b/.test(skill)) {
    return 'analytics';
  }
  if (/\b(leadership|management|project management|agile|scrum|communication|teamwork)\b/.test(skill)) {
    return 'management';
  }
  return 'other';
}

// Optimized bulk skill processing
async function processSkillsInBulk(candidateId: string, candidateSkills: any[]) {
  console.log('🛠️ Starting bulk skills processing...');
  
  if (!candidateSkills?.length) {
    console.log('⚠️ No skills to process');
    return 0;
  }

  // Remove duplicates and validate skills
  const skillMap = new Map();
  candidateSkills.forEach((skill: any) => {
    if (skill.skill_name && skill.skill_name.trim()) {
      const key = skill.skill_name.toLowerCase().trim();
      const existing = skillMap.get(key);
      
      if (!existing || (skill.proficiency || 0) > (existing.proficiency || 0)) {
        skillMap.set(key, skill);
      }
    }
  });

  const uniqueSkills = Array.from(skillMap.values());
  console.log(`📊 Processing ${uniqueSkills.length} unique skills...`);

  // Get all existing skills at once
  const skillNames = uniqueSkills.map(s => s.skill_name.trim());
  const existingSkills = await prisma.skill.findMany({
    where: {
      name: {
        in: skillNames,
        mode: 'insensitive'
      }
    }
  });

  // Create a map of existing skills
  const existingSkillsMap = new Map();
  existingSkills.forEach(skill => {
    existingSkillsMap.set(skill.name.toLowerCase(), skill);
  });

  // Identify skills that need to be created
  const skillsToCreate = uniqueSkills.filter(skillData => 
    !existingSkillsMap.has(skillData.skill_name.toLowerCase().trim())
  );

  // Bulk create new skills
  let newSkills: any[] = [];
  if (skillsToCreate.length > 0) {
    console.log(`✨ Creating ${skillsToCreate.length} new skills in bulk...`);
    
    const newSkillsData = skillsToCreate.map(skillData => ({
      name: skillData.skill_name.trim(),
      category: inferSkillCategory(skillData.skill_name),
      is_active: true
    }));

    await prisma.skill.createMany({
      data: newSkillsData,
      skipDuplicates: true
    });

    // Fetch the newly created skills
    newSkills = await prisma.skill.findMany({
      where: {
        name: {
          in: skillsToCreate.map(s => s.skill_name.trim()),
          mode: 'insensitive'
        }
      }
    });

    console.log(`✅ Created ${newSkills.length} new skills`);
  }

  // Combine existing and new skills
  const allSkills = [...existingSkills, ...newSkills];
  const skillsLookup = new Map();
  allSkills.forEach(skill => {
    skillsLookup.set(skill.name.toLowerCase(), skill);
  });

  // Clear existing candidate skills first (in case of update)
  await prisma.candidateSkill.deleteMany({
    where: { candidate_id: candidateId }
  });

  // Prepare candidate skills data
  const candidateSkillsData = uniqueSkills.map(skillData => {
    const skill = skillsLookup.get(skillData.skill_name.toLowerCase().trim());
    if (!skill) {
      console.warn(`⚠️ Skill not found: ${skillData.skill_name}`);
      return null;
    }

    return {
      candidate_id: candidateId,
      skill_id: skill.id,
      skill_source: skillData.skill_source || 'manual',
      proficiency: Math.min(Math.max(skillData.proficiency || 60, 0), 100),
      years_of_experience: Math.min(Math.max(skillData.years_of_experience || 0, 0), 50),
      source_title: skillData.source_title?.substring(0, 200) || null,
      source_company: skillData.source_company?.substring(0, 200) || null,
      source_institution: skillData.source_institution?.substring(0, 200) || null,
      source_authority: skillData.source_authority?.substring(0, 200) || null,
      source_type: skillData.source_type || 'manual',
    };
  }).filter(Boolean);

  // Bulk create candidate skills
  if (candidateSkillsData.length > 0) {
    console.log(`🔗 Creating ${candidateSkillsData.length} candidate skill relationships...`);
    await prisma.candidateSkill.createMany({
      data: candidateSkillsData,
      skipDuplicates: true
    });
    console.log(`✅ Successfully created ${candidateSkillsData.length} candidate skills`);
  }

  return candidateSkillsData.length;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Profile creation API called');

    // 1. Authenticate user
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    let payload: JWTPayload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
    } catch (error) {
      console.error('❌ Token verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    if (payload.role !== 'candidate') {
      return NextResponse.json(
        { error: 'Access denied. Only candidates can create profiles.' },
        { status: 403 }
      );
    }

    // 2. Parse request body - No CV files needed since they're uploaded separately
    const { profileData } = await request.json();

    if (!profileData) {
      return NextResponse.json(
        { error: 'Profile data is required' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!profileData.first_name || !profileData.last_name) {
      return NextResponse.json(
        { error: 'First name and last name are required' },
        { status: 400 }
      );
    }

    console.log('📋 Profile data received:', {
      name: `${profileData.first_name} ${profileData.last_name}`,
      skills: profileData.candidate_skills?.length || 0
    });

    // 3. Get primary resume URL from existing uploaded resumes
    const primaryResume = await prisma.resume.findFirst({
      where: { 
        candidate_id: payload.userId,
        is_primary: true 
      }
    });

    // 4. Create/Update profile in database transaction
    const result = await prisma.$transaction(async (tx) => {
      try {
        // Check if candidate already exists
        const existingCandidate = await tx.candidate.findUnique({
          where: { user_id: payload.userId }
        });

        let candidate;
        let isUpdate = false;
        
        if (existingCandidate) {
          // UPDATE existing candidate with full profile data
          console.log('👤 Updating existing candidate profile...');
          isUpdate = true;
          
          candidate = await tx.candidate.update({
            where: { user_id: payload.userId },
            data: {
              first_name: profileData.first_name,
              last_name: profileData.last_name,
              phone: profileData.phone || null,
              location: profileData.location || null,
              linkedin_url: profileData.linkedin_url || null,
              github_url: profileData.github_url || null,
              portfolio_url: profileData.portfolio_url || null,
              personal_website: profileData.personal_website || null,
              bio: profileData.bio || null,
              about: profileData.about || null,
              title: profileData.title || null,
              years_of_experience: profileData.years_of_experience || 0,
              current_position: profileData.current_position || null,
              industry: profileData.industry || null,
              profile_completion_percentage: 75,
              resume_url: primaryResume?.resume_url || existingCandidate.resume_url,
              updated_at: new Date(),
            }
          });
          console.log('✅ Candidate updated:', candidate.user_id);
        } else {
          // CREATE new candidate if doesn't exist
          console.log('👤 Creating new candidate profile...');
          candidate = await tx.candidate.create({
            data: {
              user_id: payload.userId,
              first_name: profileData.first_name,
              last_name: profileData.last_name,
              phone: profileData.phone || null,
              location: profileData.location || null,
              linkedin_url: profileData.linkedin_url || null,
              github_url: profileData.github_url || null,
              portfolio_url: profileData.portfolio_url || null,
              personal_website: profileData.personal_website || null,
              bio: profileData.bio || null,
              about: profileData.about || null,
              title: profileData.title || null,
              years_of_experience: profileData.years_of_experience || 0,
              current_position: profileData.current_position || null,
              industry: profileData.industry || null,
              profile_completion_percentage: 75,
              resume_url: primaryResume?.resume_url || null,
            }
          });
          console.log('✅ Candidate created:', candidate.user_id);
        }

        // Clear existing related data if this is an update
        if (isUpdate) {
          console.log('🧹 Clearing existing related data for update...');
          await Promise.all([
            tx.workExperience.deleteMany({ where: { candidate_id: payload.userId } }),
            tx.education.deleteMany({ where: { candidate_id: payload.userId } }),
            tx.certificate.deleteMany({ where: { candidate_id: payload.userId } }),
            tx.project.deleteMany({ where: { candidate_id: payload.userId } }),
            tx.award.deleteMany({ where: { candidate_id: payload.userId } }),
            tx.volunteering.deleteMany({ where: { candidate_id: payload.userId } }),
            tx.accomplishment.deleteMany({ where: { candidate_id: payload.userId } }),
            // Note: candidateSkill is cleared in processSkillsInBulk function
          ]);
          console.log('✅ Existing related data cleared');
        }

        // Create work experiences
        if (profileData.work_experience?.length > 0) {
          console.log('💼 Creating work experiences...');
          await tx.workExperience.createMany({
            data: profileData.work_experience.map((exp: any) => ({
              candidate_id: payload.userId,
              title: exp.title,
              company: exp.company,
              employment_type: exp.employment_type || 'full_time',
              is_current: exp.is_current || false,
              start_date: new Date(exp.start_date),
              end_date: exp.end_date ? new Date(exp.end_date) : null,
              location: exp.location || null,
              description: exp.description || null,
              job_source: exp.job_source || '',
              skill_ids: exp.skill_ids || [],
              media_url: exp.media_url || '',
            }))
          });
          console.log(`✅ Created ${profileData.work_experience.length} work experiences`);
        }

        // Create education
        if (profileData.education?.length > 0) {
          console.log('🎓 Creating education records...');
          await tx.education.createMany({
            data: profileData.education.map((edu: any) => ({
              candidate_id: payload.userId,
              degree_diploma: edu.degree_diploma,
              university_school: edu.university_school,
              field_of_study: edu.field_of_study || null,
              start_date: new Date(edu.start_date),
              end_date: edu.end_date ? new Date(edu.end_date) : null,
              grade: edu.grade || null,
              activities_societies: edu.activities_societies || '',
              skill_ids: edu.skill_ids || [],
              media_url: edu.media_url || '',
            }))
          });
          console.log(`✅ Created ${profileData.education.length} education records`);
        }

        // Create certificates
        if (profileData.certificates?.length > 0) {
          console.log('📜 Creating certificates...');
          await tx.certificate.createMany({
            data: profileData.certificates.map((cert: any) => ({
              candidate_id: payload.userId,
              name: cert.name,
              issuing_authority: cert.issuing_authority,
              issue_date: cert.issue_date ? new Date(cert.issue_date) : null,
              expiry_date: cert.expiry_date ? new Date(cert.expiry_date) : null,
              credential_id: cert.credential_id || null,
              credential_url: cert.credential_url || null,
              description: cert.description || null,
              media_url: cert.media_url || null,
            }))
          });
          console.log(`✅ Created ${profileData.certificates.length} certificates`);
        }

        // Create projects
        if (profileData.projects?.length > 0) {
          console.log('🚀 Creating projects...');
          await tx.project.createMany({
            data: profileData.projects.map((proj: any) => ({
              candidate_id: payload.userId,
              name: proj.name,
              description: proj.description,
              start_date: proj.start_date ? new Date(proj.start_date) : null,
              end_date: proj.end_date ? new Date(proj.end_date) : null,
              is_current: proj.is_current || false,
              role: proj.role || null,
              responsibilities: proj.responsibilities || [],
              technologies: proj.technologies || [],
              tools: proj.tools || [],
              methodologies: proj.methodologies || [],
              is_confidential: proj.is_confidential || false,
              can_share_details: proj.can_share_details !== false,
              url: proj.url || null,
              repository_url: proj.repository_url || null,
              media_urls: proj.media_urls || [],
              skills_gained: proj.skills_gained || [],
            }))
          });
          console.log(`✅ Created ${profileData.projects.length} projects`);
        }

        // Create awards
        if (profileData.awards?.length > 0) {
          console.log('🏆 Creating awards...');
          await tx.award.createMany({
            data: profileData.awards.map((award: any) => ({
              candidate_id: payload.userId,
              title: award.title,
              offered_by: award.offered_by,
              associated_with: award.associated_with || null,
              date: new Date(award.date),
              description: award.description || null,
              media_url: award.media_url || null,
              skill_ids: award.skill_ids || [],
            }))
          });
          console.log(`✅ Created ${profileData.awards.length} awards`);
        }

        // Create volunteering
        if (profileData.volunteering?.length > 0) {
          console.log('🤝 Creating volunteering records...');
          await tx.volunteering.createMany({
            data: profileData.volunteering.map((vol: any) => ({
              candidate_id: payload.userId,
              role: vol.role,
              institution: vol.institution,
              cause: vol.cause || null,
              start_date: new Date(vol.start_date),
              end_date: vol.end_date ? new Date(vol.end_date) : null,
              is_current: vol.is_current || false,
              description: vol.description || null,
              media_url: vol.media_url || null,
            }))
          });
          console.log(`✅ Created ${profileData.volunteering.length} volunteering records`);
        }

        // Create accomplishments (only if they have valid data)
        if (profileData.accomplishments?.length > 0) {
          console.log('🎯 Creating accomplishments...');
          
          const validAccomplishments = profileData.accomplishments.filter((acc: any) => 
            acc.title && acc.title.trim() && acc.description && acc.description.trim()
          );

          if (validAccomplishments.length > 0) {
            await tx.accomplishment.createMany({
              data: validAccomplishments.map((acc: any) => ({
                candidate_id: payload.userId,
                title: acc.title.trim().substring(0, 300),
                description: acc.description.trim(),
                work_experience_id: acc.work_experience_id || null,
                resume_id: null,
              }))
            });
            console.log(`✅ Created ${validAccomplishments.length} accomplishments`);
          }
        }

        return { candidate, isUpdate };

      } catch (dbError) {
        console.error('❌ Database transaction error:', dbError);
        throw dbError;
      }
    }, {
      timeout: 10000,
    });

    console.log(`✅ Profile ${result.isUpdate ? 'updated' : 'created'} successfully`);

    // 5. Process skills OUTSIDE of transaction to avoid timeout
    let skillsCreated = 0;
    try {
      if (profileData.candidate_skills?.length > 0) {
        skillsCreated = await processSkillsInBulk(payload.userId, profileData.candidate_skills);
      }
    } catch (skillsError) {
      console.error('⚠️ Skills processing failed:', skillsError);
      // Don't fail the entire request if skills fail
    }

    // 6. Update profile completion percentage based on data
    const finalCompletionPercentage = skillsCreated > 0 ? 90 : 85;
    await prisma.candidate.update({
      where: { user_id: payload.userId },
      data: { 
        profile_completion_percentage: finalCompletionPercentage
      }
    });

    // 7. Get uploaded CVs for response
    const uploadedCVs = await prisma.resume.findMany({
      where: { candidate_id: payload.userId },
      orderBy: [
        { is_primary: 'desc' },
        { uploaded_at: 'desc' }
      ]
    });

    // 8. Prepare response
    const response = {
      success: true,
      message: `Profile ${result.isUpdate ? 'updated' : 'created'} successfully`,
      data: {
        candidate: result.candidate,
        skillsCreated,
        isUpdate: result.isUpdate,
        uploadedCVs: uploadedCVs.map(cv => ({
          id: cv.id,
          resume_url: cv.resume_url,
          original_filename: cv.original_filename || 'CV.pdf',
          file_size: cv.file_size || 0,
          file_type: cv.file_type || 'application/pdf',
          is_primary: cv.is_primary,
          is_allow_fetch: cv.is_allow_fetch,
          uploaded_at: cv.uploaded_at.toISOString(),
        }))
      }
    };

    console.log('🎉 Profile processing completed:', {
      candidateId: result.candidate.user_id,
      action: result.isUpdate ? 'updated' : 'created',
      skillsCreated,
      uploadedCVs: uploadedCVs.length
    });

    return NextResponse.json(response, { status: result.isUpdate ? 200 : 201 });

  } catch (error) {
    console.error('❌ Profile creation/update error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Profile with this information already exists' },
          { status: 409 }
        );
      }

      if (error.message.includes('required')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      if (error.message.includes('timeout') || error.code === 'P2028') {
        return NextResponse.json(
          { error: 'Transaction timeout. Please try again with fewer skills or data.' },
          { status: 408 }
        );
      }
    }

    return NextResponse.json(
      { 
        error: 'Failed to create/update profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}