import React, { useState, useEffect } from 'react';
import { HiOutlineCalendar, HiOutlineChartBar, HiOutlineClock } from 'react-icons/hi';
import workspaceService from '../../services/workspace';

export default function CalendarPanel() {
  const [activityData, setActivityData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [hoveredDate, setHoveredDate] = useState(null);
  const [totalActivities, setTotalActivities] = useState(0);

  useEffect(() => {
    loadActivityData();
  }, []);

  const loadActivityData = async () => {
    try {
      setLoading(true);
      const analytics = await workspaceService.getActivityAnalytics(365); // Full year
      
      // Process data for heatmap
      const processedData = processActivityForHeatmap(analytics.dailyActivity);
      setActivityData(processedData);
      setTotalActivities(analytics.totalActivities);
    } catch (error) {
      console.error('Error loading activity data:', error);
      setActivityData({});
    } finally {
      setLoading(false);
    }
  };

  const processActivityForHeatmap = (dailyActivity) => {
    const data = {};
    const today = new Date();
    const yearAgo = new Date(today);
    yearAgo.setDate(today.getDate() - 365);

    // Create data for last 365 days
    for (let d = new Date(yearAgo); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toDateString();
      data[dateStr] = dailyActivity[dateStr] || 0;
    }

    return data;
  };

  const getActivityLevel = (count) => {
    if (count === 0) return 'none';
    if (count <= 2) return 'low';
    if (count <= 5) return 'medium';
    if (count <= 10) return 'high';
    return 'very-high';
  };

  const getActivityColor = (level) => {
    const colors = {
      'none': 'bg-gray-100 dark:bg-gray-800',
      'low': 'bg-blue-200 dark:bg-blue-900',      // Lightest Blue
      'medium': 'bg-blue-400 dark:bg-blue-700',   // Medium Blue
      'high': 'bg-blue-600 dark:bg-blue-500',     // Darker Blue
      'very-high': 'bg-blue-800 dark:bg-blue-300' // Deepest Blue
    };
    return colors[level] || colors.none;
  };

  const renderActivityGrid = () => {
    const weeks = [];
    const dates = Object.keys(activityData).sort((a, b) => new Date(a) - new Date(b));
    
    // Group dates by weeks (starting Monday)
    let currentWeek = [];
    dates.forEach((dateStr, index) => {
      const date = new Date(dateStr);
      const dayOfWeek = (date.getDay() + 6) % 7; // Monday = 0, Sunday = 6
      
      // If it's Monday or first date, start new week
      if (dayOfWeek === 0 || index === 0) {
        if (currentWeek.length > 0) {
          weeks.push([...currentWeek]);
        }
        currentWeek = [];
      }
      
      currentWeek.push({ date: dateStr, count: activityData[dateStr] });
      
      // If it's the last date, push the week
      if (index === dates.length - 1) {
        weeks.push(currentWeek);
      }
    });

    return (
      <div className="flex flex-col gap-1">
        {/* Month labels */}
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => (
            <span key={month}>{month}</span>
          ))}
        </div>
        
        {/* Activity grid */}
        <div className="flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col gap-1 mr-2">
            <div className="h-3"></div> {/* Spacer for month labels */}
            {['Mon', 'Wed', 'Fri'].map((day, index) => (
              <div key={day} className="text-xs text-gray-500 h-3 flex items-center">
                {index % 2 === 0 ? day : ''}
              </div>
            ))}
          </div>
          
          {/* Weeks grid */}
          <div className="flex gap-1 overflow-x-auto">
            {weeks.slice(-53).map((week, weekIndex) => ( // Show last 53 weeks
              <div key={weekIndex} className="flex flex-col gap-1">
                {Array.from({ length: 7 }, (_, dayIndex) => {
                  const dayData = week.find((_, i) => i === dayIndex);
                  if (!dayData) {
                    return <div key={dayIndex} className="w-3 h-3"></div>;
                  }
                  
                  const level = getActivityLevel(dayData.count);
                  const date = new Date(dayData.date);
                  
                  return (
                    <div
                      key={dayData.date}
                      className={`w-3 h-3 rounded-sm cursor-pointer transition-all duration-200 
                        ${getActivityColor(level)} 
                        ${hoveredDate === dayData.date ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
                        hover:ring-2 hover:ring-blue-500 hover:ring-opacity-50`}
                      onMouseEnter={() => setHoveredDate(dayData.date)}
                      onMouseLeave={() => setHoveredDate(null)}
                      onClick={() => setSelectedDate(dayData.date)}
                      title={`${dayData.count} activities on ${date.toLocaleDateString()}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
          <span>Less</span>
          <div className="flex gap-1">
            {['none', 'low', 'medium', 'high', 'very-high'].map(level => (
              <div
                key={level}
                className={`w-3 h-3 rounded-sm ${getActivityColor(level)}`}
              />
            ))}
          </div>
          <span>More</span>
        </div>
          </div>
        );
  };

  const getDateStats = () => {
    if (!hoveredDate && !selectedDate) return null;
    
    const targetDate = hoveredDate || selectedDate;
    const count = activityData[targetDate] || 0;
    const date = new Date(targetDate);

  return (
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center gap-2 text-sm">
          <HiOutlineClock className="text-blue-500" />
          <span className="font-medium">{date.toLocaleDateString()}</span>
          </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {count === 0 ? 'No learning activities' : 
           count === 1 ? '1 learning activity' : 
           `${count} learning activities`}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
            <HiOutlineChartBar className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Learning Activity
              </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {totalActivities} activities in the last year
            </p>
          </div>
        </div>
      </div>
      
      {/* Activity Heatmap */}
      <div className="flex-1 min-h-0">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 h-full overflow-auto">
          {Object.keys(activityData).length > 0 ? (
            <>
              {renderActivityGrid()}
              {getDateStats()}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <HiOutlineCalendar className="h-12 w-12 mb-3" />
              <p className="text-lg font-medium">No activity data yet</p>
              <p className="text-sm">Start learning to see your progress!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}