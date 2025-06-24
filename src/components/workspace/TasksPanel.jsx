import React, { useState } from 'react';
import { HiOutlineCheck, HiOutlinePlus, HiOutlineChevronDown, HiOutlineChevronRight, HiOutlineRefresh, HiOutlineShare } from 'react-icons/hi';

export default function TasksPanel({ onShareContent }) {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Complete Calculus Problem Set",
      topic: "Calculus",
      dueDate: "2023-10-18",
      completed: false,
      subtasks: [
        { id: 101, title: "Problem 1: Limits", completed: true },
        { id: 102, title: "Problem 2: Derivatives", completed: true },
        { id: 103, title: "Problem 3: Applications", completed: false },
        { id: 104, title: "Problem 4: Optimization", completed: false }
      ],
      expanded: true
    },
    {
      id: 2,
      title: "Physics Lab Report",
      topic: "Physics",
      dueDate: "2023-10-20",
      completed: false,
      subtasks: [
        { id: 201, title: "Introduction", completed: false },
        { id: 202, title: "Methodology", completed: false },
        { id: 203, title: "Results", completed: false },
        { id: 204, title: "Conclusion", completed: false }
      ],
      expanded: false
    },
    {
      id: 3,
      title: "Read Chapter 5: Data Structures",
      topic: "Computer Science",
      dueDate: "2023-10-22",
      completed: false,
      subtasks: [
        { id: 301, title: "Arrays", completed: false },
        { id: 302, title: "Linked Lists", completed: false },
        { id: 303, title: "Stacks and Queues", completed: false }
      ],
      expanded: false
    }
  ]);

  const [newTask, setNewTask] = useState({ title: "", topic: "", dueDate: "" });
  const [showAddTask, setShowAddTask] = useState(false);

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, expanded: !task.expanded } : task
    ));
  };

  const toggleSubtask = (taskId, subtaskId) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const updatedSubtasks = task.subtasks.map(subtask => 
          subtask.id === subtaskId 
            ? { ...subtask, completed: !subtask.completed } 
            : subtask
        );
        
        // Check if all subtasks are completed
        const allCompleted = updatedSubtasks.every(st => st.completed);
        
        return {
          ...task,
          subtasks: updatedSubtasks,
          completed: allCompleted
        };
      }
      return task;
    }));
  };

  const toggleTaskCompletion = (id) => {
    setTasks(tasks.map(task => 
      task.id === id 
        ? { 
            ...task, 
            completed: !task.completed,
            subtasks: task.subtasks.map(st => ({ ...st, completed: !task.completed }))
          } 
        : task
    ));
  };

  const addTask = () => {
    if (newTask.title.trim()) {
      const newTaskObj = {
        id: Date.now(),
        title: newTask.title,
        topic: newTask.topic,
        dueDate: newTask.dueDate,
        completed: false,
        subtasks: [],
        expanded: true
      };
      setTasks([...tasks, newTaskObj]);
      setNewTask({ title: "", topic: "", dueDate: "" });
      setShowAddTask(false);
    }
  };

  const getProgress = (task) => {
    if (task.subtasks.length === 0) return task.completed ? 100 : 0;
    
    const completed = task.subtasks.filter(st => st.completed).length;
    return Math.round((completed / task.subtasks.length) * 100);
  };

  const regenerateTask = (id) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      alert(`AI is regenerating subtasks for: "${task.title}"`);
      // In a real app, this would call an AI API
    }
  };

  const handleShareTask = (task) => {
    onShareContent({
      id: task.id,
      type: 'task',
      title: task.title,
      content: task
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 bg-white border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Study Tasks</h2>
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
            onClick={() => setShowAddTask(true)}
          >
            <HiOutlinePlus className="mr-1" />
            <span>New Task</span>
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-4 min-w-[300px]">
          {tasks.map(task => (
            <div key={task.id} className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <div className="flex items-start">
                  <button 
                    className="mr-3 mt-1"
                    onClick={() => toggleTaskCompletion(task.id)}
                  >
                    {task.completed ? (
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                        <HiOutlineCheck className="text-white" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border border-gray-300"></div>
                    )}
                  </button>
                  
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                        {task.title}
                      </h3>
                      <div className="flex space-x-2">
                        <button 
                          className="text-gray-500 hover:text-blue-600"
                          onClick={() => handleShareTask(task)}
                          title="Share Task"
                        >
                          <HiOutlineShare />
                        </button>
                        <button 
                          className="text-gray-500 hover:text-blue-600"
                          onClick={() => regenerateTask(task.id)}
                          title="Regenerate with AI"
                        >
                          <HiOutlineRefresh />
                        </button>
                        <button 
                          className="text-gray-500 hover:text-gray-700"
                          onClick={() => toggleTask(task.id)}
                        >
                          {task.expanded ? <HiOutlineChevronDown /> : <HiOutlineChevronRight />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <span className="mr-3">{task.topic}</span>
                      {task.dueDate && (
                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                      )}
                    </div>
                    
                    {task.subtasks.length > 0 && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Progress</span>
                          <span>{getProgress(task)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${getProgress(task)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {task.expanded && task.subtasks.length > 0 && (
                <div className="p-4 bg-gray-50">
                  <div className="mb-3 text-sm font-medium">Subtasks:</div>
                  <ul className="space-y-2">
                    {task.subtasks.map(subtask => (
                      <li key={subtask.id} className="flex items-center">
                        <button 
                          className="mr-3"
                          onClick={() => toggleSubtask(task.id, subtask.id)}
                        >
                          {subtask.completed ? (
                            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                              <HiOutlineCheck className="text-white text-xs" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border border-gray-300"></div>
                          )}
                        </button>
                        <span className={`${subtask.completed ? 'line-through text-gray-500' : ''}`}>
                          {subtask.title}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-4 flex justify-end">
                    <button className="text-blue-600">Add Subtask</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Create New Task</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Task Title</label>
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                placeholder="Enter task title"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Topic</label>
              <input
                type="text"
                value={newTask.topic}
                onChange={(e) => setNewTask({...newTask, topic: e.target.value})}
                placeholder="Related topic (optional)"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button 
                className="px-4 py-2 border rounded-lg"
                onClick={() => setShowAddTask(false)}
              >
                Cancel
              </button>
              <button 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                onClick={addTask}
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}