import React, { useState, useEffect } from 'react';
import { HiOutlineCheck, HiOutlineChevronDown, HiOutlineRefresh } from 'react-icons/hi';
import { AnimatePresence, motion } from 'framer-motion';
import workspaceService from '../../services/workspace';

export default function TasksPanel({ tasks: propTasks = [], onTaskComplete, topics = [] }) {
  const [tasks, setTasks] = useState(propTasks);
  const [loading, setLoading] = useState(false);
  const [expandedTopics, setExpandedTopics] = useState([]);

  useEffect(() => {
    setTasks(propTasks);
    if (propTasks.length > 0 && topics.length > 0) {
      const topicIdsWithTasks = [...new Set(propTasks.map(t => t.topic_id).filter(Boolean))];
      setExpandedTopics(topicIdsWithTasks);
    }
  }, [propTasks, topics]);

  const refreshTasks = async () => {
    setLoading(true);
    const workspaceData = await workspaceService.fetchWorkspaceData();
    setTasks(workspaceData.tasks);
    setLoading(false);
  };

  const handleToggleTask = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    await workspaceService.updateTask(taskId, { 
      status: newStatus,
      completed_at: newStatus === 'completed' ? new Date().toISOString() : null 
    });
    
    setTasks(currentTasks => currentTasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
    
    if (onTaskComplete) onTaskComplete(taskId, newStatus);
  };
  
  const toggleTopicExpansion = (topicId) => {
    setExpandedTopics(prev => 
      prev.includes(topicId) 
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const tasksByTopic = topics
    .map(topic => ({
      ...topic,
      tasks: tasks.filter(task => task.topic_id === topic.id)
    }))
    .filter(topic => topic.tasks.length > 0);
    
  const unassignedTasks = tasks.filter(task => !task.topic_id);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      <div className="p-4 bg-white border-b sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">My Task List</h2>
            <p className="text-sm text-gray-500">{completedTasks} of {totalTasks} tasks completed</p>
          </div>
          <button 
            className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100 transition-colors"
            onClick={refreshTasks}
            disabled={loading}
          >
            <HiOutlineRefresh className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {tasksByTopic.map(topic => (
          <div key={topic.id} className="bg-white p-4 rounded-lg shadow-sm border">
            <div 
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleTopicExpansion(topic.id)}
            >
              <h3 className="font-bold text-gray-700">{topic.title}</h3>
              <HiOutlineChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedTopics.includes(topic.id) ? 'rotate-180' : ''}`} />
                    </div>
                    
            <AnimatePresence>
              {expandedTopics.includes(topic.id) && (
                <motion.div
                  initial={{ height: 0, opacity: 0, marginTop: 0 }}
                  animate={{ height: 'auto', opacity: 1, marginTop: '1rem' }}
                  exit={{ height: 0, opacity: 0, marginTop: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2">
                    {topic.tasks.map(task => (
                      <TaskItem key={task.id} task={task} onToggle={handleToggleTask} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            </div>
          ))}
        
        {unassignedTasks.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="font-bold text-gray-700">General Tasks</h3>
            <div className="mt-4 space-y-2">
              {unassignedTasks.map(task => (
                <TaskItem key={task.id} task={task} onToggle={handleToggleTask} />
              ))}
            </div>
          </div>
        )}
        
        {tasks.length === 0 && !loading && (
          <div className="text-center py-10 text-gray-500">
            <p>No tasks found.</p>
            <p className="text-sm">Tasks generated from your learning topics will appear here.</p>
        </div>
      )}
      </div>
    </div>
  );
}

const TaskItem = ({ task, onToggle }) => (
  <div className="flex items-center p-2 rounded-md hover:bg-gray-100 transition-colors">
    <button onClick={() => onToggle(task.id, task.status)} className="mr-3">
      <HiOutlineCheck className={`w-5 h-5 transition-all ${task.status === 'completed' ? 'text-green-500 bg-green-100 rounded-full p-0.5' : 'text-gray-400'}`}/>
    </button>
    <span className={`flex-1 text-sm ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-700'}`}>
      {task.title}
    </span>
  </div>
);