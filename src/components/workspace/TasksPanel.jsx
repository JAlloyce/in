import React, { useState, useEffect, useMemo } from 'react';
import { 
  HiOutlineCheck, 
  HiOutlineChevronDown, 
  HiOutlineRefresh, 
  HiOutlinePlus,
  HiOutlineX,
  HiOutlineCalendar,
  HiOutlineFlag
} from 'react-icons/hi';
import { AnimatePresence, motion } from 'framer-motion';
import workspaceService from '../../services/workspace';

export default function TasksPanel({ tasks: propTasks = [], onTaskComplete, topics = [] }) {
  const [tasks, setTasks] = useState(propTasks);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [expandedTopics, setExpandedTopics] = useState([]);
  const [updatingTasks, setUpdatingTasks] = useState(new Set());

  useEffect(() => {
    setTasks(propTasks);
    if (propTasks.length > 0 && topics.length > 0) {
      const topicIdsWithTasks = [...new Set(propTasks.map(t => t.topic_id).filter(Boolean))];
      setExpandedTopics(topicIdsWithTasks);
    }
  }, [propTasks, topics]);

  useEffect(() => {
    if (error) {
      const timeoutId = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timeoutId);
    }
  }, [error]);

  const refreshTasks = async () => {
    setLoading(true);
    try {
      const workspaceData = await workspaceService.fetchWorkspaceData();
      setTasks(workspaceData.tasks);
    } catch (error) {
      console.error('Failed to refresh tasks:', error);
      setError('Failed to refresh tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId, currentStatus) => {
    if (updatingTasks.has(taskId)) return; // Prevent concurrent updates

    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    
    setUpdatingTasks(prev => new Set(prev).add(taskId));
    // Optimistic update
    setTasks(currentTasks => currentTasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
    
    try {
      await workspaceService.updateTask(taskId, { 
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null 
      });
      
      if (onTaskComplete) onTaskComplete(taskId, newStatus);
    } catch (error) {
      // Revert optimistic update on error
      setTasks(currentTasks => currentTasks.map(task => 
        task.id === taskId ? { ...task, status: currentStatus } : task
      ));
      
      console.error('Failed to update task:', error);
      setError('Failed to update task. Please try again.');
    } finally {
      setUpdatingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  };

  const handleCreateTask = async (newTaskData) => {
    try {
      const createdTask = await workspaceService.createTask(newTaskData);
      setTasks(prev => [...prev, createdTask]);
      setShowCreateTaskModal(false);
    } catch (error) {
      console.error('Failed to create task:', error);
      setError('Failed to create task. Please try again.');
    }
  };
  
  const toggleTopicExpansion = (topicId) => {
    setExpandedTopics(prev => 
      prev.includes(topicId) 
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  // Memoized calculations for performance
  const tasksByTopic = useMemo(() => 
    topics
      .map(topic => ({
        ...topic,
        tasks: tasks.filter(task => task.topic_id === topic.id)
      }))
      .filter(topic => topic.tasks.length > 0),
    [topics, tasks]
  );
  
  const unassignedTasks = useMemo(() => 
    tasks.filter(task => !task.topic_id),
    [tasks]
  );

  const completionStats = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    return { totalTasks, completedTasks, completionPercentage };
  }, [tasks]);

  const { totalTasks, completedTasks, completionPercentage } = completionStats;

  return (
    <div className="bg-white rounded-lg shadow-sm border h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800">My Tasks</h2>
            <p className="text-sm text-gray-500">
              {completedTasks} of {totalTasks} completed ({completionPercentage}%)
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreateTaskModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <HiOutlinePlus />
              Add Task
            </button>
            <button
              onClick={refreshTasks}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <HiOutlineRefresh className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-3 text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
            {error}
            <button 
              onClick={() => setError(null)}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Tasks Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {totalTasks === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiOutlineCheck className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
            <p className="text-gray-500 mb-4">Create your first task to get started with your learning journey.</p>
            <button
              onClick={() => setShowCreateTaskModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <HiOutlinePlus />
              Create Task
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Tasks grouped by topic */}
            {tasksByTopic.map(topic => (
              <TaskTopicGroup
                key={topic.id}
                topic={topic}
                isExpanded={expandedTopics.includes(topic.id)}
                onToggleExpansion={() => toggleTopicExpansion(topic.id)}
                onToggleTask={handleToggleTask}
                updatingTasks={updatingTasks}
              />
            ))}

            {/* Unassigned tasks */}
            {unassignedTasks.length > 0 && (
              <TaskTopicGroup
                topic={{ id: null, title: 'General Tasks', tasks: unassignedTasks }}
                isExpanded={expandedTopics.includes(null)}
                onToggleExpansion={() => toggleTopicExpansion(null)}
                onToggleTask={handleToggleTask}
                updatingTasks={updatingTasks}
              />
            )}
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {showCreateTaskModal && (
        <CreateTaskModal
          topics={topics}
          onClose={() => setShowCreateTaskModal(false)}
          onTaskCreated={handleCreateTask}
        />
      )}
    </div>
  );
}

// Task Topic Group Component
const TaskTopicGroup = ({ topic, isExpanded, onToggleExpansion, onToggleTask, updatingTasks }) => {
  const completedCount = topic.tasks.filter(t => t.status === 'completed').length;
  const totalCount = topic.tasks.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggleExpansion}
        className="w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
          <HiOutlineChevronDown 
            className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
          />
          <div className="text-left">
            <h3 className="font-medium text-gray-900">{topic.title}</h3>
            <p className="text-sm text-gray-500">
              {completedCount}/{totalCount} tasks completed ({progress}%)
            </p>
          </div>
        </div>
        <div className="w-16 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-2">
              {topic.tasks.map(task => (
                <TaskItem 
                  key={task.id}
                  task={task}
                  onToggle={onToggleTask}
                  isUpdating={updatingTasks.has(task.id)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Individual Task Item Component
const TaskItem = ({ task, onToggle, isUpdating }) => {
  const isCompleted = task.status === 'completed';
  
  return (
    <div
      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <div className="flex items-center space-x-3">
        <button
          onClick={() => onToggle(task.id, task.status)}
          disabled={isUpdating}
          className={`w-6 h-6 flex items-center justify-center rounded-full border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isCompleted 
              ? 'bg-blue-500 border-blue-500 text-white' 
              : 'bg-white border-gray-300 text-transparent'
          } ${isUpdating ? 'cursor-not-allowed opacity-50' : 'hover:border-blue-500'}`}
        >
          {isUpdating ? (
            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <HiOutlineCheck className="w-4 h-4" />
          )}
        </button>
        <div>
          <p className={`font-medium ${isCompleted ? 'line-through text-gray-500' : 'text-gray-800'}`}>
            {task.title}
          </p>
          {task.due_date && (
            <p className="text-xs text-gray-500">
              Due: {new Date(task.due_date).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Create Task Modal Component
const CreateTaskModal = ({ topics, onClose, onTaskCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [topicId, setTopicId] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const minDate = useMemo(() => new Date().toISOString().split('T')[0], []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    // Input validation
    if (title.trim().length > 100) {
      setError('Task title must be less than 100 characters');
      return;
    }
    
    if (description.trim().length > 500) {
      setError('Description must be less than 500 characters');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const taskData = {
        title: title.trim(),
        description: description.trim() || null,
        topic_id: topicId || null,
        priority,
        due_date: dueDate || null,
        status: 'pending'
      };

      await onTaskCreated(taskData);
      onClose();
    } catch (error) {
      console.error('Failed to create task:', error);
      setError(error.message || 'Failed to create task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-md"
      >
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Create New Task</h3>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-gray-400 hover:bg-gray-100 rounded-full"
              >
                <HiOutlineX />
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter task title..."
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter task description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign to Topic
                </label>
                <select
                  value={topicId}
                  onChange={(e) => setTopicId(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">General Tasks</option>
                  {topics.map(topic => (
                    <option key={topic.id} value={topic.id}>
                      {topic.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    min={minDate}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 p-6 pt-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};