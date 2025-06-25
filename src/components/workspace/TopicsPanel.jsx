import React, { useState, useEffect } from 'react';
import { HiOutlineChevronDown, HiOutlineChevronRight, HiOutlinePlus, HiOutlineDocumentAdd, HiOutlineTrash, HiOutlineShare, HiOutlineCheckCircle, HiOutlineClipboardList } from 'react-icons/hi';
import { workspace } from '../../lib/supabase';

export default function TopicsPanel({ topics: propTopics = [], onAiRequest, onShareContent, onRefresh, user }) {
  // Use topics from props instead of local state
  const [topics, setTopics] = useState(propTopics);
  const [activeTopic, setActiveTopic] = useState(null);
  const [newTopic, setNewTopic] = useState('');
  const [newMaterial, setNewMaterial] = useState({ title: '', type: 'pdf' });
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [scheduleImage, setScheduleImage] = useState(null);
  const [scheduleDescription, setScheduleDescription] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isTopicListOpen, setIsTopicListOpen] = useState(false);
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  const [showMaterials, setShowMaterials] = useState(false);
  const [loading, setLoading] = useState(false);

  // Update local topics when props change
  useEffect(() => {
    setTopics(propTopics);
    if (propTopics.length > 0 && !activeTopic) {
      setActiveTopic(propTopics[0].id);
    }
  }, [propTopics]);

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

  const addTopic = async () => {
    if (!newTopic.trim() || !user) {
      alert("Please enter a topic title and make sure you're logged in");
      return;
    }

    setLoading(true);
    try {
      const { data: createdTopic, error } = await workspace.createTopic({
        title: newTopic,
        description: "New study topic",
        category: "General",
        difficulty_level: "beginner",
        is_active: true
      }, user.id);

      if (error) {
        console.error('Error creating topic:', error);
        alert('Failed to create topic');
        return;
      }

      // Refresh the topics list
      if (onRefresh) {
        onRefresh();
      }

      setNewTopic('');
      document.getElementById('topic-modal').close();
    } catch (err) {
      console.error('Error creating topic:', err);
      alert('Failed to create topic');
    } finally {
      setLoading(false);
    }
  };

  const addMaterial = async () => {
    if (!newMaterial.title.trim() || !activeTopic || !user) {
      alert("Please enter a material title");
      return;
    }

    try {
      const { data: createdMaterial, error } = await workspace.createMaterial({
        topic_id: activeTopic,
        title: newMaterial.title,
        material_type: newMaterial.type,
        file_url: null, // In real app, would upload file first
        description: ''
      });

      if (error) {
        console.error('Error creating material:', error);
        alert('Failed to add material');
        return;
      }

      // Update local state optimistically
      setTopics(topics.map(topic => 
        topic.id === activeTopic 
          ? { 
              ...topic, 
              materials: [...(topic.materials || []), createdMaterial]
            } 
          : topic
      ));

      setNewMaterial({ title: '', type: 'pdf' });
      setShowAddMaterial(false);
    } catch (err) {
      console.error('Error adding material:', err);
      alert('Failed to add material');
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
            }
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
    if (topic && onShareContent) {
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
    if (topic && onAiRequest) {
      onAiRequest(`Regenerate structure for topic: ${topic.title}`);
      alert(`AI is regenerating structure for: "${topic.title}"`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  const getProgress = (topic) => {
    if (!topic.subtopics || topic.subtopics.length === 0) return 0;
    const completed = topic.subtopics.filter(sub => sub.completed).length;
    return Math.round((completed / topic.subtopics.length) * 100);
  };

  const getCompletedTasks = () => {
    const topic = topics.find(t => t.id === activeTopic);
    return topic?.subtopics?.filter(sub => sub.completed) || [];
  };

  const getPendingTasks = () => {
    const topic = topics.find(t => t.id === activeTopic);
    return topic?.subtopics?.filter(sub => !sub.completed) || [];
  };

  if (topics.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 bg-white border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Study Topics</h2>
            <button 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
              onClick={() => document.getElementById('topic-modal').showModal()}
            >
              <HiOutlinePlus className="mr-1" />
              <span>New Topic</span>
            </button>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiOutlineCheckCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No study topics yet</h3>
            <p className="text-gray-500 mb-4">Create your first topic to start organizing your learning</p>
            <button 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center mx-auto"
              onClick={() => document.getElementById('topic-modal').showModal()}
            >
              <HiOutlinePlus className="mr-1" />
              Create Topic
            </button>
          </div>
        </div>

        {/* New Topic Modal */}
        <dialog id="topic-modal" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Create New Topic</h3>
            <input
              type="text"
              placeholder="Enter topic title..."
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button 
                className="px-4 py-2 border rounded-lg"
                onClick={() => document.getElementById('topic-modal').close()}
              >
                Cancel
              </button>
              <button 
                className={`px-4 py-2 bg-blue-600 text-white rounded-lg ${loading ? 'opacity-50' : ''}`}
                onClick={addTopic}
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => document.getElementById('topic-modal').close()}></div>
        </dialog>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 bg-white border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Study Topics</h2>
          <div className="flex space-x-2">
            {onRefresh && (
              <button 
                className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm"
                onClick={onRefresh}
              >
                Refresh
              </button>
            )}
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
                        readOnly
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
                  <span className="font-medium">Materials ({topics.find(t => t.id === activeTopic)?.materials?.length || 0})</span>
                </div>
                {showMaterials ? <HiOutlineChevronDown /> : <HiOutlineChevronRight />}
              </button>
              {showMaterials && (
                <div className="px-3 pb-3 space-y-2">
                  {topics.find(t => t.id === activeTopic)?.materials?.map(material => (
                    <div key={material.id} className="flex items-center p-2 bg-blue-50 rounded">
                      <div className="mr-2">
                        {material.material_type === 'pdf' && (
                          <div className="bg-red-100 text-red-800 rounded text-xs px-2 py-1">PDF</div>
                        )}
                        {material.material_type === 'doc' && (
                          <div className="bg-blue-100 text-blue-800 rounded text-xs px-2 py-1">DOC</div>
                        )}
                        {material.material_type === 'image' && (
                          <div className="bg-green-100 text-green-800 rounded text-xs px-2 py-1">IMG</div>
                        )}
                        {material.material_type === 'video' && (
                          <div className="bg-yellow-100 text-yellow-800 rounded text-xs px-2 py-1">VID</div>
                        )}
                      </div>
                      <span className="text-sm flex-1">{material.title}</span>
                    </div>
                  )) || []}
                  {(!topics.find(t => t.id === activeTopic)?.materials?.length) && (
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
              <button 
                className="bg-blue-600 text-white px-4 rounded-r-lg"
                onClick={() => document.getElementById('topic-modal').showModal()}
              >
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
                      <p className="text-sm text-gray-500 truncate">{formatDate(topic.updated_at)}</p>
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
                          <span>{getProgress(topic)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${getProgress(topic)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="text-sm">
                        <p className="font-medium mb-1">Description:</p>
                        <p className="text-gray-600 mb-2">{topic.description || 'No description available'}</p>
                        
                        <div className="flex items-center gap-2 text-xs">
                          {topic.category && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {topic.category}
                            </span>
                          )}
                          {topic.difficulty_level && (
                            <span className={`px-2 py-1 rounded ${
                              topic.difficulty_level === 'beginner' ? 'bg-green-100 text-green-800' :
                              topic.difficulty_level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {topic.difficulty_level}
                            </span>
                          )}
                        </div>
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
                onClick={() => setShowAddMaterial(true)}
              >
                Add Material
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
                  <h3 className="font-bold mb-2">Study Materials</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {topics.find(t => t.id === activeTopic)?.materials?.map(material => (
                      <div key={material.id} className="border rounded-lg p-3 flex items-center">
                        <div className="mr-3">
                          {material.material_type === 'pdf' && (
                            <div className="bg-red-100 text-red-800 rounded w-10 h-10 flex items-center justify-center text-xs">
                              PDF
                            </div>
                          )}
                          {material.material_type === 'doc' && (
                            <div className="bg-blue-100 text-blue-800 rounded w-10 h-10 flex items-center justify-center text-xs">
                              DOC
                            </div>
                          )}
                          {material.material_type === 'image' && (
                            <div className="bg-green-100 text-green-800 rounded w-10 h-10 flex items-center justify-center text-xs">
                              IMG
                            </div>
                          )}
                          {material.material_type === 'video' && (
                            <div className="bg-yellow-100 text-yellow-800 rounded w-10 h-10 flex items-center justify-center text-xs">
                              VID
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium truncate">{material.title}</p>
                          <p className="text-sm text-gray-500 capitalize">{material.material_type}</p>
                        </div>
                      </div>
                    )) || []}
                    {(!topics.find(t => t.id === activeTopic)?.materials?.length) && (
                      <div className="col-span-full text-center py-8 text-gray-500">
                        <p>No materials added yet</p>
                        <button 
                          className="mt-2 text-blue-600 hover:text-blue-800"
                          onClick={() => setShowAddMaterial(true)}
                        >
                          Add your first material
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {showAddMaterial && (
                    <div className="border rounded-lg p-4 bg-blue-50 mb-4">
                      <h4 className="font-medium mb-3">Add New Material</h4>
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          placeholder="Material title..."
                          value={newMaterial.title}
                          onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                          className="flex-1 px-3 py-2 border rounded-lg"
                        />
                        <select
                          value={newMaterial.type}
                          onChange={(e) => setNewMaterial({ ...newMaterial, type: e.target.value })}
                          className="px-3 py-2 border rounded-lg"
                        >
                          <option value="pdf">PDF</option>
                          <option value="doc">Document</option>
                          <option value="image">Image</option>
                          <option value="video">Video</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                          onClick={addMaterial}
                        >
                          Add
                        </button>
                        <button 
                          className="px-4 py-2 border rounded-lg"
                          onClick={() => setShowAddMaterial(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-bold mb-2">Topic Information</h3>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <p className="text-gray-900">{topics.find(t => t.id === activeTopic)?.title}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <p className="text-gray-900">{topics.find(t => t.id === activeTopic)?.category || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                        <p className="text-gray-900 capitalize">{topics.find(t => t.id === activeTopic)?.difficulty_level || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                        <p className="text-gray-900">{formatDate(topics.find(t => t.id === activeTopic)?.updated_at)}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <p className="text-gray-900">{topics.find(t => t.id === activeTopic)?.description || 'No description available'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Topic Modal */}
      <dialog id="topic-modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Create New Topic</h3>
          <input
            type="text"
            placeholder="Enter topic title..."
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          />
          <div className="flex justify-end space-x-2">
            <button 
              className="px-4 py-2 border rounded-lg"
              onClick={() => document.getElementById('topic-modal').close()}
            >
              Cancel
            </button>
            <button 
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg ${loading ? 'opacity-50' : ''}`}
              onClick={addTopic}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
        <div className="modal-backdrop" onClick={() => document.getElementById('topic-modal').close()}></div>
      </dialog>
    </div>
  );
}