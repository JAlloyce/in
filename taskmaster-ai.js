#!/usr/bin/env node

/**
 * TaskMaster-AI - Intelligent Task Management System
 * For LinkedIn Clone Project
 */

import { taskmasterConfig } from './taskmaster-ai.config.js';
import fs from 'fs';

class TaskMasterAI {
  constructor(config) {
    this.config = config;
    this.currentPhase = 0;
    this.completedTasks = new Set();
    this.logFile = 'taskmaster-ai.log';
    this.progressFile = 'taskmaster-progress.json';
    
    this.loadProgress();
    this.log('TaskMaster-AI Initialized', 'INFO');
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level}] ${message}\n`;
    
    console.log(` TaskMaster-AI [${level}]: ${message}`);
    
    try {
      fs.appendFileSync(this.logFile, logEntry);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  loadProgress() {
    try {
      if (fs.existsSync(this.progressFile)) {
        const progress = JSON.parse(fs.readFileSync(this.progressFile, 'utf8'));
        this.completedTasks = new Set(progress.completedTasks || []);
        this.currentPhase = progress.currentPhase || 0;
        this.log(`Loaded progress: ${this.completedTasks.size} tasks completed, Phase ${this.currentPhase + 1}`);
      }
    } catch (error) {
      this.log(`Failed to load progress: ${error.message}`, 'ERROR');
    }
  }

  saveProgress() {
    try {
      const progress = {
        completedTasks: Array.from(this.completedTasks),
        currentPhase: this.currentPhase,
        lastUpdated: new Date().toISOString()
      };
      fs.writeFileSync(this.progressFile, JSON.stringify(progress, null, 2));
    } catch (error) {
      this.log(`Failed to save progress: ${error.message}`, 'ERROR');
    }
  }

  getTask(taskId) {
    return this.config.tasks.find(task => task.id === taskId);
  }

  canExecuteTask(taskId) {
    const task = this.getTask(taskId);
    if (!task) return false;
    
    return task.dependencies.every(depId => this.completedTasks.has(depId));
  }

  getAvailableTasks() {
    return this.config.tasks.filter(task => 
      !this.completedTasks.has(task.id) && this.canExecuteTask(task.id)
    ).sort((a, b) => {
      const priorityA = this.config.taskCategories[a.category].priority;
      const priorityB = this.config.taskCategories[b.category].priority;
      return priorityA - priorityB;
    });
  }

  completeTask(taskId) {
    this.completedTasks.add(taskId);
    const task = this.getTask(taskId);
    this.log(` Task completed: ${task.title} (${taskId})`, 'SUCCESS');
    this.saveProgress();
  }

  displayStatus() {
    const totalTasks = this.config.tasks.length;
    const completed = this.completedTasks.size;
    const progress = Math.round((completed / totalTasks) * 100);
    const available = this.getAvailableTasks();
    
    console.log('\n TaskMaster-AI Status Report');
    console.log('================================');
    console.log(` Overall Progress: ${progress}% (${completed}/${totalTasks})`);
    console.log(` Current Phase: ${this.config.phases[this.currentPhase].name}`);
    console.log(`  Phase Description: ${this.config.phases[this.currentPhase].description}\n`);

    console.log(' Next Available Tasks:');
    available.slice(0, 5).forEach((task, index) => {
      console.log(`  ${index + 1}. [${task.category}] ${task.title}`);
      console.log(`       ${task.estimatedHours}h |  ${task.files.join(', ')}`);
    });
    console.log('\n');
  }

  async executeTask(taskId) {
    const task = this.getTask(taskId);
    if (!task) {
      this.log(`Task not found: ${taskId}`, 'ERROR');
      return false;
    }

    if (this.completedTasks.has(taskId)) {
      this.log(`Task already completed: ${taskId}`, 'WARNING');
      return false;
    }

    if (!this.canExecuteTask(taskId)) {
      this.log(`Cannot execute task ${taskId}: dependencies not met`, 'ERROR');
      return false;
    }

    this.log(` Starting task: ${task.title} (${taskId})`, 'INFO');
    
    return {
      task,
      instructions: this.getTaskInstructions(taskId)
    };
  }

  getTaskInstructions(taskId) {
    const instructionsMap = {
      'DB_001': [
        'Run the FINAL_SCHEMA_FIX.sql migration in Supabase',
        'Verify all foreign key constraints are working',
        'Test that posts, comments, and likes work correctly'
      ],
      'UI_001': [
        'Audit all components for proportionality issues',
        'Create a spacing/sizing audit document',
        'Fix responsive design breakpoints',
        'Test on different screen sizes'
      ]
    };

    return instructionsMap[taskId] || ['Instructions not yet defined for this task'];
  }

  initializeProject() {
    this.log('  Initializing TaskMaster-AI project structure...', 'INFO');
    
    const dirs = ['taskmaster-ai', 'taskmaster-ai/reports'];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        this.log(`Created directory: ${dir}`, 'INFO');
      }
    });
    
    this.log(' TaskMaster-AI initialization complete!', 'SUCCESS');
  }
}

// CLI Interface
const args = process.argv.slice(2);
const command = args[0];
const taskId = args[1];

const taskmaster = new TaskMasterAI(taskmasterConfig);

switch (command) {
  case 'init':
    taskmaster.initializeProject();
    break;
    
  case 'status':
    taskmaster.displayStatus();
    break;
    
  case 'execute':
    if (!taskId) {
      console.log(' Please provide a task ID: node taskmaster-ai.js execute <TASK_ID>');
      break;
    }
    const result = await taskmaster.executeTask(taskId);
    if (result) {
      console.log('\n Task Execution Plan:');
      console.log('=======================');
      result.instructions.forEach((instruction, index) => {
        console.log(`${index + 1}. ${instruction}`);
      });
      console.log(`\n Mark as complete: node taskmaster-ai.js complete ${taskId}`);
    }
    break;
    
  case 'complete':
    if (!taskId) {
      console.log(' Please provide a task ID: node taskmaster-ai.js complete <TASK_ID>');
      break;
    }
    taskmaster.completeTask(taskId);
    taskmaster.displayStatus();
    break;
    
  default:
    console.log(`
 TaskMaster-AI - LinkedIn Clone Project Manager

Usage:
  node taskmaster-ai.js init           Initialize project structure
  node taskmaster-ai.js status         Show current progress
  node taskmaster-ai.js execute <ID>   Execute specific task
  node taskmaster-ai.js complete <ID>  Mark task as completed

Example:
  node taskmaster-ai.js init
  node taskmaster-ai.js status
  node taskmaster-ai.js execute DB_001
    `);
}

export default TaskMasterAI;
