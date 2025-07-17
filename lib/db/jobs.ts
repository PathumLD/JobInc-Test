// lib/db/jobs.ts - Updated for MIS users only

import { PrismaClient } from '@prisma/client';
import { CreateJobData, UpdateJobData } from '@/lib/validations/job';
import { Job, CreatorType, JobStatus } from '../types/jobs/job';

const prisma = new PrismaClient();


//  Check if MIS user exists, create if it doesn't

export async function ensureMisUserExists(userId: string): Promise<boolean> {
  try {
    console.log(`Checking MIS user existence for: ${userId}`);
    
    // First, ensure the base user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      console.error(`❌ Base user ${userId} not found in database`);
      return false;
    }

    console.log(`✅ Base user found:`, {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status
    });

    // Check if user has MIS role
    if (user.role !== 'mis') {
      console.error(`❌ User ${userId} does not have MIS role. Current role: ${user.role}`);
      return false;
    }

    // Check if MIS user record exists
    let misUser = await prisma.misUser.findUnique({
      where: { user_id: userId }
    });

    if (!misUser) {
      console.log(`Creating MIS user record for user ${userId}`);
      // Create MIS user record if it doesn't exist
      misUser = await prisma.misUser.create({
        data: {
          user_id: userId,
          access_level: 'admin', // Default access level
          job_posting_permissions: true,
          can_post_for_all_companies: true,
          max_active_jobs: 100
        }
      });
      console.log(`✅ Created MIS user record for user ${userId}`);
    } else {
      console.log(`✅ MIS user record already exists for user ${userId}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error ensuring MIS user exists:', error);
    return false;
  }
}


// Create a new job (MIS users only)

export async function createJob(data: CreateJobData, creatorId: string): Promise<Job> {
  try {
    console.log(`=== CREATING JOB FOR MIS USER: ${creatorId} ===`);
    
    // Ensure the MIS user exists and is valid
    const misUserValid = await ensureMisUserExists(creatorId);
    if (!misUserValid) {
      throw new Error('Invalid MIS user or user does not have proper permissions');
    }

    console.log('✅ MIS user validation passed');

    // Prepare job data - only for MIS users, no employer relations
    const jobData = {
      creator_id: creatorId,
      creator_type: CreatorType.MIS_USER,
      title: data.title,
      description: data.description,
      requirements: data.requirements || null,
      responsibilities: data.responsibilities || null,
      benefits: data.benefits || null,
      job_type: data.job_type,
      experience_level: data.experience_level,
      location: data.location || null,
      remote_type: data.remote_type,
      salary_min: data.salary_min || null,
      salary_max: data.salary_max || null,
      currency: data.currency,
      salary_type: data.salary_type,
      equity_offered: data.equity_offered,
      ai_skills_required: data.ai_skills_required,
      application_deadline: data.application_deadline ? new Date(data.application_deadline) : null,
      status: data.status,
      priority_level: data.priority_level,
      company_id: null, // Always null for MIS created jobs with custom company info
      customCompanyName: data.customCompanyName || null,
      customCompanyEmail: data.customCompanyEmail || null,
      customCompanyPhone: data.customCompanyPhone || null,
      customCompanyWebsite: data.customCompanyWebsite || null,
      published_at: data.status === JobStatus.PUBLISHED ? new Date() : null
    };

    console.log('Creating job with data:', {
      creator_id: jobData.creator_id,
      creator_type: jobData.creator_type,
      title: jobData.title,
      customCompanyName: jobData.customCompanyName
    });

    // Create job with skills in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the job
      const job = await tx.job.create({
        data: jobData
      });

      console.log(`✅ Job created successfully with ID: ${job.id}`);

      // Create job skills if provided
      if (data.skills && data.skills.length > 0) {
        console.log(`Creating ${data.skills.length} skills for job ${job.id}`);
        
        for (const skillData of data.skills) {
          const skillName = skillData.skill_name.trim();
          
          // Find existing skill or create new one
          let skill = await tx.skill.findFirst({
            where: { 
              name: {
                equals: skillName,
                mode: 'insensitive'
              }
            }
          });

          if (!skill) {
            // Create new skill if it doesn't exist
            skill = await tx.skill.create({
              data: {
                name: skillName,
                category: 'other', // Default category
                is_active: true
              }
            });
            console.log(`✅ Created new skill: ${skillName}`);
          }

          // Create job skill relationship
          await tx.jobSkill.create({
            data: {
              job_id: job.id,
              skill_id: skill.id,
              required_level: skillData.required_level,
              proficiency_level: skillData.proficiency_level,
              years_required: skillData.years_required || null,
              weight: skillData.weight || 1.0
            }
          });
        }
      }

      // Fetch the complete job with skills
      const completeJob = await tx.job.findUnique({
        where: { id: job.id },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo_url: true,
              industry: true
            }
          },
          skills: {
            include: {
              skill: {
                select: {
                  id: true,
                  name: true,
                  category: true
                }
              }
            }
          }
        }
      });

      return completeJob;
    });

    if (!result) {
      throw new Error('Failed to create job - transaction returned null');
    }

    console.log(`✅ Job creation completed successfully: ${result.id}`);

    // Transform the result to match our Job interface
    return {
      id: result.id,
      creator_id: result.creator_id,
      creator_type: result.creator_type as CreatorType,
      title: result.title,
      description: result.description,
      requirements: result.requirements || undefined,
      responsibilities: result.responsibilities || undefined,
      benefits: result.benefits || undefined,
      job_type: result.job_type as any,
      experience_level: result.experience_level as any,
      location: result.location || undefined,
      remote_type: result.remote_type as any,
      salary_min: result.salary_min || undefined,
      salary_max: result.salary_max || undefined,
      currency: result.currency,
      salary_type: result.salary_type as any,
      equity_offered: result.equity_offered,
      ai_skills_required: result.ai_skills_required,
      application_deadline: result.application_deadline?.toISOString() || undefined,
      status: result.status as JobStatus,
      published_at: result.published_at?.toISOString() || undefined,
      priority_level: result.priority_level,
      views_count: result.views_count,
      applications_count: result.applications_count,
      company_id: result.company_id || undefined,
      customCompanyName: result.customCompanyName || undefined,
      customCompanyEmail: result.customCompanyEmail || undefined,
      customCompanyPhone: result.customCompanyPhone || undefined,
      customCompanyWebsite: result.customCompanyWebsite || undefined,
      created_at: result.created_at.toISOString(),
      updated_at: result.updated_at.toISOString(),
      company: result.company || undefined,
      skills: result.skills?.map(jobSkill => ({
        id: jobSkill.id,
        job_id: jobSkill.job_id,
        skill_id: jobSkill.skill_id,
        required_level: jobSkill.required_level as any,
        proficiency_level: jobSkill.proficiency_level as any,
        years_required: jobSkill.years_required || undefined,
        weight: jobSkill.weight,
        skill: jobSkill.skill
      })) || []
    };

  } catch (error) {
    console.error('❌ Error creating job:', error);
    
    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('Invalid MIS user')) {
        throw new Error('User does not have MIS permissions or user not found in database');
      }
      if (error.message.includes('Foreign key constraint')) {
        throw new Error('Database reference error - please contact administrator');
      }
      if (error.message.includes('Unique constraint')) {
        throw new Error('A job with similar details already exists');
      }
      
      // Re-throw user-friendly errors
      throw error;
    }
    
    throw new Error('Failed to create job - please try again');
  }
}


// Get job by ID with better error handling

export async function getJobById(jobId: string): Promise<Job | null> {
  try {
    console.log(`=== FETCHING JOB BY ID: ${jobId} ===`);

    if (!jobId || typeof jobId !== 'string') {
      console.log('❌ Invalid job ID provided');
      return null;
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo_url: true,
            industry: true,
            website_url: true
          }
        },
        skills: {
          include: {
            skill: {
              select: {
                id: true,
                name: true,
                category: true
              }
            }
          },
          orderBy: {
            weight: 'desc'
          }
        }
      }
    });

    if (!job) {
      console.log(`❌ Job not found with ID: ${jobId}`);
      return null;
    }

    console.log(`✅ Job found: ${job.title}`);
    console.log(`Job creator: ${job.creator_id}`);
    console.log(`Job type: ${job.creator_type}`);
    console.log(`Skills count: ${job.skills?.length || 0}`);

    // Transform the result to match our Job interface
    const transformedJob: Job = {
      id: job.id,
      creator_id: job.creator_id,
      creator_type: job.creator_type as CreatorType,
      title: job.title,
      description: job.description,
      requirements: job.requirements || undefined,
      responsibilities: job.responsibilities || undefined,
      benefits: job.benefits || undefined,
      job_type: job.job_type as any,
      experience_level: job.experience_level as any,
      location: job.location || undefined,
      remote_type: job.remote_type as any,
      salary_min: job.salary_min || undefined,
      salary_max: job.salary_max || undefined,
      currency: job.currency,
      salary_type: job.salary_type as any,
      equity_offered: job.equity_offered,
      ai_skills_required: job.ai_skills_required,
      application_deadline: job.application_deadline?.toISOString() || undefined,
      status: job.status as JobStatus,
      published_at: job.published_at?.toISOString() || undefined,
      priority_level: job.priority_level,
      views_count: job.views_count,
      applications_count: job.applications_count,
      company_id: job.company_id || undefined,
      customCompanyName: job.customCompanyName || undefined,
      customCompanyEmail: job.customCompanyEmail || undefined,
      customCompanyPhone: job.customCompanyPhone || undefined,
      customCompanyWebsite: job.customCompanyWebsite || undefined,
      created_at: job.created_at.toISOString(),
      updated_at: job.updated_at.toISOString(),
      company: job.company ? {
        id: job.company.id,
        name: job.company.name,
        slug: job.company.slug,
        logo_url: job.company.logo_url,
        industry: job.company.industry,
        website_url: job.company.website_url
      } : undefined,
      skills: job.skills?.map(jobSkill => ({
        id: jobSkill.id,
        job_id: jobSkill.job_id,
        skill_id: jobSkill.skill_id,
        required_level: jobSkill.required_level as any,
        proficiency_level: jobSkill.proficiency_level as any,
        years_required: jobSkill.years_required || undefined,
        weight: jobSkill.weight,
        skill: jobSkill.skill ? {
          id: jobSkill.skill.id,
          name: jobSkill.skill.name,
          category: jobSkill.skill.category
        } : undefined
      })) || []
    };

    console.log(`✅ Job transformation successful`);
    return transformedJob;

  } catch (error) {
    console.error('❌ Error in getJobById:', error);
    
    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('Invalid UUID')) {
        console.log('❌ Invalid job ID format');
        return null;
      }
      
      if (error.message.includes('Connection')) {
        console.error('❌ Database connection error');
        throw new Error('Database connection failed');
      }
      
      console.error('❌ Database error:', error.message);
      throw new Error(`Failed to fetch job: ${error.message}`);
    }
    
    throw new Error('Failed to fetch job from database');
  }
}


// Get jobs created by MIS user

export async function getJobsByMisUser(creatorId: string, page: number = 1, limit: number = 10) {
  try {
    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where: {
          creator_id: creatorId,
          creator_type: CreatorType.MIS_USER
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo_url: true,
              industry: true
            }
          },
          _count: {
            select: {
              applications: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.job.count({
        where: {
          creator_id: creatorId,
          creator_type: CreatorType.MIS_USER
        }
      })
    ]);

    return {
      jobs: jobs.map(job => ({
        ...job,
        applications_count: job._count.applications
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    console.error('Error fetching jobs by MIS user:', error);
    throw new Error('Failed to fetch jobs');
  }
}


// Update job status

export async function updateJobStatus(jobId: string, status: JobStatus, creatorId: string): Promise<boolean> {
  try {
    const updateData: any = { status };
    
    // Set published_at when publishing
    if (status === JobStatus.PUBLISHED) {
      updateData.published_at = new Date();
    }

    const result = await prisma.job.updateMany({
      where: {
        id: jobId,
        creator_id: creatorId,
        creator_type: CreatorType.MIS_USER
      },
      data: updateData
    });

    return result.count > 0;
  } catch (error) {
    console.error('Error updating job status:', error);
    throw new Error('Failed to update job status');
  }
}


// Get all skills for job creation

export async function getAllSkills() {
  try {
    const skills = await prisma.skill.findMany({
      where: {
        is_active: true
      },
      select: {
        id: true,
        name: true,
        category: true
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    });

    return skills;
  } catch (error) {
    console.error('Error fetching skills:', error);
    throw new Error('Failed to fetch skills');
  }
}

// Update a job

export async function updateJob(jobId: string, data: UpdateJobData, creatorId: string): Promise<Job | null> {
  try {
    console.log(`=== UPDATING JOB: ${jobId} ===`);
    console.log('Update data:', { title: data.title, status: data.status });

    // Verify the job exists and belongs to the creator
    const existingJob = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        skills: {
          include: {
            skill: true
          }
        }
      }
    });

    if (!existingJob) {
      console.log('❌ Job not found');
      return null;
    }

    if (existingJob.creator_id !== creatorId) {
      console.log('❌ Access denied - user did not create this job');
      return null;
    }

    console.log('✅ Job found and permissions verified');

    // Map enum values to match Prisma schema exactly (lowercase in your schema)
    const mapExperienceLevel = (level: string) => {
      const mapping: Record<string, string> = {
        'entry_level': 'entry',
        'mid_level': 'mid', 
        'senior_level': 'senior',
        'executive_level': 'lead' // Assuming executive maps to lead
      };
      return mapping[level] || level;
    };

    const mapJobType = (type: string) => {
      const mapping: Record<string, string> = {
        'full_time': 'full_time',
        'part_time': 'part_time',
        'contract': 'contract',
        'temporary': 'contract', // Map temporary to contract since it's not in your schema
        'internship': 'internship',
        'volunteer': 'freelance', // Map volunteer to freelance since it's not in your schema
        'freelance': 'freelance'
      };
      return mapping[type] || type;
    };

    const mapRemoteType = (type: string) => {
      const mapping: Record<string, string> = {
        'onsite': 'onsite',
        'remote': 'remote',
        'hybrid': 'hybrid'
      };
      return mapping[type] || type;
    };

    const mapSalaryType = (type: string) => {
      const mapping: Record<string, string> = {
        'annual': 'annual',
        'monthly': 'monthly',
        'weekly': 'weekly',
        'daily': 'daily',
        'hourly': 'hourly'
      };
      return mapping[type] || type;
    };

    const mapJobStatus = (status: string) => {
      const mapping: Record<string, string> = {
        'draft': 'draft',
        'published': 'published',
        'paused': 'paused',
        'closed': 'closed',
        'archived': 'archived'
      };
      return mapping[status] || status;
    };

    // Prepare update data with proper enum mapping
    const updateData: any = {
      title: data.title,
      description: data.description,
      requirements: data.requirements || null,
      responsibilities: data.responsibilities || null,
      benefits: data.benefits || null,
      job_type: mapJobType(data.job_type),
      experience_level: mapExperienceLevel(data.experience_level),
      location: data.location || null,
      remote_type: mapRemoteType(data.remote_type),
      salary_min: data.salary_min || null,
      salary_max: data.salary_max || null,
      currency: data.currency,
      salary_type: mapSalaryType(data.salary_type),
      equity_offered: data.equity_offered,
      ai_skills_required: data.ai_skills_required,
      application_deadline: data.application_deadline ? new Date(data.application_deadline) : null,
      status: mapJobStatus(data.status),
      priority_level: data.priority_level,
      customCompanyName: data.customCompanyName || null,
      customCompanyEmail: data.customCompanyEmail || null,
      customCompanyPhone: data.customCompanyPhone || null,
      customCompanyWebsite: data.customCompanyWebsite || null,
      updated_at: new Date()
    };

    // Set published_at when publishing for the first time
    if (data.status === JobStatus.PUBLISHED && !existingJob.published_at) {
      updateData.published_at = new Date();
    }

    console.log('Updating job with data fields:', Object.keys(updateData));
    console.log('Enum values:', {
      job_type: updateData.job_type,
      experience_level: updateData.experience_level,
      remote_type: updateData.remote_type,
      salary_type: updateData.salary_type,
      status: updateData.status
    });

    // Update job with skills in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update the job
      const updatedJob = await tx.job.update({
        where: { id: jobId },
        data: updateData
      });

      console.log(`✅ Job updated successfully: ${updatedJob.id}`);

      // Handle skills update if provided
      if (data.skills !== undefined) {
        console.log(`Updating skills for job ${jobId}`);
        
        // Delete existing job skills
        await tx.jobSkill.deleteMany({
          where: { job_id: jobId }
        });

        // Create new job skills if provided
        if (data.skills && data.skills.length > 0) {
          for (const skillData of data.skills) {
            const skillName = skillData.skill_name.trim();
            
            // Find existing skill or create new one
            let skill = await tx.skill.findFirst({
              where: { 
                name: {
                  equals: skillName,
                  mode: 'insensitive'
                }
              }
            });

            if (!skill) {
              // Create new skill if it doesn't exist
              skill = await tx.skill.create({
                data: {
                  name: skillName,
                  category: 'other', // Default category
                  is_active: true
                }
              });
              console.log(`✅ Created new skill: ${skillName}`);
            }

            // Map skill enum values to match your schema
            const mapRequiredLevel = (level: string) => {
              const mapping: Record<string, string> = {
                'required': 'required',
                'preferred': 'preferred',
                'nice_to_have': 'nice_to_have',
                'must_have': 'must_have'
              };
              return mapping[level] || level;
            };

            const mapProficiencyLevel = (level: string) => {
              const mapping: Record<string, string> = {
                'beginner': 'beginner',
                'intermediate': 'intermediate',
                'advanced': 'advanced',
                'expert': 'expert'
              };
              return mapping[level] || level;
            };

            // Create job skill relationship
            await tx.jobSkill.create({
              data: {
                job_id: jobId,
                skill_id: skill.id,
                required_level: mapRequiredLevel(skillData.required_level),
                proficiency_level: mapProficiencyLevel(skillData.proficiency_level),
                years_required: skillData.years_required || null,
                weight: skillData.weight || 1.0
              }
            });
          }
        }
      }

      // Fetch the complete updated job with skills
      const completeJob = await tx.job.findUnique({
        where: { id: jobId },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo_url: true,
              industry: true
            }
          },
          skills: {
            include: {
              skill: {
                select: {
                  id: true,
                  name: true,
                  category: true
                }
              }
            }
          }
        }
      });

      return completeJob;
    });

    if (!result) {
      throw new Error('Failed to update job - transaction returned null');
    }

    console.log(`✅ Job update completed successfully: ${result.id}`);

    // Transform the result to match our Job interface
    return {
      id: result.id,
      creator_id: result.creator_id,
      creator_type: result.creator_type as CreatorType,
      title: result.title,
      description: result.description,
      requirements: result.requirements || undefined,
      responsibilities: result.responsibilities || undefined,
      benefits: result.benefits || undefined,
      job_type: result.job_type as any,
      experience_level: result.experience_level as any,
      location: result.location || undefined,
      remote_type: result.remote_type as any,
      salary_min: result.salary_min || undefined,
      salary_max: result.salary_max || undefined,
      currency: result.currency,
      salary_type: result.salary_type as any,
      equity_offered: result.equity_offered,
      ai_skills_required: result.ai_skills_required,
      application_deadline: result.application_deadline?.toISOString() || undefined,
      status: result.status as JobStatus,
      published_at: result.published_at?.toISOString() || undefined,
      priority_level: result.priority_level,
      views_count: result.views_count,
      applications_count: result.applications_count,
      company_id: result.company_id || undefined,
      customCompanyName: result.customCompanyName || undefined,
      customCompanyEmail: result.customCompanyEmail || undefined,
      customCompanyPhone: result.customCompanyPhone || undefined,
      customCompanyWebsite: result.customCompanyWebsite || undefined,
      created_at: result.created_at.toISOString(),
      updated_at: result.updated_at.toISOString(),
      company: result.company || undefined,
      skills: result.skills?.map(jobSkill => ({
        id: jobSkill.id,
        job_id: jobSkill.job_id,
        skill_id: jobSkill.skill_id,
        required_level: jobSkill.required_level as any,
        proficiency_level: jobSkill.proficiency_level as any,
        years_required: jobSkill.years_required || undefined,
        weight: jobSkill.weight,
        skill: jobSkill.skill
      })) || []
    };

  } catch (error) {
    console.error('❌ Error updating job:', error);
    
    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('Foreign key constraint')) {
        throw new Error('Database reference error - please contact administrator');
      }
      if (error.message.includes('Unique constraint')) {
        throw new Error('A job with similar details already exists');
      }
      if (error.message.includes('Invalid value for argument')) {
        console.error('Enum validation error:', error.message);
        throw new Error('Invalid field value - please check your selections');
      }
      
      // Re-throw user-friendly errors
      throw error;
    }
    
    throw new Error('Failed to update job - please try again');
  }
}