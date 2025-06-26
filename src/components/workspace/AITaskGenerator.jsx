import React, { useState } from 'react';
import { 
  HiOutlineX, 
  HiOutlineRefresh, 
  HiOutlineCheckCircle, 
  HiOutlineClipboardList,
  HiOutlineBookOpen,
  HiOutlineLightBulb
} from 'react-icons/hi';
import perplexityService from '../../services/perplexity';

const AITaskGenerator = ({ topic, onTasksGenerated, onClose }) => {
  const [activeTab, setActiveTab] = useState('complete');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState({
    objectives: [],
    tasks: [],
    resources: [],
    complete: null
  });

  // Generate complete learning package (all content at once)
  const generateCompletePackage = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Get topic context and materials
      const materials = topic.materials?.map(m => `${m.title} (${m.type})`).join(', ') || '';
      const context = `${topic.description || ''} ${materials ? `Available materials: ${materials}` : ''}`;

      const response = await perplexityService.generateCompleteLearningPackage(
        topic.title,
        context,
        materials
      );

      if (response.success) {
        const content = response.content;
        
        // Parse the comprehensive response
        const parsedResults = parseComprehensiveResponse(content);
        
        setResults({
          objectives: parsedResults.objectives,
          tasks: parsedResults.tasks,
          resources: parsedResults.resources,
          complete: {
            content: content,
            citations: response.citations || []
          }
        });
      } else {
        setError(response.error || 'Failed to generate learning content');
      }
    } catch (err) {
      setError('An error occurred while generating content');
      console.error('AI Generation Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Parse the comprehensive AI response into structured data
  const parseComprehensiveResponse = (content) => {
    const objectives = [];
    const tasks = [];
    const resources = [];
    
    const lines = content.split('\n');
    let currentSection = '';
    let currentItem = {};
    
    lines.forEach(line => {
      const trimmed = line.trim();
      
      // Detect sections
      if (trimmed.toLowerCase().includes('learning objectives') || trimmed.toLowerCase().includes('objectives')) {
        currentSection = 'objectives';
        return;
      }
      if (trimmed.toLowerCase().includes('study tasks') || trimmed.toLowerCase().includes('tasks')) {
        currentSection = 'tasks';
        return;
      }
      if (trimmed.toLowerCase().includes('resources') || trimmed.toLowerCase().includes('materials')) {
        currentSection = 'resources';
        return;
      }
      
      // Parse content based on current section
      if (trimmed.length > 10) {
        if (currentSection === 'objectives' && (trimmed.match(/^\d+\./) || trimmed.startsWith('-') || trimmed.startsWith('*'))) {
          const objective = trimmed.replace(/^\d+\.|\-|\*/, '').trim();
          if (objective.length > 5) {
            objectives.push(objective);
          }
        }
        
        if (currentSection === 'tasks' && (trimmed.match(/^\d+\./) || trimmed.startsWith('-') || trimmed.startsWith('*'))) {
          const taskText = trimmed.replace(/^\d+\.|\-|\*/, '').trim();
          if (taskText.length > 5) {
            // Extract time estimates and priorities from text
            const timeMatch = taskText.match(/(\d+)\s*(hour|hr|min)/i);
            const priorityMatch = taskText.match(/(high|medium|low)\s*priority/i);
            
            tasks.push({
              title: taskText.split(':')[0] || taskText.substring(0, 50),
              description: taskText,
              estimatedTime: timeMatch ? `${timeMatch[1]} ${timeMatch[2]}` : '30 min',
              priority: priorityMatch ? priorityMatch[1].toLowerCase() : 'medium',
              type: 'study'
            });
          }
        }
        
        if (currentSection === 'resources' && (trimmed.match(/^\d+\./) || trimmed.startsWith('-') || trimmed.startsWith('*'))) {
          const resourceText = trimmed.replace(/^\d+\.|\-|\*/, '').trim();
          if (resourceText.length > 5) {
            // Try to extract URLs
            const urlMatch = resourceText.match(/https?:\/\/[^\s)]+/);
            const typeMatch = resourceText.match(/(book|course|video|website|tool|app)/i);
            
            resources.push({
              title: resourceText.split(':')[0] || resourceText.split('(')[0] || resourceText.substring(0, 50),
              description: resourceText,
              type: typeMatch ? typeMatch[1].toLowerCase() : 'resource',
              level: 'intermediate',
              url: urlMatch ? urlMatch[0] : null
            });
          }
        }
      }
    });
    
    // Fallback parsing if structured parsing fails
    if (objectives.length === 0 && tasks.length === 0 && resources.length === 0) {
      return parseUnstructuredResponse(content);
    }
    
    return { objectives, tasks, resources };
  };

  // Fallback parser for unstructured responses
  const parseUnstructuredResponse = (content) => {
    const lines = content.split('\n').filter(line => line.trim().length > 10);
    
    return {
      objectives: lines.slice(0, 5).map(line => line.trim()),
      tasks: lines.slice(5, 15).map((line, index) => ({
        title: `Task ${index + 1}`,
        description: line.trim(),
        estimatedTime: '30 min',
        priority: 'medium',
        type: 'study'
      })),
      resources: lines.slice(15, 25).map((line, index) => ({
        title: `Resource ${index + 1}`,
        description: line.trim(),
        type: 'resource',
        level: 'intermediate'
      }))
    };
  };

  // Individual generators (using existing methods)
  const generateObjectives = async () => {
    setLoading(true);
    setError('');
    
    try {
      const context = topic.description || '';
      const response = await perplexityService.generateLearningObjectives(topic.title, context);
      
      if (response.success) {
        const objectivesList = response.content.split('\n')
          .filter(line => line.trim().length > 10 && (line.includes('-') || line.match(/^\d+\./)))
          .map(line => line.replace(/^\d+\.|\-/, '').trim())
          .slice(0, 7);
        
        setResults(prev => ({ ...prev, objectives: objectivesList }));
      } else {
        setError(response.error || 'Failed to generate objectives');
      }
    } catch (err) {
      setError('An error occurred while generating objectives');
    } finally {
      setLoading(false);
    }
  };

  const generateTasks = async () => {
    setLoading(true);
    setError('');
    
    try {
      const objectives = results.objectives.join('\n');
      const materials = topic.materials?.map(m => `${m.title} (${m.type})`).join(', ') || '';
      
      const response = await perplexityService.generateStudyTasks(topic.title, objectives, materials);
      
      if (response.success) {
        const tasksList = response.content.split('\n')
          .filter(line => line.trim().length > 10 && (line.includes('-') || line.match(/^\d+\./)))
          .map((line, index) => {
            const taskText = line.replace(/^\d+\.|\-/, '').trim();
            const timeMatch = taskText.match(/(\d+)\s*(hour|hr|min)/i);
            
            return {
              title: taskText.split(':')[0] || `Task ${index + 1}`,
              description: taskText,
              estimatedTime: timeMatch ? `${timeMatch[1]} ${timeMatch[2]}` : '45 min',
              priority: index < 3 ? 'high' : index < 7 ? 'medium' : 'low',
              type: 'study'
            };
          })
          .slice(0, 12);
        
        setResults(prev => ({ ...prev, tasks: tasksList }));
      } else {
        setError(response.error || 'Failed to generate tasks');
      }
    } catch (err) {
      setError('An error occurred while generating tasks');
    } finally {
      setLoading(false);
    }
  };

  const generateResources = async () => {
    setLoading(true);
    setError('');
    
    try {
      const materials = topic.materials?.map(m => `${m.title} (${m.type})`).join(', ') || '';
      
      const response = await perplexityService.generateContentSuggestions(topic.title, materials);
      
      if (response.success) {
        const resourcesList = response.content.split('\n')
          .filter(line => line.trim().length > 10 && (line.includes('-') || line.match(/^\d+\./)))
          .map((line, index) => {
            const resourceText = line.replace(/^\d+\.|\-/, '').trim();
            const urlMatch = resourceText.match(/https?:\/\/[^\s)]+/);
            const typeMatch = resourceText.match(/(book|course|video|website|tool|app)/i);
            
            return {
              title: resourceText.split(':')[0] || resourceText.split('(')[0] || `Resource ${index + 1}`,
              description: resourceText,
              type: typeMatch ? typeMatch[1].toLowerCase() : 'resource',
              level: index < 3 ? 'beginner' : index < 7 ? 'intermediate' : 'advanced',
              url: urlMatch ? urlMatch[0] : null
            };
          })
          .slice(0, 10);
        
        setResults(prev => ({ ...prev, resources: resourcesList }));
      } else {
        setError(response.error || 'Failed to generate resources');
      }
    } catch (err) {
      setError('An error occurred while generating resources');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTasks = () => {
    const allContent = {
      objectives: results.objectives,
      tasks: results.tasks,
      resources: results.resources,
      complete: results.complete
    };
    
    onTasksGenerated(allContent);
    onClose();
  };

  const hasResults = results.objectives.length > 0 || results.tasks.length > 0 || results.resources.length > 0 || results.complete;

  const tabs = [
    { id: 'complete', label: 'Complete Package', icon: HiOutlineLightBulb },
    { id: 'objectives', label: 'Objectives', icon: HiOutlineCheckCircle },
    { id: 'tasks', label: 'Tasks', icon: HiOutlineClipboardList },
    { id: 'resources', label: 'Resources', icon: HiOutlineBookOpen }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">AI Learning Assistant</h2>
              <p className="text-purple-100 mt-1">Generate comprehensive learning content for: {topic.title}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <HiOutlineX className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`px-6 py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                  {((tab.id === 'objectives' && results.objectives.length > 0) ||
                    (tab.id === 'tasks' && results.tasks.length > 0) ||
                    (tab.id === 'resources' && results.resources.length > 0) ||
                    (tab.id === 'complete' && results.complete)) && (
                    <span className="ml-2 w-2 h-2 bg-green-500 rounded-full"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6 max-h-96 overflow-y-auto">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {activeTab === 'complete' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Complete Learning Package</h3>
                <button
                  className={`px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={generateCompletePackage}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Generating Complete Package...
                    </>
                  ) : (
                    <>
                      <HiOutlineLightBulb className="mr-2" />
                      Generate Complete Package
                    </>
                  )}
                </button>
              </div>

              {results.complete ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                    <h4 className="font-semibold text-gray-900 mb-2">AI-Generated Learning Plan</h4>
                    <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-64 overflow-y-auto">
                      {results.complete.content}
                    </div>
                    {results.complete.citations?.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs font-medium text-gray-600 mb-2">Sources:</p>
                        <div className="space-y-1">
                          {results.complete.citations.slice(0, 3).map((citation, index) => (
                            <a
                              key={index}
                              href={citation}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800 block truncate"
                            >
                              {citation}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <h5 className="font-medium text-green-800">Objectives</h5>
                      <p className="text-sm text-green-600">{results.objectives.length} generated</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <h5 className="font-medium text-blue-800">Tasks</h5>
                      <p className="text-sm text-blue-600">{results.tasks.length} generated</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <h5 className="font-medium text-purple-800">Resources</h5>
                      <p className="text-sm text-purple-600">{results.resources.length} generated</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <HiOutlineLightBulb className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">Generate Complete Learning Package</p>
                  <p>Get objectives, tasks, and resources all at once with our AI assistant</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'objectives' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Learning Objectives</h3>
                <button
                  className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={generateObjectives}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <HiOutlineRefresh className="mr-2" />
                      Generate Objectives
                    </>
                  )}
                </button>
              </div>

              {results.objectives.length > 0 ? (
                <div className="space-y-3">
                  {results.objectives.map((objective, index) => (
                    <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                      <HiOutlineCheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-800">{objective}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <HiOutlineLightBulb className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Click "Generate Objectives" to create AI-powered learning goals</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tasks' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Study Tasks</h3>
                <button
                  className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={generateTasks}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <HiOutlineRefresh className="mr-2" />
                      Generate Tasks
                    </>
                  )}
                </button>
              </div>

              {results.tasks.length > 0 ? (
                <div className="space-y-3">
                  {results.tasks.map((task, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">{task.title}</h4>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {task.estimatedTime}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{task.description}</p>
                      <div className="mt-2 flex items-center">
                        <span className={`text-xs px-2 py-1 rounded ${
                          task.priority === 'high' ? 'bg-red-100 text-red-800' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority} priority
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <HiOutlineClipboardList className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Click "Generate Tasks" to create a detailed study plan</p>
                  {results.objectives.length > 0 && (
                    <p className="text-sm mt-2">Tasks will be based on your generated objectives</p>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'resources' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Learning Resources</h3>
                <button
                  className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={generateResources}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <HiOutlineRefresh className="mr-2" />
                      Find Resources
                    </>
                  )}
                </button>
              </div>

              {results.resources.length > 0 ? (
                <div className="space-y-3">
                  {results.resources.map((resource, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">{resource.title}</h4>
                        <div className="flex space-x-2">
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded capitalize">
                            {resource.type}
                          </span>
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded capitalize">
                            {resource.level}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{resource.description}</p>
                      {resource.url && (
                        <div className="mt-2">
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 underline"
                          >
                            Visit Resource →
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <HiOutlineBookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Click "Find Resources" to get curated learning materials</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-between">
          <div className="text-sm text-gray-500">
            Powered by Perplexity AI • {results.objectives.length + results.tasks.length + results.resources.length} items generated
          </div>
          <div className="flex space-x-3">
            <button
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                !hasResults ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={handleApplyTasks}
              disabled={!hasResults}
            >
              Apply Generated Content
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITaskGenerator; 