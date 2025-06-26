import React, { useState, useEffect } from 'react';
import { 
  HiOutlinePlus, 
  HiOutlineX, 
  HiOutlineSparkles, 
  HiOutlineChevronDown,
  HiOutlineTrash,
  HiOutlineExclamation,
  HiOutlineDocument,
  HiOutlinePhotograph,
  HiOutlineEye,
  HiOutlineCheckCircle,
  HiOutlineArrowRight
} from 'react-icons/hi';
import { AnimatePresence, motion } from 'framer-motion';
import workspaceService from '../../services/workspace';
import ocrService from '../../services/ocr';
import AITaskGenerator from './AITaskGenerator';

export default function TopicsPanelV2({ topics: propTopics = [], onAiRequest, onShareContent, onRefresh, user, tasks = [] }) {
  const [topics, setTopics] = useState(propTopics);
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showCreateTopicModal, setShowCreateTopicModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState(null);
  const [showAIGenerator, setShowAIGenerator] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setTopics(propTopics);
    if (!selectedTopicId && propTopics.length > 0 && !isMobile) {
      setSelectedTopicId(propTopics[0].id);
    }
  }, [propTopics, isMobile]);

  const selectedTopic = topics.find(t => t.id === selectedTopicId);

  const handleCreateTopic = (newTopicData) => {
    setTopics(prev => [...prev, newTopicData]);
    setSelectedTopicId(newTopicData.id);
    if (onRefresh) onRefresh();
  };

  const handleDeleteTopic = async () => {
    if (!topicToDelete) return;
    await workspaceService.deleteTopic(topicToDelete.id);
    setTopics(prev => prev.filter(t => t.id !== topicToDelete.id));
    if (selectedTopicId === topicToDelete.id) {
      setSelectedTopicId(topics.length > 1 ? topics.find(t => t.id !== topicToDelete.id).id : null);
    }
    setShowDeleteModal(false);
    setTopicToDelete(null);
  };
  
  const handleAITasksGenerated = async (aiResults) => {
    if (!selectedTopicId) return;
    await workspaceService.addAiGeneratedContent(selectedTopicId, aiResults);
    if (onRefresh) onRefresh();
    setShowAIGenerator(false);
    alert('AI content added successfully!');
  };

  const handleToggleMaterialComplete = async (materialId, currentStatus) => {
    const newStatus = !currentStatus;
    await workspaceService.updateMaterial(materialId, { completed: newStatus });
    
    setTopics(prevTopics => prevTopics.map(topic => {
      if (topic.id === selectedTopicId) {
        return {
          ...topic,
          materials: topic.materials.map(material => 
            material.id === materialId ? { ...material, completed: newStatus } : material
          )
        };
      }
      return topic;
    }));
  };

  const TopicList = () => (
    <div className={`
      ${isMobile && selectedTopicId ? 'hidden' : 'block'} 
      w-full md:w-1/3 md:flex-shrink-0 border-r border-gray-200 bg-gray-50/50 overflow-y-auto
    `}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Learning Topics</h2>
          <button
            onClick={() => setShowCreateTopicModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <HiOutlinePlus />
            New
          </button>
        </div>
        <div className="space-y-2">
          {topics.length > 0 ? topics.map(topic => (
            <TopicListItem 
              key={topic.id} 
              topic={topic}
              isSelected={topic.id === selectedTopicId}
              onSelect={() => setSelectedTopicId(topic.id)}
              onDelete={(e) => {
                e.stopPropagation();
                setTopicToDelete(topic);
                setShowDeleteModal(true);
              }}
            />
          )) : (
            <div className="text-center py-10 text-gray-500">
              <p>No topics yet.</p>
              <button onClick={() => setShowCreateTopicModal(true)} className="mt-2 text-blue-600 font-medium">Create one to start!</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border h-full flex overflow-hidden">
      <AnimatePresence>
        <TopicList />
      </AnimatePresence>
      
      <AnimatePresence>
        {selectedTopic && (
          <TopicDetails 
            topic={selectedTopic}
            tasks={tasks.filter(t => t.topic_id === selectedTopic.id)}
            isMobile={isMobile}
            onBack={() => setSelectedTopicId(null)}
            onShowAIGenerator={() => setShowAIGenerator(true)}
            onToggleMaterialComplete={handleToggleMaterialComplete}
          />
        )}
      </AnimatePresence>
      
      {!selectedTopicId && !isMobile && (
        <div className="flex-1 flex items-center justify-center text-center text-gray-500">
          <div>
            <HiOutlineArrowRight className="mx-auto h-12 w-12 text-gray-400 transform -rotate-45" />
            <h3 className="mt-2 text-lg font-medium">Select a topic</h3>
            <p className="mt-1 text-sm">Choose a topic from the left to see its details.</p>
          </div>
        </div>
      )}

      {showCreateTopicModal && (
        <CreateTopicModal 
          onClose={() => setShowCreateTopicModal(false)}
          onTopicCreated={handleCreateTopic}
          user={user}
        />
      )}

      {showDeleteModal && (
        <DeleteConfirmationModal
          topicName={topicToDelete?.title}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteTopic}
        />
      )}

      {showAIGenerator && selectedTopic && (
        <AITaskGenerator
          topic={selectedTopic}
          onTasksGenerated={handleAITasksGenerated}
          onClose={() => setShowAIGenerator(false)}
        />
      )}
    </div>
  );
}

const TopicListItem = ({ topic, isSelected, onSelect, onDelete }) => {
  const completedCount = topic.materials?.filter(m => m.completed).length || 0;
  const totalCount = topic.materials?.length || 0;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onClick={onSelect}
      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
        isSelected ? 'bg-white shadow-md border' : 'hover:bg-gray-200/50'
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <p className={`font-bold truncate ${isSelected ? 'text-blue-600' : 'text-gray-800'}`}>{topic.title}</p>
          <p className="text-sm text-gray-500 truncate mt-1">{topic.description || 'No description'}</p>
        </div>
        <button onClick={onDelete} className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-100 rounded-full ml-2 flex-shrink-0">
          <HiOutlineTrash className="w-4 h-4" />
        </button>
      </div>
      <div className="mt-3">
        <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
    </motion.div>
  );
};

