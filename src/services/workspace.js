import { supabase } from '../lib/supabase.js';

/**
 * Workspace Service
 * Handles all workspace-related data operations including persistence, 
 * retrieval, and synchronization for topics, tasks, materials, and activities
 */
class WorkspaceService {
  constructor() {
    this.cache = {
      topics: [],
      tasks: [],
      activities: [],
      lastFetch: null
    };
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  }

  /**
   * Fetch all workspace data for the current user
   */
  async fetchWorkspaceData() {
    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      // Check cache first (if data is less than 2 minutes old)
      if (this.cache.lastFetch && 
          (new Date() - this.cache.lastFetch) < 120000 && 
          this.cache.topics.length >= 0) {
        console.log('📦 Using cached workspace data');
        return {
          topics: this.cache.topics,
          tasks: this.cache.tasks,
          activities: this.cache.activities
        };
      }

      let topics = [];
      let tasks = [];
      let activities = [];

      // Fetch topics with materials (handle missing tables)
      try {
        const { data: topicsData, error: topicsError } = await supabase
          .from('workspace_topics')
          .select(`
            *,
            materials:workspace_materials(*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (topicsError) {
          if (topicsError.code === '42P01') {
            console.warn('workspace_topics table does not exist yet');
          } else {
            throw topicsError;
          }
        } else {
          topics = topicsData || [];
        }
      } catch (error) {
        console.warn('Error fetching topics:', error.message);
      }

      // Fetch tasks (handle missing tables)
      try {
        const { data: tasksData, error: tasksError } = await supabase
          .from('workspace_tasks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (tasksError) {
          if (tasksError.code === '42P01') {
            console.warn('workspace_tasks table does not exist yet');
          } else {
            throw tasksError;
          }
        } else {
          tasks = tasksData || [];
        }
      } catch (error) {
        console.warn('Error fetching tasks:', error.message);
      }

      // Fetch activities for analytics (handle missing tables)
      try {
        const { data: activitiesData, error: activitiesError } = await supabase
          .from('workspace_activities')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(100);

        if (activitiesError) {
          if (activitiesError.code === '42P01') {
            console.warn('workspace_activities table does not exist yet');
          } else {
            throw activitiesError;
          }
        } else {
          activities = activitiesData || [];
        }
      } catch (error) {
        console.warn('Error fetching activities:', error.message);
      }

      // Update cache
      this.cache = {
        topics,
        tasks,
        activities,
        lastFetch: new Date()
      };

      return {
        topics,
        tasks,
        activities
      };
    } catch (error) {
      console.error('Error fetching workspace data:', error);
      
      // Return empty data structure instead of throwing
      const fallbackData = {
        topics: [],
        tasks: [],
        activities: []
      };
      
      this.cache = {
        ...fallbackData,
        lastFetch: new Date()
      };
      
      return fallbackData;
    }
  }

  /**
   * Create a new topic
   */
  async createTopic(topicData) {
    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('workspace_topics')
        .insert({
          user_id: user.id,
          title: topicData.title,
          description: topicData.description,
          status: 'active',
          progress: 0,
          metadata: topicData.metadata || {}
        })
        .select()
        .single();

      if (error) {
        // Fallback for stale schema cache: try again without the problematic fields
        if (error.code === 'PGRST204') {
          console.warn(`Schema cache error detected for column: ${error.message}. Retrying with minimal fields.`);
          
          // Try with absolutely minimal fields - just what we know exists
          const { data: retryData, error: retryError } = await supabase
            .from('workspace_topics')
            .insert({
              user_id: user.id,
              title: topicData.title,
              description: topicData.description
            })
            .select()
            .single();

          if (retryError) {
            console.warn('Even minimal insert failed, trying with just title and user_id');
            // Last resort - try with absolute minimum
            const { data: finalData, error: finalError } = await supabase
              .from('workspace_topics')
              .insert({
                user_id: user.id,
                title: topicData.title
              })
              .select()
              .single();
            
            if (finalError) throw finalError;
            return finalData;
          }
          
          return retryData;
        }
        throw error;
      }

      // Log activity
      await this.logActivity('topic_created', data.id, {
        topic_title: data.title
      });

      // Update cache
      this.cache.topics.unshift(data);

      return data;
    } catch (error) {
      console.error('Error creating topic:', error);
      throw error;
    }
  }

  /**
   * Update topic
   */
  async updateTopic(topicId, updates) {
    try {
      const { data, error } = await supabase
        .from('workspace_topics')
        .update(updates)
        .eq('id', topicId)
        .select()
        .single();

      if (error) throw error;

      // Update cache
      const index = this.cache.topics.findIndex(t => t.id === topicId);
      if (index !== -1) {
        this.cache.topics[index] = { ...this.cache.topics[index], ...data };
      }

      return data;
    } catch (error) {
      console.error('Error updating topic:', error);
      throw error;
    }
  }

  /**
   * Delete topic and all related data
   */
  async deleteTopic(topicId) {
    try {
      // Delete materials first
      await supabase
        .from('workspace_materials')
        .delete()
        .eq('topic_id', topicId);

      // Delete tasks related to this topic
      await supabase
        .from('workspace_tasks')
        .delete()
        .eq('topic_id', topicId);

      // Delete the topic
      const { error } = await supabase
        .from('workspace_topics')
        .delete()
        .eq('id', topicId);

      if (error) throw error;

      // Log activity
      await this.logActivity('topic_deleted', topicId);

      // Update cache
      this.cache.topics = this.cache.topics.filter(t => t.id !== topicId);
      this.cache.tasks = this.cache.tasks.filter(t => t.topic_id !== topicId);

      return true;
    } catch (error) {
      console.error('Error deleting topic:', error);
      throw error;
    }
  }

  /**
   * Create material for a topic
   */
  async createMaterial(topicId, materialData) {
    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('workspace_materials')
        .insert({
          topic_id: topicId,
          user_id: user.id,
          title: materialData.title,
          type: materialData.type,
          content: materialData.content,
          url: materialData.url,
          metadata: materialData.metadata || {}
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await this.logActivity('material_created', topicId, {
        material_type: data.type,
        material_title: data.title
      });

      return data;
    } catch (error) {
      console.error('Error creating material:', error);
      throw error;
    }
  }

  /**
   * Update a material
   */
  async updateMaterial(materialId, updates) {
    try {
      const { data, error } = await supabase
        .from('workspace_materials')
        .update(updates)
        .eq('id', materialId)
        .select()
        .single();

      if (error) throw error;
      
      // We don't cache materials directly, but this is where you would update if you did
      console.log('Updated material:', data);

      return data;
    } catch (error) {
      console.error('Error updating material:', error);
      throw error;
    }
  }

  /**
   * Create a new task
   */
  async createTask(taskData) {
    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('workspace_tasks')
        .insert({
          user_id: user.id,
          topic_id: taskData.topic_id,
          title: taskData.title,
          description: taskData.description,
          type: taskData.type || 'study',
          status: 'pending',
          priority: taskData.priority || 'medium',
          due_date: taskData.due_date,
          estimated_duration: taskData.estimated_duration,
          ai_generated: taskData.ai_generated || false,
          metadata: taskData.metadata || {}
        })
        .select()
        .single();

      if (error) {
        if (error.code === '42P01') {
          console.warn('workspace_tasks table does not exist yet');
          // Return mock task data for UI consistency
          return {
            id: crypto.randomUUID(),
            ...taskData,
            user_id: user.id,
            status: 'pending',
            priority: taskData.priority || 'medium',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        }
        throw error;
      }

      // Log activity
      await this.logActivity('task_created', data.topic_id, {
        task_title: data.title,
        task_type: data.type
      });

      // Update cache
      this.cache.tasks.unshift(data);

      return data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  /**
   * Create multiple tasks from AI generation
   */
  async createAITasks(topicId, tasks) {
    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const tasksToInsert = tasks.map(task => ({
        user_id: user.id,
        topic_id: topicId,
        title: task.title,
        description: task.description,
        type: task.type || 'study',
        status: 'pending',
        priority: task.priority || 'medium',
        due_date: task.due_date,
        estimated_duration: task.estimated_duration,
        ai_generated: true,
        metadata: task.metadata || {}
      }));

      const { data, error } = await supabase
        .from('workspace_tasks')
        .insert(tasksToInsert)
        .select();

      if (error) {
        if (error.code === '42P01') {
          console.warn('workspace_tasks table does not exist yet');
          // Return mock task data for UI consistency
          return tasksToInsert.map(task => ({
            id: crypto.randomUUID(),
            ...task,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }));
        }
        throw error;
      }

      // Log activity
      await this.logActivity('ai_tasks_generated', topicId, {
        tasks_count: data.length
      });

      // Update cache
      this.cache.tasks.unshift(...data);

      return data;
    } catch (error) {
      console.error('Error creating AI tasks:', error);
      throw error;
    }
  }

  /**
   * Add AI-generated content (tasks and materials) to a topic
   */
  async addAiGeneratedContent(topicId, aiResults) {
    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const results = {
        tasks: [],
        materials: []
      };

      // Add AI-generated tasks
      if (aiResults.tasks && aiResults.tasks.length > 0) {
        const tasksToInsert = aiResults.tasks.map((task, index) => ({
          user_id: user.id,
          topic_id: topicId,
          title: typeof task === 'string' ? task : (task.title || `Task ${index + 1}`),
          description: typeof task === 'object' ? task.description : task,
          type: typeof task === 'object' ? (task.type || 'study') : 'study',
          status: 'pending',
          priority: typeof task === 'object' ? (task.priority || 'medium') : 'medium',
          due_date: typeof task === 'object' ? task.due_date : null,
          estimated_duration: typeof task === 'object' ? task.estimated_duration : null,
          ai_generated: true,
          metadata: typeof task === 'object' ? (task.metadata || {}) : {}
        }));

        const { data: taskData, error: taskError } = await supabase
          .from('workspace_tasks')
          .insert(tasksToInsert)
          .select();

        if (taskError) throw taskError;
        results.tasks = taskData || [];
      }

      // Add AI-generated materials from resources
      const materials = [];
      
      // Convert resources to materials
      if (aiResults.resources && aiResults.resources.length > 0) {
        materials.push(...aiResults.resources.map((resource, index) => ({
          title: typeof resource === 'string' ? resource : (resource.title || `Resource ${index + 1}`),
          material_type: 'resource',
          content: typeof resource === 'string' ? resource : resource.content,
          url: typeof resource === 'object' ? resource.url : null
        })));
      }

      // Convert objectives to materials
      if (aiResults.objectives && aiResults.objectives.length > 0) {
        materials.push(...aiResults.objectives.map((objective, index) => ({
          title: typeof objective === 'string' ? objective : (objective.title || `Objective ${index + 1}`),
          material_type: 'objective',
          content: typeof objective === 'string' ? objective : objective.content
        })));
      }

      // Add complete package as a material
      if (aiResults.complete && aiResults.complete.content) {
        materials.push({
          title: 'AI-Generated Learning Plan',
          material_type: 'document',
          content: aiResults.complete.content,
          metadata: { citations: aiResults.complete.citations || [] }
        });
      }

      // Insert materials if any
      if (materials.length > 0) {
        const materialsToInsert = materials.map(material => ({
          topic_id: topicId,
          user_id: user.id,
          title: material.title,
          material_type: material.material_type || 'document',
          content: material.content,
          url: material.url,
          ai_generated: true,
          metadata: material.metadata || {}
        }));

        const { data: materialData, error: materialError } = await supabase
          .from('workspace_materials')
          .insert(materialsToInsert)
          .select();

        if (materialError) throw materialError;
        results.materials = materialData || [];
      }

      // Log activity
      await this.logActivity('ai_content_generated', topicId, {
        tasks_count: results.tasks.length,
        materials_count: results.materials.length,
        content_types: {
          tasks: aiResults.tasks?.length || 0,
          objectives: aiResults.objectives?.length || 0,
          resources: aiResults.resources?.length || 0,
          complete: aiResults.complete ? 1 : 0
        }
      });

      // Update cache
      this.cache.tasks.unshift(...results.tasks);
      
      // Update materials cache if we have any materials
      if (results.materials.length > 0) {
        // Find the topic in cache and add materials to it
        const topicIndex = this.cache.topics.findIndex(t => t.id === topicId);
        if (topicIndex !== -1) {
          if (!this.cache.topics[topicIndex].materials) {
            this.cache.topics[topicIndex].materials = [];
          }
          this.cache.topics[topicIndex].materials.unshift(...results.materials);
        }
      }

      return results;
    } catch (error) {
      console.error('Error adding AI generated content:', error);
      throw error;
    }
  }

  /**
   * Update task status/completion
   */
  async updateTask(taskId, updates) {
    try {
      const { data, error } = await supabase
        .from('workspace_tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;

      // Log activity for completion
      if (updates.status === 'completed') {
        await this.logActivity('task_completed', data.topic_id, {
          task_title: data.title
        });
      }

      // Update cache
      const index = this.cache.tasks.findIndex(t => t.id === taskId);
      if (index !== -1) {
        this.cache.tasks[index] = { ...this.cache.tasks[index], ...data };
      }

      return data;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  /**
   * Log user activity for analytics
   */
  async logActivity(action, topicId = null, metadata = {}) {
    try {
      const user = await this.getCurrentUser();
      if (!user) return;

      const { error } = await supabase
        .from('workspace_activities')
        .insert({
          user_id: user.id,
          action,
          topic_id: topicId,
          metadata
        });

      if (error) {
        if (error.code === '42P01') {
          console.warn('workspace_activities table does not exist yet - skipping activity log');
          return;
        }
        throw error;
      }
    } catch (error) {
      console.error('Error logging activity:', error);
      // Don't throw error for activity logging
    }
  }

  /**
   * Get user activity analytics
   */
  async getActivityAnalytics(days = 30) {
    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('workspace_activities')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) {
        if (error.code === '42P01') {
          console.warn('workspace_activities table does not exist yet');
          // Return empty analytics
          return {
            dailyActivity: {},
            actionCounts: {},
            topicActivity: {},
            totalActivities: 0
          };
        }
        throw error;
      }

      // Process analytics
      const analytics = this.processActivityData(data || []);
      return analytics;
    } catch (error) {
      console.error('Error fetching activity analytics:', error);
      // Return empty analytics on error
      return {
        dailyActivity: {},
        actionCounts: {},
        topicActivity: {},
        totalActivities: 0
      };
    }
  }

  /**
   * Process activity data for visualization
   */
  processActivityData(activities) {
    const dailyActivity = {};
    const actionCounts = {};
    const topicActivity = {};

    activities.forEach(activity => {
      const date = new Date(activity.created_at).toDateString();
      
      // Daily activity count
      dailyActivity[date] = (dailyActivity[date] || 0) + 1;
      
      // Action type counts
      actionCounts[activity.action] = (actionCounts[activity.action] || 0) + 1;
      
      // Topic-specific activity
      if (activity.topic_id) {
        topicActivity[activity.topic_id] = (topicActivity[activity.topic_id] || 0) + 1;
      }
    });

    return {
      dailyActivity,
      actionCounts,
      topicActivity,
      totalActivities: activities.length
    };
  }

  /**
   * Get cached data (for immediate UI updates)
   */
  getCachedData() {
    return this.cache;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache = {
      topics: [],
      tasks: [],
      activities: [],
      lastFetch: null
    };
  }

  /**
   * Upload file to storage
   */
  async uploadFile(file, userId) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('workspace-files')
        .upload(fileName, file);

      if (error) throw error;

      const { data: publicData } = supabase.storage
        .from('workspace-files')
        .getPublicUrl(fileName);

      return publicData.publicUrl;
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  }
}

// Create singleton instance
const workspaceService = new WorkspaceService();

export default workspaceService; 