import React, { useState, useRef, useEffect } from 'react';
import { Camera, Loader2, CheckCircle2, MicOff, Mic } from 'lucide-react';

const SwingVideoPlayer = ({ onAnalyze, isAnalyzing }) => {
  const [streamActive, setStreamActive] = useState(false);
  const [statusText, setStatusText] = useState("等待啟動相機...");
  const [micEnabled, setMicEnabled] = useState(true);
  
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const isTriggeredRef = useRef(false);

  // Buffer configuration
  const MAX_CHUNKS = 10; // keep last 10 chunks
  const CHUNK_MS = 300;  // 300ms per chunk (approx 3 seconds total buffer)
  const AUDIO_THRESHOLD = 120; // Lowered to 120 for easier triggering

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Try to use back camera on mobile
        audio: true // Need audio for impact detection
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setStreamActive(true);
      setStatusText("🟢 準備就緒，請擊球！");
      
      setupRecording(stream);
      setupAudioTrigger(stream);
    } catch (err) {
      console.error("無法存取相機或麥克風", err);
      setStatusText("❌ 無法存取相機，請允許權限");
    }
  };

  const setupRecording = (stream) => {
    mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm' });
    
    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
        if (chunksRef.current.length > MAX_CHUNKS) {
          chunksRef.current.shift(); // Keep rolling buffer
        }
      }
    };
    
    // Start recording, pushing data every CHUNK_MS
    mediaRecorderRef.current.start(CHUNK_MS);
  };

  const setupAudioTrigger = (stream) => {
    // Only setup audio detection if mic is enabled (in case user wants to test manually)
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContextRef.current.createMediaStreamSource(stream);
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 256;
    source.connect(analyserRef.current);
    
    checkAudioLevel();
  };

  const checkAudioLevel = () => {
    if (isTriggeredRef.current || !streamRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    // Simple peak detection: check max volume
    const maxVolume = Math.max(...dataArray);
    
    if (maxVolume > AUDIO_THRESHOLD && micEnabled) {
      triggerHit();
    } else {
      requestAnimationFrame(checkAudioLevel);
    }
  };

  const triggerHit = () => {
    if (isTriggeredRef.current || isAnalyzing) return;
    isTriggeredRef.current = true;
    setStatusText("⚡ 偵測到擊球！擷取影像中...");
    
    // Wait a brief moment to capture the follow-through, then analyze
    setTimeout(() => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.requestData(); // Get final chunk
        
        setTimeout(() => {
          // Create video blob from the rolling buffer
          const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' });
          // Reset buffer
          chunksRef.current = [];
          
          setStatusText("⚙️ AI 極速分析中...");
          // We only have one video now (the single live camera)
          onAnalyze(videoBlob);
          
          // Reset trigger after analysis starts
          setTimeout(() => {
            isTriggeredRef.current = false;
            if (!isAnalyzing) setStatusText("🟢 準備就緒，請擊球！");
            checkAudioLevel(); // Restart listening
          }, 3000);
        }, 100);
      }
    }, 800); // Wait 800ms after sound to capture ball flight
  };

  // Manual trigger for testing
  const manualTrigger = () => {
    if (!isTriggeredRef.current) {
      triggerHit();
    }
  };

  const [showGrid, setShowGrid] = useState(true);

  // ... (keep existing methods, just update the return statement)

  // Cleanup
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className="panel video" style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
      
      {/* Live Video Feed */}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted // Mute the local video element so we don't hear feedback
        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
      />
      
      {/* Alignment Grid Overlay */}
      {streamActive && showGrid && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          pointerEvents: 'none', zIndex: 5,
          display: 'flex', alignItems: 'center', justifyItems: 'center'
        }}>
          {/* Vertical Center Line */}
          <div style={{ position: 'absolute', left: '50%', top: '10%', bottom: '10%', borderLeft: '2px dashed rgba(255,255,255,0.4)' }}></div>
          {/* Horizontal Center Line */}
          <div style={{ position: 'absolute', top: '50%', left: '10%', right: '10%', borderTop: '2px dashed rgba(255,255,255,0.4)' }}></div>
          {/* Target Box (Ball position suggestion) */}
          <div style={{ position: 'absolute', left: '50%', top: '75%', width: '40px', height: '40px', border: '2px solid rgba(255,107,0,0.5)', transform: 'translate(-50%, -50%)', borderRadius: '50%' }}></div>
        </div>
      )}
      
      {/* Overlay UI */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: streamActive ? 'transparent' : 'rgba(0,0,0,0.8)',
        zIndex: 10, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
      }}>
        
        {/* Top Status Bar */}
        <div style={{
          padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)'
        }}>
          <div style={{
            backgroundColor: 'rgba(0,0,0,0.6)', padding: '8px 16px', borderRadius: '20px',
            color: '#fff', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px',
            border: isTriggeredRef.current ? '1px solid #ff6b00' : '1px solid #444'
          }}>
            {isAnalyzing ? <Loader2 size={16} className="animate-spin" color="#ff6b00" /> : 
             isTriggeredRef.current ? <CheckCircle2 size={16} color="#ff6b00" /> :
             <div style={{width: 8, height: 8, borderRadius: '50%', backgroundColor: streamActive ? '#4ade80' : '#888'}}></div>}
            {statusText}
          </div>
          
          {streamActive && (
             <div style={{ display: 'flex', gap: '10px' }}>
               <button 
                  onClick={() => setShowGrid(!showGrid)}
                  style={{
                    background: 'rgba(0,0,0,0.6)', border: 'none', padding: '8px 12px', borderRadius: '20px', cursor: 'pointer',
                    color: showGrid ? '#fff' : '#888', fontSize: '12px'
                  }}
               >
                 {showGrid ? '關閉格線' : '顯示格線'}
               </button>
               <button 
                  onClick={() => setMicEnabled(!micEnabled)}
                  style={{
                    background: 'rgba(0,0,0,0.6)', border: 'none', padding: '8px', borderRadius: '50%', cursor: 'pointer',
                    color: micEnabled ? '#4ade80' : '#ff4444'
                  }}
               >
                 {micEnabled ? <Mic size={20} /> : <MicOff size={20} />}
               </button>
             </div>
          )}
        </div>

        {/* Start / Manual Button */}
        <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
          {!streamActive ? (
            <button 
              onClick={startCamera}
              style={{
                padding: '14px 32px', borderRadius: '30px', backgroundColor: '#ff6b00',
                color: '#fff', border: 'none', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '10px'
              }}
            >
              <Camera size={20} /> 開啟手機即時攝影
            </button>
          ) : (
            <button 
              onClick={manualTrigger}
              disabled={isAnalyzing || isTriggeredRef.current}
              style={{
                padding: '10px 24px', borderRadius: '8px', backgroundColor: 'rgba(255,107,0,0.8)',
                color: '#fff', border: 'none', fontSize: '14px', cursor: 'pointer',
                opacity: (isAnalyzing || isTriggeredRef.current) ? 0.5 : 1
              }}
            >
              強制手動測試擊球
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default SwingVideoPlayer;
