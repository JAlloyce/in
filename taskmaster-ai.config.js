/**
 * TaskMaster-AI Configuration
 * Comprehensive task management for LinkedIn Clone project
 */

export const taskmasterConfig = {
  projectName: "LinkedIn Clone",
  version: "1.0.0",
  
  // Task Categories with Priority Levels
  taskCategories: {
    CRITICAL: {
      priority: 1,
      color: "#ef4444",
      description: "Blocking issues that prevent core functionality"
    },
    HIGH: {
      priority: 2, 
      color: "#f97316",
      description: "Important features missing or broken"
    },
    MEDIUM: {
      priority: 3,
      color: "#eab308", 
      description: "Performance and UX improvements"
    },
    LOW: {
      priority: 4,
      color: "#22c55e",
      description: "Nice-to-have enhancements"
    }
  },

  // Comprehensive Task List
  tasks: [
    // CRITICAL - Database Schema Fixes
    {
      id: "DB_001",
      category: "CRITICAL",
      title: "Apply FINAL_SCHEMA_FIX.sql",
      description: "Fix foreign key mismatches, add missing profile columns, fix notifications structure",
      estimatedHours: 1,
      dependencies: [],
      files: ["FINAL_SCHEMA_FIX.sql"],
      status: "pending"
    },
    {
      id: "DB_002", 
      category: "CRITICAL",
      title: "Create Messaging System Tables",
      description: "Design and implement conversations, messages, participants tables",
      estimatedHours: 3,
      dependencies: ["DB_001"],
      files: ["supabase/migrations/"],
      status: "pending"
    },

    // CRITICAL - UI Proportionality Fixes
    {
      id: "UI_001",
      category: "CRITICAL", 
      title: "Fix Layout Proportionality Issues",
      description: "Audit and fix all component sizing, spacing, and responsive design issues",
      estimatedHours: 8,
      dependencies: [],
      files: ["src/components/", "src/index.css", "tailwind.config.js"],
      status: "pending"
    },
    {
      id: "UI_002",
      category: "CRITICAL",
      title: "Implement Design System",
      description: "Create consistent spacing, typography, and component sizing standards",
      estimatedHours: 6,
      dependencies: ["UI_001"],
      files: ["src/styles/", "src/components/ui/"],
      status: "pending"
    },

    // HIGH - Missing Edge Functions
    {
      id: "API_001",
      category: "HIGH",
      title: "Create Jobs API Functions",
      description: "Build missing edge functions for job posting, application, search",
      estimatedHours: 6,
      dependencies: ["DB_001"],
      files: ["supabase/functions/"],
      status: "pending"
    },
    {
      id: "API_002",
      category: "HIGH", 
      title: "Create Communities API Functions",
      description: "Build edge functions for community management, membership",
      estimatedHours: 4,
      dependencies: ["DB_001"],
      files: ["supabase/functions/"],
      status: "pending"
    },
    {
      id: "API_003",
      category: "HIGH",
      title: "Create Connections API Functions", 
      description: "Build edge functions for connection requests, management",
      estimatedHours: 4,
      dependencies: ["DB_001"],
      files: ["supabase/functions/"],
      status: "pending"
    },
    {
      id: "API_004",
      category: "HIGH",
      title: "Create Messaging API Functions",
      description: "Build complete messaging system APIs",
      estimatedHours: 8,
      dependencies: ["DB_002"],
      files: ["supabase/functions/"],
      status: "pending"
    },

    // MEDIUM - Performance & Security
    {
      id: "PERF_001",
      category: "MEDIUM",
      title: "Fix Database Performance Issues",
      description: "Add missing indexes, optimize RLS policies, fix function search paths",
      estimatedHours: 4,
      dependencies: ["DB_001"],
      files: ["supabase/migrations/"],
      status: "pending"
    },
    {
      id: "PERF_002", 
      category: "MEDIUM",
      title: "Implement Real-time Features",
      description: "Add Supabase real-time subscriptions for live updates",
      estimatedHours: 6,
      dependencies: ["API_004"],
      files: ["src/hooks/", "src/context/"],
      status: "pending"
    },

    // MEDIUM - UI/UX Improvements  
    {
      id: "UX_001",
      category: "MEDIUM",
      title: "Improve Feed Component Layout",
      description: "Fix post card proportions, spacing, and responsive behavior",
      estimatedHours: 4,
      dependencies: ["UI_002"],
      files: ["src/components/Feed/"],
      status: "pending"
    },
    {
      id: "UX_002",
      category: "MEDIUM", 
      title: "Enhance Profile Page Design",
      description: "Improve profile layout, proportions, and visual hierarchy",
      estimatedHours: 4,
      dependencies: ["UI_002"],
      files: ["src/pages/Profile/"],
      status: "pending"
    },
    {
      id: "UX_003",
      category: "MEDIUM",
      title: "Optimize Jobs Page Layout",
      description: "Fix job card sizing, filters layout, and responsive design",
      estimatedHours: 4, 
      dependencies: ["UI_002"],
      files: ["src/pages/Jobs/"],
      status: "pending"
    },

    // LOW - Analytics & Insights
    {
      id: "ANALYTICS_001",
      category: "LOW",
      title: "Create Analytics Infrastructure", 
      description: "Build analytics tables and tracking system",
      estimatedHours: 8,
      dependencies: ["DB_001"],
      files: ["supabase/migrations/", "supabase/functions/"],
      status: "pending"
    },
    {
      id: "ANALYTICS_002",
      category: "LOW",
      title: "Implement User Insights Dashboard",
      description: "Build analytics UI for user engagement metrics",
      estimatedHours: 6,
      dependencies: ["ANALYTICS_001"],
      files: ["src/pages/Analytics/"],
      status: "pending"
    }
  ],

  // Execution Phases
  phases: [
    {
      name: "Phase 1: Critical Infrastructure",
      description: "Fix blocking database issues and core UI problems",
      tasks: ["DB_001", "DB_002", "UI_001", "UI_002"],
      estimatedDays: 5
    },
    {
      name: "Phase 2: Core APIs",
      description: "Build missing edge functions for core features", 
      tasks: ["API_001", "API_002", "API_003", "API_004"],
      estimatedDays: 7
    },
    {
      name: "Phase 3: Performance & UX",
      description: "Optimize performance and enhance user experience",
      tasks: ["PERF_001", "PERF_002", "UX_001", "UX_002", "UX_003"],
      estimatedDays: 6
    },
    {
      name: "Phase 4: Analytics & Polish", 
      description: "Add analytics and final enhancements",
      tasks: ["ANALYTICS_001", "ANALYTICS_002"],
      estimatedDays: 4
    }
  ],

  // Quality Gates
  qualityGates: {
    database: {
      criteria: [
        "All foreign key references correct",
        "No security warnings",
        "All tables have proper indexes",
        "RLS policies optimized"
      ]
    },
    ui: {
      criteria: [
        "Consistent spacing and proportions",
        "Responsive design working on all screen sizes", 
        "Design system implemented",
        "Accessibility standards met"
      ]
    },
    api: {
      criteria: [
        "All CRUD operations working",
        "Error handling implemented",
        "Authentication/authorization working",
        "Real-time features functional"
      ]
    }
  },

  // Progress Tracking
  metrics: {
    totalTasks: 16,
    criticalTasks: 4,
    highTasks: 4, 
    mediumTasks: 6,
    lowTasks: 2,
    estimatedTotalHours: 76,
    estimatedTotalDays: 22
  }
};

export default taskmasterConfig;
