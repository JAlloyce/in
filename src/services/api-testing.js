/**
 * API Testing Service
 * 
 * Comprehensive testing service for all API endpoints including:
 * - Authentication endpoints
 * - Feed and posts
 * - Messaging
 * - Notifications
 * - Jobs
 * - Network connections
 * - User profiles
 */

import { supabase } from '../lib/supabase';

export class APITester {
  constructor() {
    this.baseUrl = import.meta.env.VITE_SUPABASE_URL;
    this.apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    this.testResults = [];
    this.accessToken = null;
  }

  /**
   * Run all API tests
   */
  async runAllTests() {
    console.log('🚀 Starting comprehensive API tests...');
    
    try {
      // Authentication tests
      await this.testAuthentication();
      
      // Core feature tests
      await this.testFeedEndpoints();
      await this.testMessagingEndpoints();
      await this.testNotificationEndpoints();
      await this.testJobsEndpoints();
      await this.testNetworkEndpoints();
      await this.testProfileEndpoints();
      
      // Generate report
      this.generateTestReport();
      
    } catch (error) {
      console.error('❌ API Testing failed:', error);
    }
  }

  /**
   * Test authentication endpoints
   */
  async testAuthentication() {
    console.log('🔐 Testing Authentication Endpoints...');
    
    // Test signup
    await this.testEndpoint('POST', '/auth/v1/signup', {
      email: 'test@example.com',
      password: 'testpassword123'
    }, 'User Signup');

    // Test login
    const loginResult = await this.testEndpoint('POST', '/auth/v1/token?grant_type=password', {
      email: 'test@example.com',
      password: 'testpassword123'
    }, 'User Login');

    if (loginResult?.access_token) {
      this.accessToken = loginResult.access_token;
    }

    // Test session refresh
    if (this.accessToken) {
      await this.testEndpoint('POST', '/auth/v1/token?grant_type=refresh_token', {
        refresh_token: loginResult?.refresh_token
      }, 'Session Refresh');
    }

    // Test logout
    await this.testEndpoint('POST', '/auth/v1/logout', {}, 'User Logout');
  }

  /**
   * Test feed and posts endpoints
   */
  async testFeedEndpoints() {
    console.log('📰 Testing Feed Endpoints...');
    
    // Test get feed
    await this.testEndpoint('GET', '/rest/v1/posts?select=*,author:profiles(*),likes:post_likes(count),comments:post_comments(count)&order=created_at.desc', null, 'Get Feed Posts');

    // Test create post
    await this.testEndpoint('POST', '/rest/v1/posts', {
      content: 'Test post content',
      author_id: 'test-user-id'
    }, 'Create Post');

    // Test like post
    await this.testEndpoint('POST', '/rest/v1/post_likes', {
      post_id: 'test-post-id',
      user_id: 'test-user-id'
    }, 'Like Post');

    // Test create comment
    await this.testEndpoint('POST', '/rest/v1/post_comments', {
      post_id: 'test-post-id',
      author_id: 'test-user-id',
      content: 'Test comment'
    }, 'Create Comment');
  }

  /**
   * Test messaging endpoints
   */
  async testMessagingEndpoints() {
    console.log('💬 Testing Messaging Endpoints...');
    
    // Test get conversations
    await this.testEndpoint('GET', '/rest/v1/conversations?select=*,participant_1:profiles!conversations_participant_1_fkey(*),participant_2:profiles!conversations_participant_2_fkey(*)', null, 'Get Conversations');

    // Test create conversation
    await this.testEndpoint('POST', '/rest/v1/conversations', {
      participant_1: 'user-1-id',
      participant_2: 'user-2-id'
    }, 'Create Conversation');

    // Test send message
    await this.testEndpoint('POST', '/rest/v1/messages', {
      conversation_id: 'test-conversation-id',
      sender_id: 'test-user-id',
      content: 'Test message'
    }, 'Send Message');

    // Test get messages
    await this.testEndpoint('GET', '/rest/v1/messages?conversation_id=eq.test-conversation-id&select=*&order=created_at.asc', null, 'Get Messages');
  }

  /**
   * Test notification endpoints
   */
  async testNotificationEndpoints() {
    console.log('🔔 Testing Notification Endpoints...');
    
    // Test get notifications
    await this.testEndpoint('GET', '/rest/v1/notifications?user_id=eq.test-user-id&select=*,sender:profiles!notifications_sender_id_fkey(*)&order=created_at.desc', null, 'Get Notifications');

    // Test create notification
    await this.testEndpoint('POST', '/rest/v1/notifications', {
      user_id: 'test-user-id',
      type: 'like',
      message: 'Someone liked your post',
      sender_id: 'other-user-id'
    }, 'Create Notification');

    // Test mark as read
    await this.testEndpoint('PATCH', '/rest/v1/notifications?id=eq.test-notification-id', {
      is_read: true
    }, 'Mark Notification as Read');
  }

