// app/api/jobs/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth'; // Assuming you have authentication

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Get the current user (you might need to adjust this based on your auth system)
    // const session = await auth(); // Uncomment if you have auth
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }
    
    // For now, using a placeholder creator_id - replace with actual user ID
    const creatorId = 'current-user-id'; // Replace with session.user.id or however you get current user
    
    let companyId = data.companyId;
    
    // If using custom company, create it first
    if (data.useCustomCompany) {
      try {
        // Generate a slug from the company name
        const generateSlug = (name: string): string => {
          return name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
            .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
        };

        let baseSlug = generateSlug(data.customCompany.trim());
        let slug = baseSlug;
        let counter = 1;

        // Check if slug already exists and make it unique
        while (true) {
          const existingCompany = await prisma.company.findUnique({
            where: { slug }
          });
          
          if (!existingCompany) {
            break;
          }
          
          slug = `${baseSlug}-${counter}`;
          counter++;
        }

        const newCompany = await prisma.company.create({
          data: {
            name: data.customCompany.trim(),
            slug: slug,
            email: data.customContactEmail.trim(),
            phone: data.customContactPhone?.trim() || null,
            website: data.customWebsite?.trim() || null,
            description: null, // You might want to add this field to your form
            logo_url: null
          }
        });
        companyId = newCompany.id;
      } catch (companyError) {
        console.error('Failed to create company:', companyError);
        return NextResponse.json(
          { error: 'Failed to create company. Company name might already exist.' },
          { status: 400 }
        );
      }
    }
    
    // Validate required fields
    if (!data.title?.trim()) {
      return NextResponse.json(
        { error: 'Job title is required' },
        { status: 400 }
      );
    }
    
    if (!data.description?.trim()) {
      return NextResponse.json(
        { error: 'Job description is required' },
        { status: 400 }
      );
    }
    
    if (!companyId) {
      return NextResponse.json(
        { error: 'Company selection is required' },
        { status: 400 }
      );
    }
    
    // Validate salary range
    if (data.salaryMin && data.salaryMax) {
      const minSalary = parseFloat(data.salaryMin);
      const maxSalary = parseFloat(data.salaryMax);
      if (minSalary >= maxSalary) {
        return NextResponse.json(
          { error: 'Maximum salary must be greater than minimum salary' },
          { status: 400 }
        );
      }
    }
    
    // Create the job
    const job = await prisma.job.create({
      data: {
        title: data.title.trim(),
        description: data.description.trim(),
        job_type: data.jobType,
        experience_level: data.experienceLevel,
        location: data.location?.trim() || null,
        remote_type: data.remoteType,
        salary_min: data.salaryMin ? parseFloat(data.salaryMin) : null,
        salary_max: data.salaryMax ? parseFloat(data.salaryMax) : null,
        currency: data.currency,
        application_deadline: data.applicationDeadline ? new Date(data.applicationDeadline) : null,
        status: data.status || 'draft',
        company_id: companyId,
        creator_id: creatorId, // Use actual user ID
        creator_type: data.creatorType || 'mis_user'
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true,
            website: true
          }
        }
      }
    });

    return NextResponse.json(job, { status: 201 });
    
  } catch (error) {
    console.error('Job creation error:', error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A job with this title already exists for this company' },
        { status: 400 }
      );
    }
    
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Invalid company selection' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create job posting' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const companyId = searchParams.get('companyId');
    
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (status) where.status = status;
    if (companyId) where.company_id = companyId;
    
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              email: true,
              website: true,
              logo_url: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.job.count({ where })
    ]);
    
    return NextResponse.json({
      jobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Failed to fetch jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}