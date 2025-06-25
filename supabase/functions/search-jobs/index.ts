import { corsHeaders } from '../_shared/cors.ts'
import { requireAuth, createErrorResponse, createSuccessResponse, supabaseAdmin } from '../_shared/auth.ts'

interface JobSearchParams {
  query?: string
  location?: string
  job_type?: string
  experience_level?: string
  remote_work?: boolean
  salary_min?: number
  salary_max?: number
  page?: number
  limit?: number
  sort?: 'relevance' | 'date' | 'salary'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'GET') {
    return createErrorResponse('Method not allowed', 405)
  }

  try {
    const user = await requireAuth(req)
    
    // Parse query parameters
    const url = new URL(req.url)
    const params: JobSearchParams = {
      query: url.searchParams.get('query') || undefined,
      location: url.searchParams.get('location') || undefined,
      job_type: url.searchParams.get('job_type') || undefined,
      experience_level: url.searchParams.get('experience_level') || undefined,
      remote_work: url.searchParams.get('remote_work') === 'true',
      salary_min: url.searchParams.get('salary_min') ? parseInt(url.searchParams.get('salary_min')!) : undefined,
      salary_max: url.searchParams.get('salary_max') ? parseInt(url.searchParams.get('salary_max')!) : undefined,
      page: parseInt(url.searchParams.get('page') || '1'),
      limit: Math.min(parseInt(url.searchParams.get('limit') || '20'), 50),
      sort: (url.searchParams.get('sort') as JobSearchParams['sort']) || 'relevance'
    }

    const offset = ((params.page || 1) - 1) * (params.limit || 20)

    // Build the search query
    let query = supabaseAdmin
      .from('jobs')
      .select(`
        id,
        title,
        description,
        requirements,
        salary_min,
        salary_max,
        location,
        job_type,
        experience_level,
        remote_work,
        applications_count,
        views_count,
        created_at,
        companies!jobs_company_id_fkey (
          id,
          name,
          logo_url,
          industry,
          size
        ),
        profiles!jobs_posted_by_fkey (
          id,
          name,
          avatar_url
        )
      `)
      .eq('status', 'active')
      .range(offset, offset + (params.limit || 20) - 1)

    // Apply filters
    if (params.query) {
      // Use PostgreSQL full-text search
      query = query.textSearch('title,description', params.query, {
        type: 'websearch',
        config: 'english'
      })
    }

    if (params.location) {
      query = query.ilike('location', `%${params.location}%`)
    }

    if (params.job_type) {
      query = query.eq('job_type', params.job_type)
    }

    if (params.experience_level) {
      query = query.eq('experience_level', params.experience_level)
    }

    if (params.remote_work !== undefined) {
      query = query.eq('remote_work', params.remote_work)
    }

    if (params.salary_min) {
      query = query.gte('salary_min', params.salary_min)
    }

    if (params.salary_max) {
      query = query.lte('salary_max', params.salary_max)
    }

    // Apply sorting
    switch (params.sort) {
      case 'date':
        query = query.order('created_at', { ascending: false })
        break
      case 'salary':
        query = query.order('salary_max', { ascending: false, nullsLast: true })
        break
      case 'relevance':
      default:
        if (params.query) {
          // PostgreSQL ranks by relevance automatically with text search
          query = query.order('created_at', { ascending: false })
        } else {
          query = query.order('created_at', { ascending: false })
        }
        break
    }

    const { data: jobs, error } = await query

    if (error) {
      console.error('Job search error:', error)
      return createErrorResponse('Failed to search jobs', 500)
    }

    // Process jobs and check if user has applied
    const processedJobs = await Promise.all(jobs?.map(async (job) => {
      // Check if user has applied to this job
      const { data: application } = await supabaseAdmin
        .from('job_applications')
        .select('id, status, applied_at')
        .eq('job_id', job.id)
        .eq('applicant_id', user.id)
        .single()

      // Update view count for each job
      await supabaseAdmin
        .from('jobs')
        .update({ views_count: (job.views_count || 0) + 1 })
        .eq('id', job.id)

      return {
        ...job,
        company: job.companies,
        posted_by: job.profiles,
        user_applied: !!application,
        application_status: application?.status || null,
        applied_at: application?.applied_at || null,
        // Remove raw relations
        companies: undefined,
        profiles: undefined
      }
    }) || [])

    // Get total count for pagination
    let countQuery = supabaseAdmin
      .from('jobs')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')

    if (params.query) {
      countQuery = countQuery.textSearch('title,description', params.query, {
        type: 'websearch',
        config: 'english'
      })
    }

    if (params.location) {
      countQuery = countQuery.ilike('location', `%${params.location}%`)
    }

    if (params.job_type) {
      countQuery = countQuery.eq('job_type', params.job_type)
    }

    if (params.experience_level) {
      countQuery = countQuery.eq('experience_level', params.experience_level)
    }

    if (params.remote_work !== undefined) {
      countQuery = countQuery.eq('remote_work', params.remote_work)
    }

    if (params.salary_min) {
      countQuery = countQuery.gte('salary_min', params.salary_min)
    }

    if (params.salary_max) {
      countQuery = countQuery.lte('salary_max', params.salary_max)
    }

    const { count } = await countQuery

    return createSuccessResponse({
      jobs: processedJobs,
      pagination: {
        page: params.page || 1,
        limit: params.limit || 20,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / (params.limit || 20))
      },
      filters: {
        query: params.query,
        location: params.location,
        job_type: params.job_type,
        experience_level: params.experience_level,
        remote_work: params.remote_work,
        salary_range: params.salary_min || params.salary_max ? {
          min: params.salary_min,
          max: params.salary_max
        } : null
      }
    })

  } catch (error) {
    console.error('Job search error:', error)
    return createErrorResponse('Internal server error', 500)
  }
})