  /**
   * Test jobs endpoints
   */
  async testJobsEndpoints() {
    console.log('💼 Testing Jobs Endpoints...');
    
    // Test get jobs
    await this.testEndpoint('GET', '/rest/v1/jobs?select=*,company:companies(*),applications:job_applications(count)&is_active=eq.true&order=created_at.desc', null, 'Get Jobs');

    // Test create job
    await this.testEndpoint('POST', '/rest/v1/jobs', {
      title: 'Software Engineer',
      description: 'Join our team',
      company_id: 'test-company-id',
      location: 'Remote',
      job_type: 'Full-time',
      salary_min: 80000,
      salary_max: 120000
    }, 'Create Job');

    // Test apply for job
    await this.testEndpoint('POST', '/rest/v1/job_applications', {
      job_id: 'test-job-id',
      applicant_id: 'test-user-id',
      resume: 'resume.pdf'
    }, 'Apply for Job');

    // Test get applications
    await this.testEndpoint('GET', '/rest/v1/job_applications?applicant_id=eq.test-user-id&select=*,job:jobs(*)', null, 'Get Job Applications');
  }

  /**
   * Test network endpoints
   */
  async testNetworkEndpoints() {
    console.log('🌐 Testing Network Endpoints...');
    
    // Test get connections
    await this.testEndpoint('GET', '/rest/v1/connections?or=(requester_id.eq.test-user-id,receiver_id.eq.test-user-id)&status=eq.accepted&select=*,requester:profiles!connections_requester_id_fkey(*),receiver:profiles!connections_receiver_id_fkey(*)', null, 'Get Connections');

    // Test send connection request
    await this.testEndpoint('POST', '/rest/v1/connections', {
      requester_id: 'test-user-id',
      receiver_id: 'other-user-id',
      status: 'pending'
    }, 'Send Connection Request');

    // Test accept connection
    await this.testEndpoint('PATCH', '/rest/v1/connections?id=eq.test-connection-id', {
      status: 'accepted'
    }, 'Accept Connection');

    // Test get suggestions
    await this.testEndpoint('GET', '/rest/v1/profiles?id=neq.test-user-id&select=*&limit=10', null, 'Get Connection Suggestions');
  }

  /**
   * Test profile endpoints
   */
  async testProfileEndpoints() {
    console.log('👤 Testing Profile Endpoints...');
    
    // Test get profile
    await this.testEndpoint('GET', '/rest/v1/profiles?id=eq.test-user-id&select=*', null, 'Get User Profile');

    // Test update profile
    await this.testEndpoint('PATCH', '/rest/v1/profiles?id=eq.test-user-id', {
      name: 'Updated Name',
      headline: 'Software Engineer',
      bio: 'Updated bio'
    }, 'Update Profile');

    // Test upload avatar
    await this.testEndpoint('POST', '/storage/v1/object/avatars/test-avatar.jpg', new FormData(), 'Upload Avatar');
  }

  /**
   * Test individual endpoint
   */
  async testEndpoint(method, endpoint, data, testName) {
    try {
      const headers = {
        'apikey': this.apiKey,
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      };

      if (this.accessToken) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
      }

      const config = {
        method,
        headers
      };

      if (data && method !== 'GET') {
        config.body = JSON.stringify(data);
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      const responseData = await response.json().catch(() => null);

      const result = {
        testName,
        method,
        endpoint,
        status: response.status,
        success: response.ok,
        data: responseData,
        timestamp: new Date().toISOString()
      };

      this.testResults.push(result);

      const statusEmoji = response.ok ? '✅' : '❌';
      console.log(`${statusEmoji} ${testName}: ${response.status}`);

      return responseData;

    } catch (error) {
      const result = {
        testName,
        method,
        endpoint,
        status: 0,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };

      this.testResults.push(result);
      console.log(`❌ ${testName}: Error - ${error.message}`);
      return null;
    }
  }

