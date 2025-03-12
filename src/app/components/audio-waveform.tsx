"use client"

import { useEffect, useRef } from "react"

interface AudioWaveformProps {
  isRecording: boolean
  stream?: MediaStream | null
  maxDuration?: number // in seconds
  onMaxDurationReached?: () => void
}

export function AudioWaveform({ 
  isRecording, 
  stream, 
  maxDuration = 300, // 5 minutes default
  onMaxDurationReached 
}: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const analyserRef = useRef<AnalyserNode>()
  const dataArrayRef = useRef<Uint8Array>()
  const elapsedTimeRef = useRef(0)
  
  // Track time for max duration check without re-rendering
  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (isRecording) {
      elapsedTimeRef.current = 0
      interval = setInterval(() => {
        elapsedTimeRef.current += 1
        
        if (elapsedTimeRef.current >= maxDuration && onMaxDurationReached) {
          onMaxDurationReached()
        }
      }, 1000)
    }
    
    return () => clearInterval(interval)
  }, [isRecording, maxDuration, onMaxDurationReached])

  useEffect(() => {
    if (!isRecording || !stream) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      return
    }

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const analyser = audioContext.createAnalyser()
    analyserRef.current = analyser
    analyser.fftSize = 256
    
    const source = audioContext.createMediaStreamSource(stream)
    source.connect(analyser)
    
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    dataArrayRef.current = dataArray
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const canvasCtx = canvas.getContext('2d')
    if (!canvasCtx) return
    
    const draw = () => {
      if (!isRecording) return
      
      animationRef.current = requestAnimationFrame(draw)
      
      analyser.getByteFrequencyData(dataArray)
      
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Modern bar visualization
      const barWidth = (canvas.width / bufferLength) * 2.5
      let x = 0
      
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height
        
        // Create gradient for bars
        const gradient = canvasCtx.createLinearGradient(0, canvas.height, 0, 0)
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.5)') // blue-500 with transparency
        gradient.addColorStop(1, 'rgba(79, 70, 229, 0.8)') // indigo-600 with transparency
        
        canvasCtx.fillStyle = gradient
        canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)
        
        x += barWidth + 1
      }
    }
    
    draw()
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (audioContext.state !== 'closed') {
        source.disconnect()
        audioContext.close()
      }
    }
  }, [isRecording, stream])
  
  return (
    <div className="w-full h-16 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden relative mb-2">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
        width={300}
        height={64}
      />
      {/* Progress bar at the bottom of the waveform */}
      <div 
        className="absolute bottom-0 left-0 h-1 bg-blue-600 transition-all duration-300 ease-in-out"
        style={{ 
          width: `${(elapsedTimeRef.current / maxDuration) * 100}%`,
        }}
      />
    </div>
  )
} 