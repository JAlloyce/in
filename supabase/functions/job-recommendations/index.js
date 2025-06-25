import { corsHeaders } from '../_shared/cors.js'
import { requireAuth, createErrorResponse, createSuccessResponse, supabaseAdmin, getUserProfile } from '../_shared/auth.js'
import { generateJobRecommendations } from '../_shared/ai.js'

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
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 20)

    // Get user profile with skills, experiences, and education
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select(`
        id,
        name,
        headline,
        about,
        location,
        skills!skills_user_id_fkey (
          id,
          name,
          endorsed_count
        ),
        experiences!experiences_user_id_fkey (
          id,
          title,
          company,
          location,
          current,
          start_date,
          end_date
        ),
        education!education_user_id_fkey (
          id,
          degree,
          field_of_study,
          institution,
          start_date,
          end_date
        )
      `)
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      return createErrorResponse('User profile not found', 404)
    }

    // Get jobs that user hasn't applied to
    const { data: appliedJobs } = await supabaseAdmin
      .from('job_applications')
      .select('job_id')
      .eq('applicant_id', user.id)

    const appliedJobIds = appliedJobs?.map(app => app.job_id) || []

    // Get available jobs
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
        companies!jobs_company_id_fkey (
          id,
          name,
          logo_url,
          industry,
          verified
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(50) // Get more jobs for AI to choose from

    if (appliedJobIds.length > 0) {
      jobsQuery = jobsQuery.not('id', 'in', `(${appliedJobIds.join(',')})`)
    }

    const { data: availableJobs, error: jobsError } = await jobsQuery

    if (jobsError) {
      console.error('Jobs fetch error:', jobsError)
      return createErrorResponse('Failed to fetch jobs', 500)
    }

    if (!availableJobs || availableJobs.length === 0) {
      return createSuccessResponse({
        recommendations: [],
        message: 'No jobs available for recommendations'
      })
    }

    // Generate AI recommendations
    const recommendations = await generateJobRecommendations(userProfile, availableJobs)

    // Get the recommended jobs with full details
    const recommendedJobIds = recommendations.slice(0, limit).map(rec => rec.jobId)
    
    const { data: recommendedJobs } = await supabaseAdmin
      .from('jobs')
      .select(`
        id,
        title,
        description,
        salary_min,
        salary_max,
        location,
        job_type,
        experience_level,
        remote_work,
        applications_count,
        created_at,
        companies!jobs_company_id_fkey (
          id,
          name,
          logo_url,
          verified
        )
      `)
      .in('id', recommendedJobIds)

    // Merge job details with AI recommendations
    const finalRecommendations = recommendations
      .slice(0, limit)
      .map(rec => {
        const job = recommendedJobs?.find(j => j.id === rec.jobId)
        if (!job) return null
        
        return {
          job: {
            ...job,
            company: job.companies,
            companies: undefined
          },
          match_score: rec.matchScore,
          match_reasons: rec.reasons
        }
      })
      .filter(Boolean)

    // Log recommendations for analytics
    if (finalRecommendations.length > 0) {
      await supabaseAdmin
        .from('analytics_events')
        .insert({
          user_id: user.id,
          event_type: 'job_recommendations_generated',
          data: {
            count: finalRecommendations.length,
            job_ids: recommendedJobIds
          }
        })
        .catch(err => console.error('Analytics error:', err)) // Don't fail if analytics fails
    }

    return createSuccessResponse({
      recommendations: finalRecommendations,
      user_profile: {
        skills: userProfile.skills?.map(s => s.name) || [],
        location: userProfile.location,
        experience_count: userProfile.experiences?.length || 0
      }
    })

  } catch (error) {
    console.error('Job recommendations error:', error)
    return createErrorResponse('Internal server error', 500)
  }
})