  /**
   * Generate curl commands for manual testing
   */
  generateCurlCommands() {
    const commands = [];
    
    // Authentication
    commands.push(`# Authentication Tests`);
    commands.push(`curl -X POST "${this.baseUrl}/auth/v1/signup" \\
  -H "apikey: ${this.apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"email": "test@example.com", "password": "testpassword123"}'`);

    commands.push(`curl -X POST "${this.baseUrl}/auth/v1/token?grant_type=password" \\
  -H "apikey: ${this.apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"email": "test@example.com", "password": "testpassword123"}'`);

    // Feed
    commands.push(`\n# Feed Tests`);
    commands.push(`curl -X GET "${this.baseUrl}/rest/v1/posts?select=*" \\
  -H "apikey: ${this.apiKey}" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"`);

    commands.push(`curl -X POST "${this.baseUrl}/rest/v1/posts" \\
  -H "apikey: ${this.apiKey}" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"content": "Test post", "author_id": "USER_ID"}'`);

    // Jobs
    commands.push(`\n# Jobs Tests`);
    commands.push(`curl -X GET "${this.baseUrl}/rest/v1/jobs?select=*" \\
  -H "apikey: ${this.apiKey}"`);

    commands.push(`curl -X POST "${this.baseUrl}/rest/v1/job_applications" \\
  -H "apikey: ${this.apiKey}" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"job_id": "JOB_ID", "applicant_id": "USER_ID"}'`);

    // Messages
    commands.push(`\n# Messaging Tests`);
    commands.push(`curl -X GET "${this.baseUrl}/rest/v1/conversations?select=*" \\
  -H "apikey: ${this.apiKey}" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"`);

    commands.push(`curl -X POST "${this.baseUrl}/rest/v1/messages" \\
  -H "apikey: ${this.apiKey}" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"conversation_id": "CONV_ID", "sender_id": "USER_ID", "content": "Hello"}'`);

    // Notifications
    commands.push(`\n# Notifications Tests`);
    commands.push(`curl -X GET "${this.baseUrl}/rest/v1/notifications?user_id=eq.USER_ID" \\
  -H "apikey: ${this.apiKey}" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"`);

    // Network
    commands.push(`\n# Network Tests`);
    commands.push(`curl -X GET "${this.baseUrl}/rest/v1/connections?or=(requester_id.eq.USER_ID,receiver_id.eq.USER_ID)" \\
  -H "apikey: ${this.apiKey}" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"`);

    commands.push(`curl -X POST "${this.baseUrl}/rest/v1/connections" \\
  -H "apikey: ${this.apiKey}" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"requester_id": "USER_ID", "receiver_id": "OTHER_USER_ID", "status": "pending"}'`);

    return commands.join('\n\n');
  }

  /**
   * Generate test report
   */
  generateTestReport() {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);

    console.log('\n📊 API Test Results Summary:');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Success Rate: ${successRate}%`);

    // Group by category
    const categories = {};
    this.testResults.forEach(result => {
      const category = result.testName.split(' ')[0];
      if (!categories[category]) categories[category] = [];
      categories[category].push(result);
    });

    console.log('\n📋 Results by Category:');
    Object.entries(categories).forEach(([category, results]) => {
      const passed = results.filter(r => r.success).length;
      console.log(`${category}: ${passed}/${results.length} passed`);
    });

    // Failed tests detail
    const failedResults = this.testResults.filter(r => !r.success);
    if (failedResults.length > 0) {
      console.log('\n❌ Failed Tests:');
      failedResults.forEach(result => {
        console.log(`- ${result.testName}: ${result.error || `Status ${result.status}`}`);
      });
    }

    return {
      totalTests,
      passedTests,
      failedTests,
      successRate,
      categories,
      failedResults
    };
  }

  /**
   * Test database connectivity
   */
  async testDatabaseConnectivity() {
    console.log('🗄️ Testing Database Connectivity...');
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (error) {
        console.log('❌ Database connection failed:', error.message);
        return false;
      }

      console.log('✅ Database connection successful');
      return true;
    } catch (error) {
      console.log('❌ Database connection error:', error.message);
      return false;
    }
  }

  /**
   * Test real-time functionality
   */
  async testRealTimeConnectivity() {
    console.log('⚡ Testing Real-time Connectivity...');
    
    try {
      const channel = supabase
        .channel('test-channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, (payload) => {
          console.log('✅ Real-time event received:', payload);
        })
        .subscribe();

      setTimeout(() => {
        supabase.removeChannel(channel);
        console.log('✅ Real-time connection test completed');
      }, 2000);

      return true;
    } catch (error) {
      console.log('❌ Real-time connection failed:', error.message);
      return false;
    }
  }
}

// Export singleton instance
export const apiTester = new APITester();

export default APITester; 