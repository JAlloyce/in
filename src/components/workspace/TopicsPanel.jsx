import React, { useState, useEffect } from 'react';
import { HiOutlineChevronDown, HiOutlineChevronRight, HiOutlinePlus, HiOutlineDocumentAdd, HiOutlineTrash, HiOutlineShare, HiOutlineCheckCircle, HiOutlineClipboardList } from 'react-icons/hi';

export default function TopicsPanel({ onAiRequest, onShareContent }) {
  const [topics, setTopics] = useState([
    {
      id: 1,
      title: "Calculus",
      expanded: true,
      progress: 65,
      lastUpdated: "2 days ago",
      subtopics: [
        { id: 101, title: "Limits and Continuity", completed: true },
        { id: 102, title: "Derivatives", completed: true },
        { id: 103, title: "Applications of Derivatives", completed: false },
        { id: 104, title: "Integration", completed: false }
      ],
      materials: [
        { id: 1001, title: "Lecture Notes - Week 1", type: "pdf" },
        { id: 1002, title: "Practice Problems", type: "doc" },
        { id: 1003, title: "Reference Formulas", type: "image" }
      ],
      schedule: {
        image: null,
        description: "Monday & Wednesday 9-11 AM, Friday review sessions"
      }
    },
    {
      id: 2,
      title: "Physics",
      expanded: false,
      progress: 40,
      lastUpdated: "1 week ago",
      subtopics: [
        { id: 201, title: "Mechanics", completed: true },
        { id: 202, title: "Thermodynamics", completed: false }
      ],
      materials: [
        { id: 2001, title: "Lab Manual", type: "pdf" }
      ],
      schedule: {
        image: null,
        description: "Tuesday & Thursday 1-3 PM, Lab on Fridays"
      }
    },
    {
      id: 3,
      title: "Computer Science",
      expanded: false,
      progress: 30,
      lastUpdated: "3 days ago",
      subtopics: [
        { id: 301, title: "Data Structures", completed: false },
        { id: 302, title: "Algorithms", completed: false }
      ],
      materials: [],
      schedule: {
        image: null,
        description: "Online course, self-paced with weekly deadlines"
      }
    }
  ]);

  const [newTopic, setNewTopic] = useState('');
  const [activeTopic, setActiveTopic] = useState(1);
  const [newMaterial, setNewMaterial] = useState({ title: '', type: 'pdf' });
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [scheduleImage, setScheduleImage] = useState(null);
  const [scheduleDescription, setScheduleDescription] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isTopicListOpen, setIsTopicListOpen] = useState(false);
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  const [showMaterials, setShowMaterials] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsTopicListOpen(false);
      } else {
        setIsTopicListOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleTopic = (id) => {
    setTopics(topics.map(topic => 
      topic.id === id ? { ...topic, expanded: !topic.expanded } : topic
    ));
  };

  const addTopic = () => {
    if (newTopic.trim()) {
      const newTopicObj = {
        id: Date.now(),
        title: newTopic,
        expanded: false,
        progress: 0,
        lastUpdated: "Just now",
        subtopics: [],
        materials: [],
        schedule: {
          image: null,
          description: ""
        }
      };
      setTopics([...topics, newTopicObj]);
      setNewTopic('');
      document.getElementById('topic-modal').close();
    }
  };

  const addMaterial = () => {
    if (newMaterial.title.trim()) {
      setTopics(topics.map(topic => 
        topic.id === activeTopic 
          ? { 
              ...topic, 
              materials: [...topic.materials, { id: Date.now(), ...newMaterial }],
              lastUpdated: "Just now"
            } 
          : topic
      ));
      setNewMaterial({ title: '', type: 'pdf' });
      setShowAddMaterial(false);
    }
  };

  const handleScheduleUpdate = () => {
    setTopics(topics.map(topic => 
      topic.id === activeTopic 
        ? { 
            ...topic, 
            schedule: {
              image: scheduleImage,
              description: scheduleDescription
            },
            lastUpdated: "Just now"
          } 
        : topic
    ));
    setShowScheduleModal(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScheduleImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleShareTopic = () => {
    const topic = topics.find(t => t.id === activeTopic);
    if (topic) {
      onShareContent({
        id: topic.id,
        type: 'topic',
        title: topic.title,
        content: topic
      });
    }
  };

  const handleRegenerateTopic = () => {
    const topic = topics.find(t => t.id === activeTopic);
    if (topic) {
      onAiRequest(`Regenerate structure for topic: ${topic.title}`);
      alert(`AI is regenerating structure for: "${topic.title}"`);
    }
  };

  const toggleSubtopicCompletion = (subtopicId) => {
    setTopics(topics.map(topic => 
      topic.id === activeTopic 
        ? {
            ...topic,
            subtopics: topic.subtopics.map(sub => 
              sub.id === subtopicId ? { ...sub, completed: !sub.completed } : sub
            ),
            lastUpdated: "Just now"
          }
        : topic
    ));
  };

  const getCompletedTasks = () => {
    const topic = topics.find(t => t.id === activeTopic);
    return topic ? topic.subtopics.filter(sub => sub.completed) : [];
  };

  const getPendingTasks = () => {
    const topic = topics.find(t => t.id === activeTopic);
    return topic ? topic.subtopics.filter(sub => !sub.completed) : [];
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 bg-white border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Study Topics</h2>
          <div className="flex space-x-2">
            <button 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
              onClick={() => document.getElementById('topic-modal').showModal()}
            >
              <HiOutlinePlus className="mr-1" />
              <span>New Topic</span>
            </button>
          </div>
        </div>
      </div>
      
      {isMobile && activeTopic && (
        <div className="p-3 bg-gray-50 border-b">
          <div className="space-y-2">
            <div className="bg-white rounded-lg border">
              <button
                onClick={() => setShowCompletedTasks(!showCompletedTasks)}
                className="w-full p-3 flex items-center justify-between text-left"
              >
                <div className="flex items-center">
                  <HiOutlineCheckCircle className="mr-2 text-green-600" />
                  <span className="font-medium">Completed Tasks ({getCompletedTasks().length})</span>
                </div>
                {showCompletedTasks ? <HiOutlineChevronDown /> : <HiOutlineChevronRight />}
              </button>
              {showCompletedTasks && (
                <div className="px-3 pb-3 space-y-2">
                  {getCompletedTasks().map(task => (
                    <div key={task.id} className="flex items-center p-2 bg-green-50 rounded">
                      <input
                        type="checkbox"
                        checked={true}
                        onChange={() => toggleSubtopicCompletion(task.id)}
                        className="mr-2"
                      />
                      <span className="text-sm line-through text-gray-600">{task.title}</span>
                    </div>
                  ))}
                  {getCompletedTasks().length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-2">No completed tasks yet</p>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg border">
              <button
                onClick={() => setShowMaterials(!showMaterials)}
                className="w-full p-3 flex items-center justify-between text-left"
              >
                <div className="flex items-center">
                  <HiOutlineClipboardList className="mr-2 text-blue-600" />
                  <span className="font-medium">Materials ({topics.find(t => t.id === activeTopic)?.materials.length || 0})</span>
                </div>
                {showMaterials ? <HiOutlineChevronDown /> : <HiOutlineChevronRight />}
              </button>
              {showMaterials && (
                <div className="px-3 pb-3 space-y-2">
                  {topics.find(t => t.id === activeTopic)?.materials.map(material => (
                    <div key={material.id} className="flex items-center p-2 bg-blue-50 rounded">
                      <div className="mr-2">
                        {material.type === 'pdf' && (
                          <div className="bg-red-100 text-red-800 rounded text-xs px-2 py-1">PDF</div>
                        )}
                        {material.type === 'doc' && (
                          <div className="bg-blue-100 text-blue-800 rounded text-xs px-2 py-1">DOC</div>
                        )}
                        {material.type === 'image' && (
                          <div className="bg-green-100 text-green-800 rounded text-xs px-2 py-1">IMG</div>
                        )}
                        {material.type === 'video' && (
                          <div className="bg-yellow-100 text-yellow-800 rounded text-xs px-2 py-1">VID</div>
                        )}
                      </div>
                      <span className="text-sm flex-1">{material.title}</span>
                    </div>
                  )) || []}
                  {(!topics.find(t => t.id === activeTopic)?.materials.length) && (
                    <p className="text-sm text-gray-500 text-center py-2">No materials uploaded yet</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="flex flex-1 overflow-hidden">
        <div className={`w-full lg:w-1/3 bg-white border-r overflow-y-auto transition-all duration-300 ${isMobile ? (isTopicListOpen ? 'block' : 'hidden lg:block') : 'block'}`}>
          <div className="p-4">
            <div className="flex mb-4">
              <input
                type="text"
                placeholder="Search topics..."
                className="flex-1 px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="bg-blue-600 text-white px-4 rounded-r-lg">
                <HiOutlinePlus className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-2">
              {topics.map(topic => (
                <div 
                  key={topic.id} 
                  className={`border rounded-lg overflow-hidden cursor-pointer ${
                    activeTopic === topic.id ? 'border-blue-500 shadow-md' : ''
                  }`}
                  onClick={() => {
                    setActiveTopic(topic.id);
                    if (isMobile) setIsTopicListOpen(false);
                  }}
                >
                  <div className="p-3 bg-gray-50 flex justify-between items-center">
                    <div className="min-w-0">
                      <h3 className="font-medium truncate">{topic.title}</h3>
                      <p className="text-sm text-gray-500 truncate">{topic.lastUpdated}</p>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTopic(topic.id);
                      }}
                    >
                      {topic.expanded ? <HiOutlineChevronDown /> : <HiOutlineChevronRight />}
                    </button>
                  </div>
                  
                  {topic.expanded && (
                    <div className="p-3 bg-white">
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{topic.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${topic.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="text-sm">
                        <p className="font-medium mb-1">Subtopics:</p>
                        <ul className="space-y-1">
                          {topic.subtopics.map(sub => (
                            <li key={sub.id} className="flex items-center">
                              <input 
                                type="checkbox" 
                                checked={sub.completed}
                                className="mr-2"
                                onChange={() => toggleSubtopicCompletion(sub.id)}
                              />
                              <span className={sub.completed ? 'line-through text-gray-500' : ''}>
                                {sub.title}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col min-w-0">
          <div className="p-4 bg-white border-b flex flex-wrap gap-2">
            {isMobile && (
              <button 
                className="lg:hidden bg-gray-200 p-2 rounded text-sm"
                onClick={() => setIsTopicListOpen(!isTopicListOpen)}
              >
                {isTopicListOpen ? 'Hide Topics' : 'Show Topics'}
              </button>
            )}
            <div className="flex flex-1 space-x-2">
              <button 
                className="bg-gray-100 px-3 py-1 rounded-lg flex items-center text-sm"
                onClick={handleShareTopic}
              >
                <HiOutlineShare className="mr-1" />
                Share
              </button>
              <button 
                className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm"
                onClick={() => document.getElementById('subtopic-modal').showModal()}
              >
                Add Subtopic
              </button>
              <button 
                className="bg-purple-600 text-white px-3 py-1 rounded-lg text-sm"
                onClick={handleRegenerateTopic}
              >
                Regenerate with AI
              </button>
            </div>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto">
            {activeTopic && (
              <div className="space-y-6">
                <div className={`${isMobile ? 'hidden' : 'block'}`}>
                  <h3 className="font-bold mb-2">Pending Tasks</h3>
                  <div className="space-y-2">
                    {getPendingTasks().map(task => (
                      <div key={task.id} className="flex items-center p-3 bg-yellow-50 rounded-lg border">
                        <input
                          type="checkbox"
                          checked={false}
                          onChange={() => toggleSubtopicCompletion(task.id)}
                          className="mr-3"
                        />
                        <span className="font-medium">{task.title}</span>
                      </div>
                    ))}
                    {getPendingTasks().length === 0 && (
                      <p className="text-gray-500 text-center py-4">All tasks completed! 🎉</p>
                    )}
                  </div>
                </div>

                <div className={`${isMobile ? 'hidden' : 'block'}`}>
                  <h3 className="font-bold mb-2">Materials & Resources</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {topics.find(t => t.id === activeTopic)?.materials.map(material => (
                      <div key={material.id} className="border rounded-lg p-3 flex items-center">
                        <div className="mr-3">
                          {material.type === 'pdf' && (
                            <div className="bg-red-100 text-red-800 rounded w-10 h-10 flex items-center justify-center">
                              PDF
                            </div>
                          )}
                          {material.type === 'doc' && (
                            <div className="bg-blue-100 text-blue-800 rounded w-10 h-10 flex items-center justify-center">
                              DOC
                            </div>
                          )}
                          {material.type === 'image' && (
                            <div className="bg-green-100 text-green-800 rounded w-10 h-10 flex items-center justify-center">
                              IMG
                            </div>
                          )}
                          {material.type === 'video' && (
                            <div className="bg-yellow-100 text-yellow-800 rounded w-10 h-10 flex items-center justify-center">
                              VID
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium truncate">{material.title}</p>
                          <p className="text-sm text-gray-500 capitalize">{material.type}</p>
                        </div>
                        <button className="text-gray-400 hover:text-red-500">
                          <HiOutlineTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <button 
                    className="flex items-center text-blue-600"
                    onClick={() => setShowAddMaterial(true)}
                  >
                    <HiOutlineDocumentAdd className="mr-1" />
                    Add Material
                  </button>
                </div>

                <div>
                  <h3 className="font-bold mb-2">Class Schedule</h3>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    {topics.find(t => t.id === activeTopic)?.schedule?.image ? (
                      <div className="mb-3">
                        <img 
                          src={topics.find(t => t.id === activeTopic).schedule.image} 
                          alt="Schedule" 
                          className="max-w-full h-auto rounded-lg border"
                        />
                      </div>
                    ) : (
                      <div className="border-2 border-dashed rounded-lg p-8 text-center mb-4">
                        <p className="text-gray-500">No schedule image uploaded</p>
                      </div>
                    )}
                    
                    <div className="mb-3">
                      <p className="font-medium">Schedule Details:</p>
                      <p className="text-gray-700">
                        {topics.find(t => t.id === activeTopic)?.schedule?.description || 
                         "No schedule description added"}
                      </p>
                    </div>
                    
                    <button 
                      className="text-blue-600"
                      onClick={() => {
                        const topic = topics.find(t => t.id === activeTopic);
                        setScheduleImage(topic?.schedule?.image || null);
                        setScheduleDescription(topic?.schedule?.description || '');
                        setShowScheduleModal(true);
                      }}
                    >
                      {topics.find(t => t.id === activeTopic)?.schedule?.image ? 
                        "Edit Schedule" : "Add Schedule"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <dialog id="topic-modal" className="rounded-lg shadow-xl p-0 w-full max-w-md">
        <div className="p-6">
          <h3 className="text-lg font-bold mb-4">Create New Topic</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Topic Name</label>
            <input
              type="text"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              placeholder="Enter topic name"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button 
              className="px-4 py-2 border rounded-lg"
              onClick={() => document.getElementById('topic-modal').close()}
            >
              Cancel
            </button>
            <button 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg"
              onClick={addTopic}
            >
              Create
            </button>
          </div>
        </div>
      </dialog>
      
      <dialog id="subtopic-modal" className="rounded-lg shadow-xl p-0 w-full max-w-md">
        <div className="p-6">
          <h3 className="text-lg font-bold mb-4">Add New Subtopic</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Subtopic Name</label>
            <input
              type="text"
              placeholder="Enter subtopic name"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button 
              className="px-4 py-2 border rounded-lg"
              onClick={() => document.getElementById('subtopic-modal').close()}
            >
              Cancel
            </button>
            <button 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg"
              onClick={() => document.getElementById('subtopic-modal').close()}
            >
              Add
            </button>
          </div>
        </div>
      </dialog>
      
      {showAddMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Add New Material</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Material Title</label>
              <input
                type="text"
                value={newMaterial.title}
                onChange={(e) => setNewMaterial({...newMaterial, title: e.target.value})}
                placeholder="Enter material title"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={newMaterial.type}
                onChange={(e) => setNewMaterial({...newMaterial, type: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pdf">PDF Document</option>
                <option value="doc">Word Document</option>
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="link">Web Link</option>
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <button 
                className="px-4 py-2 border rounded-lg"
                onClick={() => setShowAddMaterial(false)}
              >
                Cancel
              </button>
              <button 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                onClick={addMaterial}
              >
                Add Material
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Update Schedule</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Upload Schedule Image</label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                {scheduleImage ? (
                  <div>
                    <img 
                      src={scheduleImage} 
                      alt="Schedule" 
                      className="max-w-full h-32 mx-auto mb-2"
                    />
                    <button 
                      className="text-blue-600 text-sm"
                      onClick={() => setScheduleImage(null)}
                    >
                      Remove Image
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-500 mb-2">Drag & drop or click to upload</p>
                    <label className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg cursor-pointer">
                      Choose File
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Schedule Description</label>
              <textarea
                value={scheduleDescription}
                onChange={(e) => setScheduleDescription(e.target.value)}
                placeholder="Describe your schedule (e.g., Monday 9-11 AM, Wednesday lab sessions)"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <button 
                className="px-4 py-2 border rounded-lg"
                onClick={() => setShowScheduleModal(false)}
              >
                Cancel
              </button>
              <button 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                onClick={handleScheduleUpdate}
              >
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}