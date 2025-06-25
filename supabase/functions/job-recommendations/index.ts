import { corsHeaders } from '../_shared/cors.ts'
import { requireAuth, createErrorResponse, createSuccessResponse, supabaseAdmin, getUserProfile } from '../_shared/auth.ts'
import { generateJobRecommendations } from '../_shared/ai.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'GET') {
    return createErrorResponse('Method not allowed', 405)
  }

  try {
    const user = await requireAuth(req)
    
    // Get query parameters
    const url = new URL(req.url)
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 20)
    const location = url.searchParams.get('location')
    const job_type = url.searchParams.get('job_type')

    // Get user's full profile including skills, experience, and education
    const userProfile = await getUserProfile(user.id)

    // Get user's skills
    const { data: skills } = await supabaseAdmin
      .from('skills')
      .select('name, endorsements_count')
      .eq('profile_id', user.id)

    // Get user's experience
    const { data: experiences } = await supabaseAdmin
      .from('experiences')
      .select('*')
      .eq('profile_id', user.id)
      .order('start_date', { ascending: false })

    // Get user's education
    const { data: education } = await supabaseAdmin
      .from('education')
      .select('*')
      .eq('profile_id', user.id)
      .order('start_date', { ascending: false })

    // Combine profile data
    const fullProfile = {
      ...userProfile,
      skills,
      experiences,
      education
    }

    // Get available jobs (excluding ones user has already applied to)
    const { data: appliedJobIds } = await supabaseAdmin
      .from('job_applications')
      .select('job_id')
      .eq('applicant_id', user.id)

    const excludeIds = appliedJobIds?.map(app => app.job_id) || []

    let jobsQuery = supabaseAdmin
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
        created_at,
        companies!jobs_company_id_fkey (
          id,
          name,
          logo_url,
          industry
        )
      `)
      .eq('status', 'active')
      .limit(50) // Get more than needed for AI filtering

    if (excludeIds.length > 0) {
      jobsQuery = jobsQuery.not('id', 'in', `(${excludeIds.join(',')})`)
    }

    // Apply optional filters
    if (location) {
      jobsQuery = jobsQuery.or(`location.ilike.%${location}%,remote_work.eq.true`)
    }

    if (job_type) {
      jobsQuery = jobsQuery.eq('job_type', job_type)
    }

    // Get jobs created in the last 90 days for freshness
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
    jobsQuery = jobsQuery.gte('created_at', ninetyDaysAgo.toISOString())

    const { data: availableJobs, error: jobsError } = await jobsQuery

    if (jobsError) {
      console.error('Jobs query error:', jobsError)
      return createErrorResponse('Failed to fetch jobs', 500)
    }

    if (!availableJobs || availableJobs.length === 0) {
      return createSuccessResponse({
        recommendations: [],
        message: 'No new jobs available matching your criteria'
      })
    }

    // Format jobs for AI analysis
    const jobsForAI = availableJobs.map(job => ({
      ...job,
      company_name: job.companies?.name || 'Unknown Company'
    }))

    // Get AI recommendations
    const aiRecommendations = await generateJobRecommendations(fullProfile, jobsForAI)

    // Combine AI recommendations with job details
    const recommendations = aiRecommendations
      .slice(0, limit)
      .map(rec => {
        const job = availableJobs.find(j => j.id === rec.jobId)
        return {
          job: {
            ...job,
            company: job?.companies,
            companies: undefined
          },
          match_score: rec.matchScore,
          match_reasons: rec.reasons,
          recommendation_id: `${user.id}_${rec.jobId}_${Date.now()}`
        }
      })
      .filter(rec => rec.job) // Remove any jobs that weren't found

    // Log recommendation for analytics
    try {
      await supabaseAdmin
        .from('recommendation_logs')
        .insert({
          user_id: user.id,
          type: 'job_recommendation',
          data: {
            requested_count: limit,
            returned_count: recommendations.length,
            filters: { location, job_type },
            recommendations: recommendations.map(r => ({
              job_id: r.job?.id,
              match_score: r.match_score
            }))
          }
        })
    } catch (logError) {
      // Don't fail the request if logging fails
      console.error('Failed to log recommendation:', logError)
    }

    return createSuccessResponse({
      recommendations,
      profile_summary: {
        skills_count: skills?.length || 0,
        experience_years: experiences?.reduce((years, exp) => {
          if (exp.start_date) {
            const start = new Date(exp.start_date)
            const end = exp.end_date ? new Date(exp.end_date) : new Date()
            const expYears = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365)
            return years + expYears
          }
          return years
        }, 0) || 0,
        education_count: education?.length || 0,
        location: userProfile.location
      },
      meta: {
        total_available_jobs: availableJobs.length,
        excluded_applied_jobs: excludeIds.length,
        ai_analysis_completed: true
      }
    })

  } catch (error) {
    console.error('Job recommendations error:', error)
    return createErrorResponse('Internal server error', 500)
  }
})