import React, { useState } from 'react';
import { HiOutlinePlus, HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineShare } from 'react-icons/hi';

export default function CalendarPanel({ onShareContent }) {
  const [currentDate, setCurrentDate] = useState(new Date());
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
      days.push(<div key={`empty-${i}`} className="p-2 border h-24"></div>);
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
          className={`p-2 border h-24 ${isToday ? 'bg-blue-50' : ''}`}
        >
          <div className="flex justify-between">
            <span className={`font-medium ${isToday ? 'text-blue-600' : ''}`}>{day}</span>
          </div>
          <div className="mt-1 space-y-1 max-h-16 overflow-y-auto">
            {dayEvents.map(event => (
              <div 
                key={event.id} 
                className={`text-xs px-2 py-1 rounded truncate ${getTypeClass(event.type)} flex items-center`}
              >
                <input 
                  type="checkbox" 
                  checked={event.completed}
                  onChange={() => toggleEventCompletion(event.id)}
                  className="mr-1"
                />
                <span className={event.completed ? 'line-through' : ''}>
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
      <div className="p-4 bg-white border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Study Calendar</h2>
          <div className="flex space-x-2">
            <button 
              className="bg-gray-100 px-3 py-1 rounded-lg flex items-center"
              onClick={handleShareCalendar}
            >
              <HiOutlineShare className="mr-1" />
              Share
            </button>
            <button 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
              onClick={() => setShowAddEvent(true)}
            >
              <HiOutlinePlus className="mr-1" />
              <span>Add Event</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4 space-y-4">
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="p-4 flex justify-between items-center">
              <button 
                className="p-2 rounded-full hover:bg-gray-100"
                onClick={prevMonth}
              >
                <HiOutlineChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-bold">
                {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
              </h3>
              <button 
                className="p-2 rounded-full hover:bg-gray-100"
                onClick={nextMonth}
              >
                <HiOutlineChevronRight className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-7 bg-gray-100 border-t border-l">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center font-medium border-r border-b">
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
      
      {/* Add Event Modal */}
      {showAddEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Add New Event</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Event Title</label>
              <input
                type="text"
                value={newEvent.title}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                placeholder="Enter event title"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={newEvent.type}
                onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="study">Study Session</option>
                <option value="assignment">Assignment</option>
                <option value="exam">Exam</option>
                <option value="ai">AI Session</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <button 
                className="px-4 py-2 border rounded-lg"
                onClick={() => setShowAddEvent(false)}
              >
                Cancel
              </button>
              <button 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                onClick={addEvent}
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