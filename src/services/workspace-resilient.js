/**
 * RESILIENT WORKSPACE SERVICE
 * This service is designed to handle schema inconsistencies gracefully
 * and provide a future-proof foundation for the workspace feature.
 */

import { supabase } from '../lib/supabase';

class ResilientWorkspaceService {
  constructor() {
    this.cache = {
      topics: [],
      tasks: [],
      materials: [],
      lastFetch: null
    };
    
    // Schema compatibility mapping
    this.schemaMap = {
      topics: {
        required: ['id', 'user_id', 'title'],
        optional: ['description', 'status', 'progress', 'metadata', 'created_at', 'updated_at'],
        defaults: {
          status: 'active',
          progress: 0,
          metadata: {},
          description: ''
        }
      },
      materials: {
        required: ['id', 'topic_id', 'user_id', 'title'],
        optional: ['material_type', 'type', 'content', 'url', 'file_path', 'completed', 'ai_generated', 'metadata', 'created_at', 'updated_at'],
        defaults: {
          material_type: 'document',
          type: 'document', // fallback for legacy
          completed: false,
          ai_generated: false,
          metadata: {},
          content: ''
        }
      },
      tasks: {
        required: ['id', 'user_id', 'title'],
        optional: ['topic_id', 'description', 'type', 'status', 'priority', 'due_date', 'estimated_duration', 'completed', 'ai_generated', 'metadata', 'created_at', 'updated_at'],
        defaults: {
          type: 'study',
          status: 'pending',
          priority: 'medium',
          completed: false,
          ai_generated: false,
          metadata: {},
          description: ''
        }
      }
    };
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  /**
   * Safely insert data with progressive field reduction
   */
  async safeInsert(table, data, entityType) {
    const schema = this.schemaMap[entityType];
    if (!schema) throw new Error(`Unknown entity type: ${entityType}`);

    // Try with all fields first
    let insertData = { ...data };
    
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(insertData)
        .select()
        .single();

      if (!error) return result;

      // If schema error, progressively reduce fields
      if (error.code === 'PGRST204') {
        console.warn(`Schema error detected: ${error.message}`);
        
        // Try with only required + known working optional fields
        const safeFields = [...schema.required];
        const workingOptionalFields = [];
        
        // Test each optional field
        for (const field of schema.optional) {
          if (data[field] !== undefined) {
            const testData = {};
            safeFields.forEach(f => testData[f] = data[f]);
            workingOptionalFields.forEach(f => testData[f] = data[f]);
            testData[field] = data[field];
            
            const { error: testError } = await supabase
              .from(table)
              .insert(testData)
              .select()
              .single();
              
            if (!testError) {
              workingOptionalFields.push(field);
            } else if (testError.code === 'PGRST204') {
              console.warn(`Field ${field} not supported in current schema`);
            } else {
              // Other error, add field anyway and let final insert handle it
              workingOptionalFields.push(field);
            }
          }
        }

        // Final insert with working fields
        const finalData = {};
        [...safeFields, ...workingOptionalFields].forEach(field => {
          if (data[field] !== undefined) {
            finalData[field] = data[field];
          }
        });

        const { data: finalResult, error: finalError } = await supabase
          .from(table)
          .insert(finalData)
          .select()
          .single();

        if (finalError) throw finalError;
        
        // Fill in missing fields with defaults for UI consistency
        const completeResult = { ...finalResult };
        Object.keys(schema.defaults).forEach(field => {
          if (completeResult[field] === undefined) {
            completeResult[field] = schema.defaults[field];
          }
        });
        
        return completeResult;
      }
      
      throw error;
    } catch (error) {
      console.error(`Error inserting into ${table}:`, error);
      throw error;
    }
  }

  /**
   * Safely update data with field validation
   */
  async safeUpdate(table, id, updates, entityType) {
    const schema = this.schemaMap[entityType];
    
    // Filter out fields that don't exist in schema
    const safeUpdates = {};
    Object.keys(updates).forEach(field => {
      if (schema.required.includes(field) || schema.optional.includes(field)) {
        safeUpdates[field] = updates[field];
      }
    });

    try {
      const { data, error } = await supabase
        .from(table)
        .update(safeUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      if (error.code === 'PGRST204') {
        console.warn(`Schema error on update: ${error.message}`);
        // Try with minimal update
        const minimalUpdate = {};
        schema.required.forEach(field => {
          if (updates[field] !== undefined) {
            minimalUpdate[field] = updates[field];
          }
        });

        const { data, error: retryError } = await supabase
          .from(table)
          .update(minimalUpdate)
          .eq('id', id)
          .select()
          .single();

        if (retryError) throw retryError;
        return data;
      }
      throw error;
    }
  }

  /**
   * Create a new topic with resilient error handling
   */
  async createTopic(topicData) {
    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const data = {
        user_id: user.id,
        title: topicData.title,
        description: topicData.description || '',
        status: 'active',
        progress: 0,
        metadata: topicData.metadata || {}
      };

      const result = await this.safeInsert('workspace_topics', data, 'topics');
      
      // Log activity if possible
      try {
        await this.logActivity('topic_created', result.id, {
          topic_title: result.title
        });
      } catch (activityError) {
        console.warn('Could not log activity:', activityError);
      }

      // Update cache
      this.cache.topics.unshift(result);
      return result;

    } catch (error) {
      console.error('Error creating topic:', error);
      throw error;
    }
  }