const TopicDetails = ({ topic, tasks, isMobile, onBack, onShowAIGenerator, onToggleMaterialComplete }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: isMobile ? '100%' : 0 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: isMobile ? '100%' : 0 }}
      transition={{ type: 'tween', duration: 0.3 }}
      className="flex-1 flex flex-col bg-white overflow-y-auto absolute md:relative inset-0"
    >
      <div className="flex items-center justify-between p-4 border-b z-10 bg-white/80 backdrop-blur-sm sticky top-0">
        {isMobile && (
          <button onClick={onBack} className="flex items-center gap-1 text-blue-600 font-medium text-sm">
            <HiOutlineChevronDown className="w-5 h-5 transform rotate-90" />
            Topics
          </button>
        )}
        <h3 className="text-lg font-bold text-gray-800 truncate">{topic.title}</h3>
        <button onClick={onShowAIGenerator} className="flex items-center gap-2 px-3 py-2 bg-purple-500 text-white rounded-lg text-sm">
          <HiOutlineSparkles />
          AI Gen
        </button>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <h4 className="font-bold text-gray-700 mb-2">Description</h4>
          <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-md">{topic.description || 'No description provided.'}</p>
        </div>
        
        <div>
          <h4 className="font-bold text-gray-700 mb-3">Learning Materials</h4>
          <div className="space-y-3">
            {topic.materials?.length > 0 ? topic.materials.map(material => (
              <MaterialItem 
                key={material.id} 
                material={material} 
                onToggleComplete={() => onToggleMaterialComplete(material.id, material.completed)}
              />
            )) : (
              <p className="text-center text-sm text-gray-500 py-4">No materials yet.</p>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-bold text-gray-700 mb-3">Related Tasks</h4>
          <div className="space-y-2">
            {tasks?.length > 0 ? tasks.map(task => (
               <div key={task.id} className="text-sm p-3 bg-gray-50 rounded-md">
                 <p className={`${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                   {task.title}
                 </p>
               </div>
            )) : (
              <p className="text-center text-sm text-gray-500 py-4">No tasks for this topic.</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const MaterialItem = ({ material, onToggleComplete }) => (
  <div className={`flex items-center p-3 border rounded-lg transition-all ${material.completed ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
    <button onClick={onToggleComplete} className="mr-3">
      <HiOutlineCheckCircle className={`w-6 h-6 transition-colors ${material.completed ? 'text-green-500' : 'text-gray-300 hover:text-green-400'}`} />
    </button>
    <div className="flex-1 min-w-0">
      <p className={`font-medium truncate ${material.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
        {material.title}
      </p>
      <span className="text-xs text-gray-400 uppercase">{material.material_type}</span>
    </div>
    {material.url && (
      <a href={material.url} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-blue-500">
        <HiOutlineEye />
      </a>
    )}
  </div>
);

const CreateTopicModal = ({ onClose, onTopicCreated, user }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [attachFile, setAttachFile] = useState(false);
  const [file, setFile] = useState(null);
  const [fileTitle, setFileTitle] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    setIsProcessing(true);
    setFile(selectedFile);
    if (!fileTitle) setFileTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));

    if (ocrService.isImageFile(selectedFile)) {
      const ocrResult = await ocrService.extractTextFromImage(selectedFile, {});
      if (ocrResult.success) {
        setExtractedText(ocrResult.text);
      }
    }
    setIsProcessing(false);
  };

  const handleCreate = async () => {
    if (!title.trim()) return;
    
    setLoading(true);
    try {
      const newTopic = await workspaceService.createTopic({
        title,
        description,
        user_id: user.id
      });

      if (attachFile && file) {
        const publicUrl = await workspaceService.uploadFile(file, user.id);
        await workspaceService.createMaterial(newTopic.id, {
          title: fileTitle || file.name,
          type: 'file',
          content: extractedText,
          url: publicUrl,
          file_path: `${user.id}/${file.name}`
        });
      }
      
      const fullNewTopic = await workspaceService.getTopicById(newTopic.id);
      onTopicCreated(fullNewTopic);
      onClose();

    } catch (error) {
      console.error("Failed to create topic:", error);
      alert("Error: " + error.message);
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
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">Create New Topic</h3>
            <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full"><HiOutlineX /></button>
          </div>
          <div className="space-y-4">
            <input type="text" placeholder="Topic Title (e.g., React Hooks)" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-3 border rounded-lg" autoFocus />
            <textarea placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} rows="3" className="w-full p-3 border rounded-lg" />
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={attachFile} onChange={e => setAttachFile(e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
              <span>Attach a document</span>
            </label>

            {attachFile && (
              <div className="p-4 border-t space-y-3">
                <input type="text" placeholder="Material title" value={fileTitle} onChange={e => setFileTitle(e.target.value)} className="w-full p-3 border rounded-lg" />
                <input type="file" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                {isProcessing && <p className="text-sm text-yellow-600">Processing file...</p>}
                {extractedText && <p className="text-sm text-green-600 p-2 bg-green-50 rounded-md">✓ Text extracted</p>}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button onClick={onClose} className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={handleCreate} disabled={!title.trim() || loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Creating...' : 'Create Topic'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const DeleteConfirmationModal = ({ topicName, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);
  
  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  }

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
        className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
      >
        <div className="flex items-start">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <HiOutlineExclamation className="h-6 w-6 text-red-600" />
          </div>
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Topic</h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">Are you sure you want to delete "<strong>{topicName}</strong>"? This will permanently remove all associated materials and tasks. This action cannot be undone.</p>
            </div>
          </div>
        </div>
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <button onClick={handleConfirm} disabled={loading} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
            {loading ? 'Deleting...' : 'Delete'}
          </button>
          <button onClick={onClose} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm">
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}; 