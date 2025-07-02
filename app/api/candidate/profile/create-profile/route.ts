// app/api/candidate/profile/create-profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { DataTransformer, UnifiedProfileData } from '@/lib/data-transformer';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  exp: number;
}

export async function POST(request: NextRequest) {
  try {
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

    // 2. Parse and validate request data
    let profileData: UnifiedProfileData;
    try {
      profileData = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON data' },
        { status: 400 }
      );
    }

    // 3. Ensure arrays exist and are properly initialized
    profileData.work_experience = profileData.work_experience || [];
    profileData.education = profileData.education || [];
    profileData.certificates = profileData.certificates || [];
    profileData.projects = profileData.projects || [];
    profileData.awards = profileData.awards || [];
    profileData.volunteering = profileData.volunteering || [];
    profileData.skills = profileData.skills || [];
    profileData.accomplishments = profileData.accomplishments || [];
    profileData.cv_documents = profileData.cv_documents || [];

    // 4. Validate profile data
    const validation = DataTransformer.validateProfileData(profileData);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          errors: validation.errors
        },
        { status: 400 }
      );
    }

    // 5. Check if candidate exists
    let candidate = await prisma.candidate.findUnique({
      where: { user_id: payload.userId }
    });

    if (!candidate) {
      candidate = await prisma.candidate.create({
        data: {
          user_id: payload.userId,
          first_name: '',
          last_name: '',
          profile_completion_percentage: 0
        }
      });
    }

    console.log('🚀 Creating profile for user:', payload.userId);
    console.log('📄 CV documents received:', profileData.cv_documents);

    // 6. Create profile in transaction with increased timeout
    const result = await prisma.$transaction(async (tx) => {
      // Update basic candidate info
      const updatedCandidate = await tx.candidate.update({
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
          years_of_experience: profileData.years_of_experience || null,
          current_position: profileData.current_position || null,
          industry: profileData.industry || null,
        }
      });

      const results: any = { candidate: updatedCandidate };

      // Batch delete all existing data first (more efficient)
      await Promise.all([
        tx.workExperience.deleteMany({ where: { candidate_id: candidate.user_id } }),
        tx.accomplishment.deleteMany({ where: { candidate_id: candidate.user_id } }),
        tx.education.deleteMany({ where: { candidate_id: candidate.user_id } }),
        tx.certificate.deleteMany({ where: { candidate_id: candidate.user_id } }),
        tx.project.deleteMany({ where: { candidate_id: candidate.user_id } }),
        tx.award.deleteMany({ where: { candidate_id: candidate.user_id } }),
        tx.volunteering.deleteMany({ where: { candidate_id: candidate.user_id } }),
        tx.candidateSkill.deleteMany({ where: { candidate_id: candidate.user_id } }),
        // Don't delete resumes here - they should already be uploaded via the upload endpoint
      ]);

      // Handle CV documents/resumes - Updated to handle already uploaded files
      if (profileData.cv_documents && profileData.cv_documents.length > 0) {
        console.log('💾 Processing CV documents...');
        
        const validCvDocuments = profileData.cv_documents.filter(doc => 
          doc.resume_url && doc.resume_url.trim() && doc.original_filename
        );

        if (validCvDocuments.length > 0) {
          console.log(`Found ${validCvDocuments.length} valid CV documents with URLs`);
          
          // Check if resumes already exist (they should if uploaded via the new flow)
          const existingResumes = await tx.resume.findMany({
            where: { 
              candidate_id: candidate.user_id,
              resume_url: { in: validCvDocuments.map(doc => doc.resume_url) }
            }
          });

          console.log(`Found ${existingResumes.length} existing resumes in database`);

          // If no existing resumes found, create them (fallback)
          if (existingResumes.length === 0) {
            console.log('No existing resumes found, creating new records...');
            
            // Ensure only one primary resume
            let hasPrimary = false;
            const cvDocumentsData = validCvDocuments.map((doc, index) => {
              const isPrimary = doc.is_primary && !hasPrimary;
              if (isPrimary) hasPrimary = true;
              
              return {
                candidate_id: candidate.user_id,
                resume_url: doc.resume_url,
                is_primary: isPrimary,
                is_allow_fetch: doc.is_allow_fetch ?? true,
                uploaded_at: doc.uploaded_at ? new Date(doc.uploaded_at) : new Date(),
              };
            });

            // If no primary is set, make the first one primary
            if (!hasPrimary && cvDocumentsData.length > 0) {
              cvDocumentsData[0].is_primary = true;
            }

            results.resumes = await tx.resume.createMany({
              data: cvDocumentsData
            });

            // Update the candidate's resume_url with the primary resume
            const primaryResumeUrl = cvDocumentsData.find(doc => doc.is_primary)?.resume_url;
            if (primaryResumeUrl) {
              await tx.candidate.update({
                where: { user_id: candidate.user_id },
                data: { resume_url: primaryResumeUrl }
              });
            }

            console.log('✅ CV documents created successfully:', cvDocumentsData.length);
          } else {
            // Update candidate's resume_url with the primary resume
            const primaryResume = existingResumes.find(resume => resume.is_primary) || existingResumes[0];
            if (primaryResume) {
              await tx.candidate.update({
                where: { user_id: candidate.user_id },
                data: { resume_url: primaryResume.resume_url }
              });
            }
            console.log('✅ Using existing CV documents');
          }
        }
      }

      // Handle work experiences
      if (profileData.work_experience.length > 0) {
        const validExperiences = profileData.work_experience.filter(exp => 
          exp.title && exp.company
        );

        if (validExperiences.length > 0) {
          results.work_experiences = await tx.workExperience.createMany({
            data: validExperiences.map(exp => ({
              candidate_id: candidate.user_id,
              title: exp.title,
              company: exp.company,
              employment_type: exp.employment_type,
              is_current: exp.is_current,
              start_date: exp.start_date ? new Date(exp.start_date) : null,
              end_date: exp.end_date ? new Date(exp.end_date) : null,
              location: exp.location || null,
              description: exp.description || null,
              skill_ids: [],
            }))
          });
        }
      }

      // Handle accomplishments (if they don't need work_experience_id linking)
      if (profileData.accomplishments && profileData.accomplishments.length > 0) {
        const validAccomplishments = profileData.accomplishments.filter(acc => 
          acc.title && acc.description
        );

        if (validAccomplishments.length > 0) {
          results.accomplishments = await tx.accomplishment.createMany({
            data: validAccomplishments.map(acc => ({
              candidate_id: candidate.user_id,
              work_experience_id: null, // Simplified - handle linking separately if needed
              title: acc.title,
              description: acc.description,
            }))
          });
        }
      }

      // Handle educations
      if (profileData.education.length > 0) {
        const validEducations = profileData.education.filter(edu => 
          edu.degree_diploma && edu.university_school
        );

        if (validEducations.length > 0) {
          results.educations = await tx.education.createMany({
            data: validEducations.map(edu => ({
              candidate_id: candidate.user_id,
              degree_diploma: edu.degree_diploma,
              university_school: edu.university_school,
              field_of_study: edu.field_of_study || null,
              start_date: edu.start_date ? new Date(edu.start_date) : null,
              end_date: edu.end_date ? new Date(edu.end_date) : null,
              grade: edu.grade || null,
              skill_ids: edu.skill_ids || [],
              media_url: edu.media_url || null,
            }))
          });
        }
      }

      // Handle certificates
      if (profileData.certificates.length > 0) {
        const validCertificates = profileData.certificates.filter(cert => 
          cert.name && cert.issuing_authority
        );

        if (validCertificates.length > 0) {
          results.certificates = await tx.certificate.createMany({
            data: validCertificates.map(cert => ({
              candidate_id: candidate.user_id,
              name: cert.name,
              issuing_authority: cert.issuing_authority,
              issue_date: cert.issue_date ? new Date(cert.issue_date) : null,
              expiry_date: cert.expiry_date ? new Date(cert.expiry_date) : null,
              credential_id: cert.credential_id || null,
              credential_url: cert.credential_url || null,
              description: cert.description || null,
              media_url: cert.media_url || null,
              skill_ids: [],
            }))
          });
        }
      }

      // Handle projects
      if (profileData.projects.length > 0) {
        const validProjects = profileData.projects.filter(proj => proj.name);

        if (validProjects.length > 0) {
          results.projects = await tx.project.createMany({
            data: validProjects.map(proj => ({
              candidate_id: candidate.user_id,
              name: proj.name,
              description: proj.description || null,
              start_date: proj.start_date ? new Date(proj.start_date) : null,
              end_date: proj.end_date ? new Date(proj.end_date) : null,
              is_current: proj.is_current || false,
              role: proj.role || null,
              responsibilities: proj.responsibilities || [],
              technologies: proj.technologies || [],
              tools: proj.tools || [],
              methodologies: proj.methodologies || [],
              is_confidential: proj.is_confidential || false,
              can_share_details: proj.can_share_details || true,
              url: proj.url || null,
              repository_url: proj.repository_url || null,
              media_urls: proj.media_urls || [],
              skills_gained: proj.skills_gained || [],
            }))
          });
        }
      }

      // Handle awards
      if (profileData.awards.length > 0) {
        const validAwards = profileData.awards
          .filter(award => award.title && award.title.trim() && 
                          award.offered_by && award.offered_by.trim())
          .map(award => ({
            candidate_id: candidate.user_id,
            title: award.title.trim(),
            offered_by: award.offered_by.trim(),
            associated_with: award.associated_with?.trim() || null,
            date: award.date ? new Date(award.date) : null,
            description: award.description?.trim() || null,
            media_url: award.media_url?.trim() || null,
          }));

        if (validAwards.length > 0) {
          results.awards = await tx.award.createMany({
            data: validAwards
          });
        }
      }

      // Handle volunteering
      if (profileData.volunteering.length > 0) {
        const validVolunteering = profileData.volunteering.filter(vol => 
          vol.role && vol.institution
        );

        if (validVolunteering.length > 0) {
          results.volunteering = await tx.volunteering.createMany({
            data: validVolunteering.map(vol => ({
              candidate_id: candidate.user_id,
              role: vol.role,
              institution: vol.institution,
              cause: vol.cause || null,
              start_date: vol.start_date ? new Date(vol.start_date) : null,
              end_date: vol.end_date ? new Date(vol.end_date) : null,
              is_current: vol.is_current,
              description: vol.description || null,
              media_url: vol.media_url || null,
            }))
          });
        }
      }

      // Handle skills - this needs individual processing for upsert
      if (profileData.skills.length > 0) {
        const validSkills = profileData.skills.filter(skill => skill.trim());

        if (validSkills.length > 0) {
          const skillPromises = validSkills.map(async (skillName) => {
            const skill = await tx.skill.upsert({
              where: { name: skillName.trim() },
              update: {},
              create: { name: skillName.trim() }
            });

            return tx.candidateSkill.create({
              data: {
                candidate_id: candidate.user_id,
                skill_id: skill.id
              },
              include: { skill: true }
            });
          });

          results.skills = await Promise.all(skillPromises);
        }
      }

      return results;
    }, {
      timeout: 120000, // Increase timeout to 60 seconds
    });

    console.log('✅ Profile created successfully');

    return NextResponse.json({
      success: true,
      message: 'Profile created successfully',
      data: result
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Profile creation error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Duplicate data error' },
          { status: 409 }
        );
      }
      if (error.message.includes('Transaction timeout')) {
        return NextResponse.json(
          { error: 'Operation took too long. Please try again with smaller data sets.' },
          { status: 408 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}