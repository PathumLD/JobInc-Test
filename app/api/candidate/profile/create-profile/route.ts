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

    // 3. Ensure arrays exist and are properly initialized - CRITICAL FIX
    profileData.work_experience = profileData.work_experience || [];
    profileData.education = profileData.education || [];
    profileData.certificates = profileData.certificates || [];
    profileData.projects = profileData.projects || [];
    profileData.awards = profileData.awards || [];
    profileData.volunteering = profileData.volunteering || [];
    profileData.skills = profileData.skills || [];

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

    // 6. Create profile in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update basic candidate info
      const updatedCandidate = await tx.candidate.update({
        where: { user_id: payload.userId },
        data: {
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          email: profileData.email,
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

      // Handle work experiences - FIXED field mapping
      if (profileData.work_experience.length > 0) {
        await tx.workExperience.deleteMany({
          where: { candidate_id: candidate.user_id }
        });

        const validExperiences = profileData.work_experience.filter(exp => 
          exp.title && exp.company
        );

        if (validExperiences.length > 0) {
          results.work_experiences = await Promise.all(
            validExperiences.map(exp => tx.workExperience.create({
              data: {
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
              }
            }))
          );
        }
      }

      // Handle educations - FIXED field mapping
      if (profileData.education.length > 0) {
        await tx.education.deleteMany({
          where: { candidate_id: candidate.user_id }
        });

        const validEducations = profileData.education.filter(edu => 
          edu.degree && edu.institution
        );

        if (validEducations.length > 0) {
          results.educations = await Promise.all(
            validEducations.map(edu => tx.education.create({
              data: {
                candidate_id: candidate.user_id,
                degree_diploma: edu.degree,
                university_school: edu.institution,
                field_of_study: edu.field_of_study || null,
                start_date: edu.start_date ? new Date(edu.start_date) : null,
                end_date: edu.end_date ? new Date(edu.end_date) : null,
                grade: edu.gpa || null,
                skill_ids: [],
              }
            }))
          );
        }
      }

      // Handle certificates
      if (profileData.certificates.length > 0) {
        await tx.certificate.deleteMany({
          where: { candidate_id: candidate.user_id }
        });

        const validCertificates = profileData.certificates.filter(cert => 
          cert.name && cert.issuing_authority
        );

        if (validCertificates.length > 0) {
          results.certificates = await Promise.all(
            validCertificates.map(cert => tx.certificate.create({
              data: {
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
              }
            }))
          );
        }
      }

      // Handle projects
      if (profileData.projects.length > 0) {
        await tx.project.deleteMany({
          where: { candidate_id: candidate.user_id }
        });

        const validProjects = profileData.projects.filter(proj => proj.name);

        if (validProjects.length > 0) {
          results.projects = await Promise.all(
            validProjects.map(proj => tx.project.create({
              data: {
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
              }
            }))
          );
        }
      }

      // Handle awards
      if (profileData.awards.length > 0) {
        await tx.award.deleteMany({
          where: { candidate_id: candidate.user_id }
        });

        const validAwards = profileData.awards.filter(award => 
          award.title && award.offered_by
        );

        if (validAwards.length > 0) {
          results.awards = await Promise.all(
            validAwards.map(award => tx.award.create({
              data: {
                candidate_id: candidate.user_id,
                title: award.title,
                offered_by: award.offered_by,
                associated_with: award.associated_with || null,
                date: award.date ? new Date(award.date) : null,
                description: award.description || null,
                media_url: award.media_url || null,
                skill_ids: award.skill_ids || [],
              }
            }))
          );
        }
      }

      // Handle volunteering
      if (profileData.volunteering.length > 0) {
        await tx.volunteering.deleteMany({
          where: { candidate_id: candidate.user_id }
        });

        const validVolunteering = profileData.volunteering.filter(vol => 
          vol.role && vol.institution
        );

        if (validVolunteering.length > 0) {
          results.volunteering = await Promise.all(
            validVolunteering.map(vol => tx.volunteering.create({
              data: {
                candidate_id: candidate.user_id,
                role: vol.role,
                institution: vol.institution,
                cause: vol.cause || null,
                start_date: vol.start_date ? new Date(vol.start_date) : null,
                end_date: vol.end_date ? new Date(vol.end_date) : null,
                is_current: vol.is_current,
                description: vol.description || null,
                media_url: vol.media_url || null,
              }
            }))
          );
        }
      }

      // Handle skills
      if (profileData.skills.length > 0) {
        await tx.candidateSkill.deleteMany({
          where: { candidate_id: candidate.user_id }
        });

        const validSkills = profileData.skills.filter(skill => skill.trim());

        if (validSkills.length > 0) {
          results.skills = await Promise.all(
            validSkills.map(async (skillName) => {
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
            })
          );
        }
      }

      return results;
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
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
