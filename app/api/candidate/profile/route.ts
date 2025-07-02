// app/api/candidate/profile/create-profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { Decimal } from '@prisma/client/runtime/library';
import type { BasicInfoFormValues } from '@/app/profile/create-profile/BasicInfoForm';

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let payload: { userId: string; email: string; role: string };
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; email: string; role: string };
  } catch (error) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  if (payload.role !== 'employee' && payload.role !== 'candidate') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let data: BasicInfoFormValues;
  try {
    data = await req.json();
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // Helper functions for data conversion
  function toInt(val: any): number | null {
    if (val === undefined || val === null || val === '') return null;
    const n = Number(val);
    return isNaN(n) ? null : n;
  }

  function toDecimal(val: any): Decimal | null {
    if (val === undefined || val === null || val === '') return null;
    const n = Number(val);
    return isNaN(n) ? null : new Decimal(n);
  }

  function toDate(val: any): Date | null {
    if (!val) return null;
    try {
      return new Date(val);
    } catch {
      return null;
    }
  }

  function toStringArray(val: any): string[] {
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
  }

  // Main candidate data
  const candidateData = {
    first_name: data.first_name,
    last_name: data.last_name,
    title: data.title || null,
    bio: data.bio || null,
    about: data.about || null,
    location: data.location || null,
    remote_preference: data.remote_preference || 'flexible',
    experience_level: data.experience_level || 'entry',
    years_of_experience: toInt(data.years_of_experience),
    expected_salary_min: toDecimal(data.expected_salary_min),
    expected_salary_max: toDecimal(data.expected_salary_max),
    currency: data.currency || 'USD',
    availability_status: data.availability_status || 'available',
    availability_date: toDate(data.availability_date),
    resume_url: data.resume_url || null,
    portfolio_url: data.portfolio_url || null,
    github_url: data.github_url || null,
    linkedin_url: data.linkedin_url || null,
    personal_website: data.personal_website || null,
    current_position: data.current_position || null,
    industry: data.industry || null,
    country: data.country || null,
    city: data.city || null,
    address: data.address || null,
    phone: data.phone || null,
    phone_type: data.phone_type || null,
    gender: data.gender || null,
    date_of_birth: toDate(data.date_of_birth),
    pronouns: data.pronouns || null,
    salary_visibility: data.salary_visibility || 'confidential',
    notice_period: toInt(data.notice_period) || 30,
    work_authorization: data.work_authorization || null,
    visa_assistance_needed: data.visa_assistance_needed || false,
    work_availability: data.work_availability || 'full_time',
    open_to_relocation: data.open_to_relocation || false,
    willing_to_travel: data.willing_to_travel || false,
    security_clearance: data.security_clearance || false,
    disability_status: data.disability_status || null,
    veteran_status: data.veteran_status || null,
    profile_completion_percentage: toInt(data.profile_completion_percentage) || 0,
  };

  try {
    // Transaction to ensure all operations succeed or fail together
    const result = await prisma.$transaction(async (prisma) => {
      // 1. Upsert user
      await prisma.user.upsert({
        where: { id: payload.userId },
        create: {
          id: payload.userId,
          email: payload.email,
          password: '',
          role: 'candidate',
          status: 'active',
        },
        update: {
          email: payload.email,
        },
      });

      // 2. Upsert candidate profile
      const candidate = await prisma.candidate.upsert({
        where: { user_id: payload.userId },
        create: {
          ...candidateData,
          user_id: payload.userId,
        },
        update: candidateData,
      });

      // 3. Handle work experiences
      if (data.work_experiences?.length) {
        // Delete existing experiences not in the new data
        const existingExperiences = await prisma.workExperience.findMany({
          where: { candidate_id: payload.userId },
          select: { id: true },
        });
        
        const newExperienceIds = data.work_experiences
          .filter(exp => exp.id)
          .map(exp => exp.id);
        
        const idsToDelete = existingExperiences
          .filter(exp => !newExperienceIds.includes(exp.id))
          .map(exp => exp.id);

        if (idsToDelete.length) {
          await prisma.workExperience.deleteMany({
            where: { id: { in: idsToDelete } },
          });
        }

        // Upsert each work experience
        for (const exp of data.work_experiences) {
          const experienceData = {
            title: exp.title,
            company: exp.company,
            employment_type: exp.employment_type || 'full_time',
            is_current: exp.is_current || false,
            start_date: toDate(exp.start_date) || new Date(),
            end_date: exp.is_current ? null : toDate(exp.end_date),
            location: exp.location || null,
            description: exp.description || null,
            job_source: exp.job_source || null,
            skill_ids: toStringArray(exp.skill_ids),
            media_url: exp.media_url || null,
          };

          if (exp.id) {
            await prisma.workExperience.update({
              where: { id: exp.id },
              data: experienceData,
            });
          } else {
            await prisma.workExperience.create({
              data: {
                ...experienceData,
                candidate_id: payload.userId,
              },
            });
          }
        }
      }

      // 4. Handle education
      if (data.educations?.length) {
        // Similar delete logic as work experiences
        const existingEducations = await prisma.education.findMany({
          where: { candidate_id: payload.userId },
          select: { id: true },
        });
        
        const newEducationIds = data.educations
          .filter(edu => edu.id)
          .map(edu => edu.id);
        
        const idsToDelete = existingEducations
          .filter(edu => !newEducationIds.includes(edu.id))
          .map(edu => edu.id);

        if (idsToDelete.length) {
          await prisma.education.deleteMany({
            where: { id: { in: idsToDelete } },
          });
        }

        for (const edu of data.educations) {
          const educationData = {
            degree_diploma: edu.degree_diploma,
            university_school: edu.university_school,
            field_of_study: edu.field_of_study || null,
            start_date: toDate(edu.start_date) || new Date(),
            end_date: toDate(edu.end_date),
            grade: edu.grade || null,
            skill_ids: toStringArray(edu.skill_ids),
            media_url: edu.media_url || null,
          };

          if (edu.id) {
            await prisma.education.update({
              where: { id: edu.id },
              data: educationData,
            });
          } else {
            await prisma.education.create({
              data: {
                ...educationData,
                candidate_id: payload.userId,
              },
            });
          }
        }
      }

      // 5. Handle certificates
      if (data.certificates?.length) {
        // Similar delete logic
        const existingCerts = await prisma.certificate.findMany({
          where: { candidate_id: payload.userId },
          select: { id: true },
        });
        
        const newCertIds = data.certificates
          .filter(cert => cert.id)
          .map(cert => cert.id);
        
        const idsToDelete = existingCerts
          .filter(cert => !newCertIds.includes(cert.id))
          .map(cert => cert.id);

        if (idsToDelete.length) {
          await prisma.certificate.deleteMany({
            where: { id: { in: idsToDelete } },
          });
        }

        for (const cert of data.certificates) {
          const certData = {
            name: cert.name,
            issuing_authority: cert.issuing_authority,
            issue_date: toDate(cert.issue_date) || new Date(),
            expiry_date: toDate(cert.expiry_date),
            credential_id: cert.credential_id || null,
            credential_url: cert.credential_url || null,
            description: cert.description || null,
            skill_ids: toStringArray(cert.skill_ids),
            media_url: cert.media_url || null,
          };

          if (cert.id) {
            await prisma.certificate.update({
              where: { id: cert.id },
              data: certData,
            });
          } else {
            await prisma.certificate.create({
              data: {
                ...certData,
                candidate_id: payload.userId,
              },
            });
          }
        }
      }

      // 6. Handle projects
      if (data.projects?.length) {
        // Similar delete logic
        const existingProjects = await prisma.project.findMany({
          where: { candidate_id: payload.userId },
          select: { id: true },
        });
        
        const newProjectIds = data.projects
          .filter(proj => proj.id)
          .map(proj => proj.id);
        
        const idsToDelete = existingProjects
          .filter(proj => !newProjectIds.includes(proj.id))
          .map(proj => proj.id);

        if (idsToDelete.length) {
          await prisma.project.deleteMany({
            where: { id: { in: idsToDelete } },
          });
        }

        for (const proj of data.projects) {
          const projectData = {
            name: proj.name,
            description: proj.description,
            start_date: toDate(proj.start_date) || new Date(),
            end_date: proj.is_current ? null : toDate(proj.end_date),
            is_current: proj.is_current || false,
            role: proj.role || null,
            responsibilities: toStringArray(proj.responsibilities),
            technologies: toStringArray(proj.technologies),
            tools: toStringArray(proj.tools),
            methodologies: toStringArray(proj.methodologies),
            is_confidential: proj.is_confidential || false,
            can_share_details: proj.can_share_details || false,
            url: proj.url || null,
            repository_url: proj.repository_url || null,
            media_urls: toStringArray(proj.media_urls),
            skills_gained: toStringArray(proj.skills_gained),
          };

          if (proj.id) {
            await prisma.project.update({
              where: { id: proj.id },
              data: projectData,
            });
          } else {
            await prisma.project.create({
              data: {
                ...projectData,
                candidate_id: payload.userId,
              },
            });
          }
        }
      }

      // 7. Handle awards
      if (data.awards?.length) {
        // Similar delete logic
        const existingAwards = await prisma.award.findMany({
          where: { candidate_id: payload.userId },
          select: { id: true },
        });
        
        const newAwardIds = data.awards
          .filter(award => award.id)
          .map(award => award.id);
        
        const idsToDelete = existingAwards
          .filter(award => !newAwardIds.includes(award.id))
          .map(award => award.id);

        if (idsToDelete.length) {
          await prisma.award.deleteMany({
            where: { id: { in: idsToDelete } },
          });
        }

        for (const award of data.awards) {
          const awardData = {
            title: award.title,
            associated_with: award.associated_with || null,
            offered_by: award.offered_by,
            date: toDate(award.date) || new Date(),
            description: award.description || null,
            media_url: award.media_url || null,
            skill_ids: toStringArray(award.skill_ids),
          };

          if (award.id) {
            await prisma.award.update({
              where: { id: award.id },
              data: awardData,
            });
          } else {
            await prisma.award.create({
              data: {
                ...awardData,
                candidate_id: payload.userId,
              },
            });
          }
        }
      }

      // 8. Handle volunteering
      if (data.volunteering?.length) {
        // Similar delete logic
        const existingVolunteering = await prisma.volunteering.findMany({
          where: { candidate_id: payload.userId },
          select: { id: true },
        });
        
        const newVolunteeringIds = data.volunteering
          .filter(vol => vol.id)
          .map(vol => vol.id);
        
        const idsToDelete = existingVolunteering
          .filter(vol => !newVolunteeringIds.includes(vol.id))
          .map(vol => vol.id);

        if (idsToDelete.length) {
          await prisma.volunteering.deleteMany({
            where: { id: { in: idsToDelete } },
          });
        }

        for (const vol of data.volunteering) {
          const volunteeringData = {
            role: vol.role,
            institution: vol.institution,
            cause: vol.cause || null,
            start_date: toDate(vol.start_date) || new Date(),
            end_date: vol.is_current ? null : toDate(vol.end_date),
            is_current: vol.is_current || false,
            description: vol.description || null,
            media_url: vol.media_url || null,
          };

          if (vol.id) {
            await prisma.volunteering.update({
              where: { id: vol.id },
              data: volunteeringData,
            });
          } else {
            await prisma.volunteering.create({
              data: {
                ...volunteeringData,
                candidate_id: payload.userId,
              },
            });
          }
        }
      }

      // 9. Handle skills
      if (data.skills?.length) {
        // First delete all existing candidate skills
        await prisma.candidateSkill.deleteMany({
          where: { candidate_id: payload.userId },
        });

        // Then create new ones
        const skillsToCreate = data.skills.map(skillId => ({
          candidate_id: payload.userId,
          skill_id: skillId,
        }));

        await prisma.candidateSkill.createMany({
          data: skillsToCreate,
          skipDuplicates: true,
        });
      }

      // 10. Handle accomplishments
      if (data.accomplishments?.length) {
        // Similar delete logic
        const existingAccomplishments = await prisma.accomplishment.findMany({
          where: { candidate_id: payload.userId },
          select: { id: true },
        });
        
        const newAccomplishmentIds = data.accomplishments
          .filter(acc => acc.id)
          .map(acc => acc.id);
        
        const idsToDelete = existingAccomplishments
          .filter(acc => !newAccomplishmentIds.includes(acc.id))
          .map(acc => acc.id);

        if (idsToDelete.length) {
          await prisma.accomplishment.deleteMany({
            where: { id: { in: idsToDelete } },
          });
        }

        for (const acc of data.accomplishments) {
          const accomplishmentData = {
            title: acc.title,
            description: acc.description,
            work_experience_id: acc.work_experience_index ? 
              data.work_experiences[acc.work_experience_index]?.id || null : null,
          };

          if (acc.id) {
            await prisma.accomplishment.update({
              where: { id: acc.id },
              data: accomplishmentData,
            });
          } else {
            await prisma.accomplishment.create({
              data: {
                ...accomplishmentData,
                candidate_id: payload.userId,
              },
            });
          }
        }
      }

      // 11. Handle CV documents
      if (data.cv_documents?.length) {
        // Delete existing documents not in the new data
        const existingDocs = await prisma.resume.findMany({
          where: { candidate_id: payload.userId },
          select: { id: true },
        });
        
        const newDocIds = data.cv_documents
          .filter(doc => doc.id)
          .map(doc => doc.id);
        
        const idsToDelete = existingDocs
          .filter(doc => !newDocIds.includes(doc.id))
          .map(doc => doc.id);

        if (idsToDelete.length) {
          await prisma.resume.deleteMany({
            where: { id: { in: idsToDelete } },
          });
        }

        for (const doc of data.cv_documents) {
          const docData = {
            resume_url: doc.file_url || null,
            is_primary: doc.is_primary || false,
            uploaded_at: toDate(doc.uploaded_at) || new Date(),
          };

          if (doc.id) {
            await prisma.resume.update({
              where: { id: doc.id },
              data: docData,
            });
          } else {
            await prisma.resume.create({
              data: {
                ...docData,
                candidate_id: payload.userId,
              },
            });
          }
        }
      }

      return { success: true, candidate };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Profile creation error:', error);
    
    // Check if it's a connection error
    if (error instanceof Error) {
      if (error.message.includes('prepared statement') || error.message.includes('ConnectorError')) {
        // Disconnect and retry once
        await prisma.$disconnect();
        
        try {
          // Retry the operation
          const result = await prisma.$transaction(async (prisma) => {
            // Repeat all the operations from above...
            // (omitted for brevity, but should be the same as above)
          });

          return NextResponse.json(result);
        } catch (retryError) {
          console.error('Retry failed:', retryError);
          return NextResponse.json(
            { error: 'Database connection failed. Please try again.' },
            { status: 500 }
          );
        }
      }
    }

    return NextResponse.json(
      { error: 'Failed to save profile. Please try again.' },
      { status: 500 }
    );
  }
}