  /**
   * Create material with resilient handling
   */
  async createMaterial(topicId, materialData) {
    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const data = {
        topic_id: topicId,
        user_id: user.id,
        title: materialData.title,
        material_type: materialData.type || 'document',
        type: materialData.type || 'document', // legacy fallback
        content: materialData.content || '',
        url: materialData.url,
        file_path: materialData.file_path,
        completed: false,
        ai_generated: materialData.ai_generated || false,
        metadata: materialData.metadata || {}
      };

      const result = await this.safeInsert('workspace_materials', data, 'materials');
      
      try {
        await this.logActivity('material_created', topicId, {
          material_type: result.material_type || result.type,
          material_title: result.title
        });
      } catch (activityError) {
        console.warn('Could not log activity:', activityError);
      }

      return result;
    } catch (error) {
      console.error('Error creating material:', error);
      throw error;
    }
  }

  /**
   * Update material with resilient handling
   */
  async updateMaterial(materialId, updates) {
    try {
      const result = await this.safeUpdate('workspace_materials', materialId, updates, 'materials');
      return result;
    } catch (error) {
      console.error('Error updating material:', error);
      throw error;
    }
  }

  /**
   * Fetch workspace data with graceful degradation
   */
  async fetchWorkspaceData() {
    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const results = await Promise.allSettled([
        this.fetchTopics(),
        this.fetchTasks(),
        this.fetchActivities()
      ]);

      const [topicsResult, tasksResult, activitiesResult] = results;

      return {
        topics: topicsResult.status === 'fulfilled' ? topicsResult.value : [],
        tasks: tasksResult.status === 'fulfilled' ? tasksResult.value : [],
        activities: activitiesResult.status === 'fulfilled' ? activitiesResult.value : [],
        errors: results
          .filter(r => r.status === 'rejected')
          .map(r => r.reason)
      };
    } catch (error) {
      console.error('Error fetching workspace data:', error);
      return {
        topics: [],
        tasks: [],
        activities: [],
        errors: [error]
      };
    }
  }

  /**
   * Get topic by ID with materials populated
   */
  async getTopicById(topicId) {
    try {
      const { data: topic, error: topicError } = await supabase
        .from('workspace_topics')
        .select('*')
        .eq('id', topicId)
        .single();

      if (topicError) throw topicError;

      // Fetch materials
      try {
        const { data: materials } = await supabase
          .from('workspace_materials')
          .select('*')
          .eq('topic_id', topicId);

        topic.materials = materials || [];
      } catch (materialsError) {
        console.warn('Could not fetch materials:', materialsError);
        topic.materials = [];
      }

      return topic;
    } catch (error) {
      console.error('Error fetching topic:', error);
      throw error;
    }
  }

  /**
   * Safe activity logging
   */
  async logActivity(action, topicId = null, metadata = {}) {
    try {
      const user = await this.getCurrentUser();
      if (!user) return;

      const data = {
        user_id: user.id,
        topic_id: topicId,
        action,
        metadata
      };

      await this.safeInsert('workspace_activities', data, 'activities');
    } catch (error) {
      console.warn('Activity logging failed:', error);
      // Don't throw - activity logging is not critical
    }
  }

  /**
   * Helper methods for individual fetches
   */
  async fetchTopics() {
    const user = await this.getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('workspace_topics')
      .select(`
        *,
        materials:workspace_materials(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === '42P01') return []; // Table doesn't exist
      throw error;
    }

    // Ensure materials array exists and fill defaults
    return (data || []).map(topic => ({
      ...this.schemaMap.topics.defaults,
      ...topic,
      materials: (topic.materials || []).map(material => ({
        ...this.schemaMap.materials.defaults,
        ...material
      }))
    }));
  }

  async fetchTasks() {
    const user = await this.getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('workspace_tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === '42P01') return [];
      throw error;
    }

    return (data || []).map(task => ({
      ...this.schemaMap.tasks.defaults,
      ...task
    }));
  }

  async fetchActivities() {
    const user = await this.getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('workspace_activities')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      if (error.code === '42P01') return [];
      throw error;
    }

    return data || [];
  }

  // File upload method
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

export default new ResilientWorkspaceService(); 