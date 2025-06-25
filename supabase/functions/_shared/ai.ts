export interface AIResponse {
  content: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface JobRecommendation {
  jobId: string
  title: string
  company: string
  matchScore: number
  reasons: string[]
}

export interface ResumeAnalysis {
  skills: string[]
  experienceLevel: string
  strengths: string[]
  improvements: string[]
  summary: string
}

export async function callPerplexityAI(prompt: string, model: string = 'llama-3.1-sonar-small-128k-online'): Promise<AIResponse> {
  const apiKey = Deno.env.get('PERPLEXITY_API_KEY')
  if (!apiKey) {
    throw new Error('Perplexity API key not configured')
  }

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    })
  })

  if (!response.ok) {
    throw new Error(`Perplexity API error: ${response.statusText}`)
  }

  const data = await response.json()
  
  return {
    content: data.choices[0].message.content,
    usage: data.usage
  }
}

export async function generateJobRecommendations(userProfile: any, availableJobs: any[]): Promise<JobRecommendation[]> {
  const prompt = `
Based on this user profile:
- Skills: ${userProfile.skills?.map((s: any) => s.name).join(', ') || 'Not specified'}
- Experience: ${userProfile.experiences?.map((e: any) => `${e.title} at ${e.company}`).join(', ') || 'Not specified'}
- Education: ${userProfile.education?.map((e: any) => `${e.degree} from ${e.institution}`).join(', ') || 'Not specified'}
- Location: ${userProfile.location || 'Not specified'}
- About: ${userProfile.about || 'Not specified'}

Analyze these job opportunities and recommend the top 5 matches:
${availableJobs.map(job => `
- Job ID: ${job.id}
- Title: ${job.title}
- Company: ${job.company_name}
- Location: ${job.location}
- Type: ${job.job_type}
- Description: ${job.description.substring(0, 200)}...
`).join('\n')}

For each recommended job, provide:
1. Match score (0-100)
2. Specific reasons why it's a good match
3. Brief explanation

Format as JSON array with this structure:
[{
  "jobId": "uuid",
  "matchScore": 85,
  "reasons": ["Strong skill match in React", "Location preference"]
}]
`

  try {
    const aiResponse = await callPerplexityAI(prompt)
    
    // Extract JSON from response
    const jsonMatch = aiResponse.content.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error('Invalid AI response format')
    }

    const recommendations = JSON.parse(jsonMatch[0])
    
    return recommendations.map((rec: any) => ({
      jobId: rec.jobId,
      title: availableJobs.find(j => j.id === rec.jobId)?.title || '',
      company: availableJobs.find(j => j.id === rec.jobId)?.company_name || '',
      matchScore: rec.matchScore,
      reasons: rec.reasons
    }))
  } catch (error) {
    console.error('Error generating job recommendations:', error)
    return []
  }
}

export async function analyzeResume(resumeText: string): Promise<ResumeAnalysis> {
  const prompt = `
Analyze this resume and provide structured feedback:

${resumeText}

Please provide analysis in this JSON format:
{
  "skills": ["skill1", "skill2", ...],
  "experienceLevel": "junior|mid|senior|executive",
  "strengths": ["strength1", "strength2", ...],
  "improvements": ["improvement1", "improvement2", ...],
  "summary": "Brief professional summary"
}

Focus on:
1. Technical and soft skills mentioned
2. Overall experience level based on positions and years
3. Key strengths that stand out
4. Areas for improvement
5. Professional summary in 2-3 sentences
`

  try {
    const aiResponse = await callPerplexityAI(prompt)
    
    // Extract JSON from response
    const jsonMatch = aiResponse.content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Invalid AI response format')
    }

    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error('Error analyzing resume:', error)
    return {
      skills: [],
      experienceLevel: 'junior',
      strengths: [],
      improvements: ['Unable to analyze resume at this time'],
      summary: 'Resume analysis unavailable'
    }
  }
}

export async function generatePostInsights(postContent: string): Promise<{
  sentiment: string
  topics: string[]
  engagementPrediction: number
  suggestions: string[]
}> {
  const prompt = `
Analyze this social media post for a professional platform:

"${postContent}"

Provide analysis in this JSON format:
{
  "sentiment": "positive|neutral|negative",
  "topics": ["topic1", "topic2", ...],
  "engagementPrediction": 75,
  "suggestions": ["suggestion1", "suggestion2", ...]
}

Consider:
1. Overall sentiment/tone
2. Main topics or themes
3. Predicted engagement score (0-100)
4. Suggestions to improve engagement
`

  try {
    const aiResponse = await callPerplexityAI(prompt)
    
    const jsonMatch = aiResponse.content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Invalid AI response format')
    }

    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error('Error analyzing post:', error)
    return {
      sentiment: 'neutral',
      topics: [],
      engagementPrediction: 50,
      suggestions: ['Unable to analyze post at this time']
    }
  }
}

export async function generateStudyContent(topic: string, userLevel: string = 'beginner'): Promise<{
  content: string
  resources: string[]
  tasks: string[]
  timeline: string
}> {
  const prompt = `
Create study content for this topic: "${topic}"
User level: ${userLevel}

Provide structured learning content in this JSON format:
{
  "content": "Detailed explanation of the topic with key concepts",
  "resources": ["resource1", "resource2", ...],
  "tasks": ["task1", "task2", ...],
  "timeline": "Suggested timeline for mastering this topic"
}

Include:
1. Clear explanation appropriate for the user level
2. List of recommended resources (books, websites, courses)
3. Practical tasks or exercises
4. Realistic timeline for learning
`

  try {
    const aiResponse = await callPerplexityAI(prompt)
    
    const jsonMatch = aiResponse.content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Invalid AI response format')
    }

    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error('Error generating study content:', error)
    return {
      content: 'Unable to generate content at this time',
      resources: [],
      tasks: [],
      timeline: 'Please try again later'
    }
  }
}

export async function generateConnectionSuggestions(userProfile: any, potentialConnections: any[]): Promise<any[]> {
  const prompt = `
Based on this user's profile:
- Skills: ${userProfile.skills?.map((s: any) => s.name).join(', ') || 'Not specified'}
- Industry: ${userProfile.headline || 'Not specified'}
- Location: ${userProfile.location || 'Not specified'}

Rank these potential connections by relevance:
${potentialConnections.map(person => `
- ID: ${person.id}
- Name: ${person.name}
- Headline: ${person.headline}
- Location: ${person.location}
- Mutual connections: ${person.mutual_count || 0}
`).join('\n')}

Provide ranking with reasons in JSON format:
[{
  "userId": "uuid",
  "score": 85,
  "reason": "Same industry and location"
}]
`

  try {
    const aiResponse = await callPerplexityAI(prompt)
    
    const jsonMatch = aiResponse.content.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      return potentialConnections.map(p => ({
        userId: p.id,
        score: 50,
        reason: 'General recommendation'
      }))
    }

    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error('Error generating connection suggestions:', error)
    return potentialConnections.map(p => ({
      userId: p.id,
      score: 50,
      reason: 'Unable to analyze at this time'
    }))
  }
}