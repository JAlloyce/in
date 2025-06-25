import React, { useState } from 'react';
import { HiOutlinePlus, HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineShare, HiOutlineChevronDown, HiOutlineChevronUp } from 'react-icons/hi';

export default function CalendarPanel({ onShareContent }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isScheduleVisible, setIsScheduleVisible] = useState(false);
  const [events, setEvents] = useState([
    { id: 1, date: new Date(2023, 9, 15), title: "Calculus Exam", type: "exam", completed: true },
    { id: 2, date: new Date(2023, 9, 17), title: "Physics Lab Report Due", type: "assignment", completed: false },
    { id: 3, date: new Date(2023, 9, 20), title: "Group Study Session", type: "study", completed: false },
    { id: 4, date: new Date(2023, 9, 22), title: "AI Assistant: Review Progress", type: "ai", completed: false },
  ]);
  
  const [newEvent, setNewEvent] = useState({ title: "", date: "", type: "study" });
  const [showAddEvent, setShowAddEvent] = useState(false);

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const addEvent = () => {
    if (newEvent.title && newEvent.date) {
      const newEventObj = {
        id: Date.now(),
        title: newEvent.title,
        date: new Date(newEvent.date),
        type: newEvent.type,
        completed: false
      };
      setEvents([...events, newEventObj]);
      setNewEvent({ title: "", date: "", type: "study" });
      setShowAddEvent(false);
    }
  };

  const toggleEventCompletion = (id) => {
    setEvents(events.map(event => 
      event.id === id ? { ...event, completed: !event.completed } : event
    ));
  };

  const getEventsForDay = (day) => {
    return events.filter(event => 
      event.date.getDate() === day &&
      event.date.getMonth() === currentDate.getMonth() &&
      event.date.getFullYear() === currentDate.getFullYear()
    );
  };

  const getTypeClass = (type) => {
    switch(type) {
      case "exam": return "bg-red-100 text-red-800";
      case "assignment": return "bg-blue-100 text-blue-800";
      case "study": return "bg-green-100 text-green-800";
      case "ai": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const weeks = [];
    let days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-1 lg:p-2 border h-16 lg:h-24"></div>);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDay(day);
      const isToday = new Date().getDate() === day && 
                      new Date().getMonth() === month && 
                      new Date().getFullYear() === year;
      
      days.push(
        <div 
          key={`day-${day}`} 
          className={`p-1 lg:p-2 border h-16 lg:h-24 ${isToday ? 'bg-blue-50' : ''}`}
        >
          <div className="flex justify-between">
            <span className={`text-sm lg:text-base font-medium ${isToday ? 'text-blue-600' : ''}`}>{day}</span>
          </div>
          <div className="mt-1 space-y-1 max-h-10 lg:max-h-16 overflow-y-auto">
            {dayEvents.map(event => (
              <div 
                key={event.id} 
                className={`text-xs px-1 lg:px-2 py-1 rounded truncate ${getTypeClass(event.type)} flex items-center`}
              >
                <input 
                  type="checkbox" 
                  checked={event.completed}
                  onChange={() => toggleEventCompletion(event.id)}
                  className="mr-1 w-3 h-3"
                />
                <span className={`${event.completed ? 'line-through' : ''} text-xs`}>
                  {event.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
      
      // Start a new row every 7 days
      if ((firstDay + day) % 7 === 0 || day === daysInMonth) {
        weeks.push(
          <div key={`week-${day}`} className="grid grid-cols-7">
            {days}
          </div>
        );
        days = [];
      }
    }
    
    return weeks;
  };

  const handleShareCalendar = () => {
    onShareContent({
      id: "calendar-view",
      type: 'calendar',
      title: `Study Calendar - ${currentDate.toLocaleString('default', { month: 'long' })} ${currentDate.getFullYear()}`,
      content: events
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 lg:p-4 bg-white border-b">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-2 lg:space-y-0">
          <h2 className="text-lg lg:text-xl font-bold">Study Calendar</h2>
          <div className="flex flex-wrap gap-2">
            <button 
              className="bg-gray-100 px-3 py-2 rounded-lg flex items-center text-sm"
              onClick={() => setIsScheduleVisible(!isScheduleVisible)}
            >
              {isScheduleVisible ? <HiOutlineChevronUp className="mr-1" /> : <HiOutlineChevronDown className="mr-1" />}
              Schedule
            </button>
            <button 
              className="bg-gray-100 px-3 py-1 lg:py-2 rounded-lg flex items-center text-sm"
              onClick={handleShareCalendar}
            >
              <HiOutlineShare className="mr-1" />
              Share
            </button>
            <button 
              className="bg-blue-600 text-white px-3 py-1 lg:py-2 rounded-lg flex items-center text-sm"
              onClick={() => setShowAddEvent(true)}
            >
              <HiOutlinePlus className="mr-1" />
              <span className="hidden sm:inline">Add Event</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </div>
      
      {isScheduleVisible && (
        <div className="p-3 lg:p-4 bg-blue-50 border-b">
          <h3 className="font-semibold text-blue-800 mb-2">Weekly Schedule Overview</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
            <div className="bg-white rounded-lg p-3">
              <p className="font-medium text-blue-600">Monday & Wednesday</p>
              <p className="text-gray-600">Calculus: 9:00 AM - 11:00 AM</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="font-medium text-green-600">Tuesday & Thursday</p>
              <p className="text-gray-600">Physics: 1:00 PM - 3:00 PM</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="font-medium text-purple-600">Friday</p>
              <p className="text-gray-600">Lab Sessions & Review</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-auto p-2 lg:p-4 space-y-4">
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="p-3 lg:p-4 flex justify-between items-center">
              <button 
                className="p-2 rounded-full hover:bg-gray-100"
                onClick={prevMonth}
              >
                <HiOutlineChevronLeft className="w-4 h-4 lg:w-5 lg:h-5" />
              </button>
              <h3 className="text-base lg:text-lg font-bold">
                {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
              </h3>
              <button 
                className="p-2 rounded-full hover:bg-gray-100"
                onClick={nextMonth}
              >
                <HiOutlineChevronRight className="w-4 h-4 lg:w-5 lg:h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-7 bg-gray-100 border-t border-l">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-1 lg:p-2 text-center text-xs lg:text-sm font-medium border-r border-b">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="border-l border-r">
              {renderCalendar()}
            </div>
          </div>
        </div>
        
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <h3 className="font-bold mb-3">Schedule Image</h3>
          <div className="border-2 border-dashed rounded-lg h-64 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <p className="text-gray-500 mb-2">Upload your timetable image</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                Upload Image
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {showAddEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 lg:p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Add New Event</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Event Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter event title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="study">Study Session</option>
                  <option value="exam">Exam</option>
                  <option value="assignment">Assignment</option>
                  <option value="ai">AI Assistant</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddEvent(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addEvent}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}