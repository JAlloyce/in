/**
 * Perplexity AI Service
 * Handles AI-powered task generation, content suggestions, and clarifications
 */

class PerplexityService {
  constructor() {
    this.apiKey = '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';
    this.baseUrl = 'https://api.perplexity.ai/chat/completions';
    this.model = 'llama-3.1-sonar-large-128k-online'; // Use the larger context model for comprehensive responses
  }

  /**
   * Make API call to Perplexity
   */
  async makeRequest(messages, options = {}) {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          max_tokens: options.maxTokens || 4000,
          temperature: options.temperature || 0.7,
          stream: false,
          return_citations: true,
          return_images: false,
          ...options
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        content: data.choices[0]?.message?.content || '',
        citations: data.citations || [],
        usage: data.usage || {}
      };
    } catch (error) {
      console.error('Perplexity API Error:', error);
      return {
        success: false,
        error: error.message,
        content: '',
        citations: []
      };
    }
  }

  /**
   * Generate comprehensive learning objectives for a topic
   */
  async generateLearningObjectives(topic, context = '') {
    const prompt = `You are an expert educational consultant. Generate comprehensive learning objectives for the topic: "${topic}".

${context ? `Additional context: ${context}` : ''}

Provide:
1. 5-7 specific, measurable learning objectives
2. Prerequisites and recommended prior knowledge
3. Key concepts and terminology
4. Real-world applications and examples
5. Assessment criteria for each objective

Format your response in a structured, educational manner suitable for academic study planning.`;

    const messages = [
      { role: 'user', content: prompt }
    ];

    return await this.makeRequest(messages, { maxTokens: 3000 });
  }

  /**
   * Generate detailed study tasks with resources
   */
  async generateStudyTasks(topic, objectives = '', materials = '') {
    const prompt = `Create a comprehensive study plan for the topic: "${topic}".

${objectives ? `Learning Objectives: ${objectives}` : ''}
${materials ? `Available Materials: ${materials}` : ''}

Generate:
1. 8-12 specific study tasks organized by difficulty
2. Time estimates for each task
3. Recommended study methods and techniques
4. Practice exercises and activities
5. Web resources and links for additional learning
6. Milestones and checkpoints
7. Assessment activities

Include actual URLs to high-quality educational resources where possible. Focus on actionable, specific tasks that lead to mastery.`;

    const messages = [
      { role: 'user', content: prompt }
    ];

    return await this.makeRequest(messages, { maxTokens: 4000 });
  }

  /**
   * Generate learning content and resources with web links
   */
  async generateContentSuggestions(topic, currentMaterials = '', learningStyle = 'comprehensive') {
    const prompt = `Generate comprehensive learning content suggestions for: "${topic}".

${currentMaterials ? `Current materials: ${currentMaterials}` : ''}

Provide:
1. Recommended textbooks and academic resources (with ISBN/links where possible)
2. Online courses and MOOCs (with specific URLs)
3. YouTube channels and video series (with channel names/links)
4. Interactive tools and simulators
5. Practice websites and platforms
6. Research papers and journals
7. Professional communities and forums
8. Mobile apps and software tools
9. Project ideas and hands-on activities
10. Industry certifications and credentials

Focus on high-quality, accessible resources with actual links and specific recommendations. Include both free and premium options.`;

    const messages = [
      { role: 'user', content: prompt }
    ];

    return await this.makeRequest(messages, { maxTokens: 4000 });
  }

  /**
   * Generate complete learning package (objectives + tasks + content)
   */
  async generateCompleteLearningPackage(topic, context = '', materials = '') {
    const prompt = `Create a complete learning package for the topic: "${topic}".

${context ? `Context/Background: ${context}` : ''}
${materials ? `Available Materials: ${materials}` : ''}

Generate a comprehensive learning plan including:

## LEARNING OBJECTIVES
- 5-7 specific, measurable objectives
- Prerequisites and prior knowledge requirements
- Key concepts and terminology to master

## STUDY TASKS & SCHEDULE
- 10-15 structured study tasks organized by difficulty
- Time estimates and recommended sequence
- Practice exercises and activities
- Milestones and assessment checkpoints

## RESOURCES & MATERIALS
- Textbooks and academic resources (with links/ISBN)
- Online courses and video content (specific URLs)
- Interactive tools and practice platforms
- Web resources and documentation
- Community resources and forums

## PRACTICAL APPLICATIONS
- Real-world use cases and examples
- Project ideas and hands-on activities
- Industry applications and career paths

Provide specific, actionable content with actual links and resources. Focus on creating a complete learning journey from beginner to advanced level.`;

    const messages = [
      { role: 'user', content: prompt }
    ];

    return await this.makeRequest(messages, { maxTokens: 4000, temperature: 0.8 });
  }

  /**
   * Analyze document content and generate study recommendations
   */
  async analyzeDocumentContent(documentText, topic = '') {
    const prompt = `Analyze this document content and generate study recommendations:

Document Content:
${documentText.substring(0, 3000)}${documentText.length > 3000 ? '...' : ''}

${topic ? `Related Topic: ${topic}` : ''}

Provide:
1. Key concepts and topics identified in the document
2. Difficulty level assessment
3. Recommended study approach for this material
4. Supplementary resources needed
5. Practice questions or exercises based on the content
6. Related topics to explore
7. Time estimate for studying this material

Make your analysis practical and actionable for effective learning.`;

    const messages = [
      { role: 'user', content: prompt }
    ];

    return await this.makeRequest(messages, { maxTokens: 2500 });
  }

  /**
   * Test API connectivity
   */
  async testAPI() {
    console.log('Testing Perplexity API...');
    
    const result = await this.makeRequest([
      { role: 'user', content: 'Hello! Please respond with a brief test message confirming the API is working.' }
    ]);

    if (result.success) {
      console.log('✅ Perplexity API Test Successful');
      console.log('Response:', result.content);
      console.log('Citations:', result.citations);
      return result;
    } else {
      console.error('❌ Perplexity API Test Failed:', result.error);
      return result;
    }
  }
}

// Create singleton instance
const perplexityService = new PerplexityService();

// Export for use in components
export default perplexityService;

// Also expose for console testing
if (typeof window !== 'undefined') {
  window.testPerplexityAPI = () => perplexityService.testAPI();
  window.perplexityService = perplexityService;
} 