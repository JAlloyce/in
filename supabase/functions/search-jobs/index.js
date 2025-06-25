import { corsHeaders } from '../_shared/cors.js'
import { requireAuth, createErrorResponse, createSuccessResponse, supabaseAdmin } from '../_shared/auth.js'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'GET') {
    return createErrorResponse('Method not allowed', 405)
  }

  try {
    const user = await requireAuth(req)
    const url = new URL(req.url)
    
    // Parse query parameters
    const query = url.searchParams.get('query') || ''
    const location = url.searchParams.get('location') || ''
    const job_type = url.searchParams.get('job_type') || ''
    const experience_level = url.searchParams.get('experience_level') || ''
    const remote_work = url.searchParams.get('remote_work') === 'true'
    const salary_min = parseInt(url.searchParams.get('salary_min') || '0')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50)
    
    const offset = (page - 1) * limit

    // Build the search query
    let searchQuery = supabaseAdmin
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
        status,
        applications_count,
        views_count,
        created_at,
        companies!jobs_company_id_fkey (
          id,
          name,
          logo_url,
          verified
        ),
        profiles!jobs_posted_by_fkey (
          id,
          name,
          avatar_url
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply search filters
    if (query) {
      searchQuery = searchQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    }

    if (location) {
      searchQuery = searchQuery.ilike('location', `%${location}%`)
    }

    if (job_type) {
      searchQuery = searchQuery.eq('job_type', job_type)
    }

    if (experience_level) {
      searchQuery = searchQuery.eq('experience_level', experience_level)
    }

    if (remote_work) {
      searchQuery = searchQuery.eq('remote_work', true)
    }

    if (salary_min > 0) {
      searchQuery = searchQuery.gte('salary_min', salary_min)
    }

    const { data: jobs, error } = await searchQuery

    if (error) {
      console.error('Job search error:', error)
      return createErrorResponse('Failed to search jobs', 500)
    }

    // Process jobs to add user-specific data
    const processedJobs = await Promise.all(jobs?.map(async (job) => {
      // Check if user has applied to this job
      const { data: application } = await supabaseAdmin
        .from('job_applications')
        .select('id, status')
        .eq('job_id', job.id)
        .eq('applicant_id', user.id)
        .single()

      // Update view count
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
        // Clean up the response
        companies: undefined,
        profiles: undefined
      }
    }) || [])

    // Get total count for pagination
    let countQuery = supabaseAdmin
      .from('jobs')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')

    if (query) {
      countQuery = countQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    }
    if (location) {
      countQuery = countQuery.ilike('location', `%${location}%`)
    }
    if (job_type) {
      countQuery = countQuery.eq('job_type', job_type)
    }
    if (experience_level) {
      countQuery = countQuery.eq('experience_level', experience_level)
    }
    if (remote_work) {
      countQuery = countQuery.eq('remote_work', true)
    }
    if (salary_min > 0) {
      countQuery = countQuery.gte('salary_min', salary_min)
    }

    const { count } = await countQuery

    return createSuccessResponse({
      jobs: processedJobs,
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit)
      },
      filters: {
        query,
        location,
        job_type,
        experience_level,
        remote_work,
        salary_min
      }
    })

  } catch (error) {
    console.error('Search jobs error:', error)
    return createErrorResponse('Internal server error', 500)
  }
})