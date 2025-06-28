import React, { useState, useRef } from 'react'
import { HiMicrophone, HiPlay, HiPause } from 'react-icons/hi'

export function VoiceRecorder({ onSend }) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const mediaRecorderRef = useRef(null)
  const audioRef = useRef(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      
      const chunks = []
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data)
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' })
        setAudioBlob(blob)
      }
      
      mediaRecorder.start()
      setIsRecording(true)
      
      // Start timer
      const timer = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
      setTimeout(() => clearInterval(timer), 60000) // Max 1 minute
    } catch (err) {
      console.error('Error accessing microphone:', err)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setRecordingTime(0)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
      {!audioBlob ? (
        <>
          <button
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            className={`p-3 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${
              isRecording 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            <HiMicrophone className="w-6 h-6" />
          </button>
          
          {isRecording && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-mono">{formatTime(recordingTime)}</span>
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-red-500 rounded-full animate-pulse"
                    style={{ 
                      height: `${Math.random() * 20 + 10}px`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center space-x-2 flex-1">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 bg-blue-500 text-white rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            {isPlaying ? <HiPause className="w-5 h-5" /> : <HiPlay className="w-5 h-5" />}
          </button>
          
          <div className="flex-1 h-8 bg-gray-200 rounded-full flex items-center px-2">
            <div className="w-full h-1 bg-blue-500 rounded-full" style={{ width: '60%' }} />
          </div>
          
          <button
            onClick={() => onSend(audioBlob)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 min-h-[44px]"
          >
            Send
          </button>
        </div>
      )}
    </div>
  )
} 