import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, PhoneOff, Video as VideoIcon, VideoOff, Mic, MicOff, Monitor, MessageSquare, AlertCircle, ShieldCheck } from "lucide-react";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../hooks/useAuth";

export const VideoConsultationRoom = () => {
  const { currentUser, userRole } = useAuth();
  const { incomingCall, activeCall, acceptVideoCall, endVideoCall } = useChat();
  
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [showSimulatedChart, setShowSimulatedChart] = useState(false);
  
  const selfVideoRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);

  // Incoming call ring audio effect
  useEffect(() => {
    let audio = null;
    if (incomingCall) {
      audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2142/2142-preview.mp3");
      audio.loop = true;
      audio.play().catch(e => console.error("Audio autoplay blocked:", e));
    }
    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [incomingCall]);

  // Timer when call is in-progress
  useEffect(() => {
    let timer = null;
    if (activeCall?.callStatus === "in-progress") {
      setCallDuration(0);
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeCall?.callStatus]);

  // Request media devices when active call starts
  useEffect(() => {
    if (activeCall && !isVideoOff) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          setLocalStream(stream);
          if (selfVideoRef.current) {
            selfVideoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error("Camera/Mic access denied or unavailable:", err);
        });
    }

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [activeCall, isVideoOff]);

  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = isMicMuted;
      });
    }
    setIsMicMuted(!isMicMuted);
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = isVideoOff;
      });
    }
    setIsVideoOff(!isVideoOff);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleDecline = () => {
    if (incomingCall?.id) {
      endVideoCall(incomingCall.id);
    }
  };

  const handleAccept = () => {
    if (incomingCall?.id) {
      acceptVideoCall(incomingCall.id);
    }
  };

  const handleEnd = () => {
    if (activeCall?.id) {
      endVideoCall(activeCall.id);
    }
  };

  return (
    <>
      {/* 1. Incoming Call Dialog Popup */}
      <AnimatePresence>
        {incomingCall && !activeCall && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-50 w-[380px] bg-slate-900/90 backdrop-blur-2xl border border-white/20 p-6 rounded-[2.5rem] shadow-2xl text-white flex flex-col items-center text-center ring-4 ring-primary/30 animate-pulse"
          >
            {/* Pulsing Avatar */}
            <div className="relative mb-4">
              <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
              <img
                src={incomingCall.callerPhoto || "https://ui-avatars.com/api/?name=" + encodeURIComponent(incomingCall.callerName) + "&background=random"}
                alt={incomingCall.callerName}
                className="w-20 h-20 rounded-full object-cover border-4 border-primary relative z-10 shadow-xl"
              />
            </div>

            <span className="text-xs font-black uppercase tracking-widest text-primary bg-primary/20 px-3 py-1 rounded-full mb-2">
              Incoming Video Consultation
            </span>
            <h3 className="text-2xl font-black">{incomingCall.callerName}</h3>
            <p className="text-xs text-slate-400 mt-1 mb-6">
              {incomingCall.callerModel === "doctor" ? incomingCall.hospitalName : "Patient consultation session"}
            </p>

            <div className="flex gap-4 w-full">
              <button
                onClick={handleDecline}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-red-500/30"
              >
                <PhoneOff size={20} /> Decline
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-green-500/30 animate-bounce"
              >
                <Phone size={20} /> Accept
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Active Video Consultation Room Modal */}
      <AnimatePresence>
        {activeCall && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-3xl flex flex-col overflow-hidden"
          >
            {/* Top Bar Status */}
            <header className="h-16 bg-slate-900/50 backdrop-blur-md border-b border-white/10 px-6 flex items-center justify-between shrink-0 z-20">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <span className="font-bold text-white text-sm flex items-center gap-2">
                  <ShieldCheck size={18} className="text-green-400" />
                  Secure Telehealth Session (WebRTC Encrypted)
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="bg-slate-800 text-slate-300 font-mono text-sm font-bold px-4 py-1.5 rounded-full border border-white/10">
                  {activeCall.callStatus === "in-progress" ? formatDuration(callDuration) : "Connecting..."}
                </span>
              </div>
            </header>

            {/* Main Video Area */}
            <div className="flex-1 relative flex items-center justify-center p-4 md:p-6 overflow-hidden">
              {/* Remote Participant Video Feed (Full screen background/large card) */}
              <div className="w-full h-full max-w-7xl max-h-[80vh] rounded-[2.5rem] overflow-hidden bg-slate-900 relative shadow-2xl border border-white/10 flex items-center justify-center">
                {activeCall.callStatus === "ringing" ? (
                  <div className="flex flex-col items-center text-center space-y-4 p-6">
                    <div className="relative">
                      <div className="w-28 h-28 rounded-full bg-primary/20 animate-ping absolute inset-0" />
                      <img
                        src={activeCall.callerId === currentUser?.uid ? activeCall.calleePhoto : activeCall.callerPhoto}
                        alt="Participant"
                        className="w-28 h-28 rounded-full object-cover border-4 border-primary relative z-10 shadow-2xl"
                      />
                    </div>
                    <h3 className="text-2xl font-extrabold text-white">
                      Calling {activeCall.callerId === currentUser?.uid ? activeCall.calleeName : activeCall.callerName}...
                    </h3>
                    <p className="text-slate-400 text-sm">Waiting for other participant to accept...</p>
                  </div>
                ) : (
                  <>
                    {/* Simulated High Quality Clinical Video / Remote feed */}
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
                      <img 
                        src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1600&q=80" 
                        alt="Consultation View"
                        className="w-full h-full object-cover opacity-60 filter saturate-125"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40" />

                      {/* Participant Overlay Info */}
                      <div className="absolute bottom-6 left-6 bg-slate-900/80 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/10 flex items-center gap-3">
                        <img
                          src={activeCall.callerId === currentUser?.uid ? activeCall.calleePhoto : activeCall.callerPhoto}
                          alt="Avatar"
                          className="w-10 h-10 rounded-full object-cover border border-white/20"
                        />
                        <div>
                          <p className="font-bold text-white text-sm">
                            {activeCall.callerId === currentUser?.uid ? activeCall.calleeName : activeCall.callerName}
                          </p>
                          <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            Connected
                          </span>
                        </div>
                      </div>

                      {/* Simulated Patient Chart Window if activated */}
                      {showSimulatedChart && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9, x: 20 }}
                          animate={{ opacity: 1, scale: 1, x: 0 }}
                          className="absolute top-6 right-6 w-80 bg-slate-900/90 backdrop-blur-2xl p-5 rounded-3xl border border-white/20 shadow-2xl text-white space-y-3"
                        >
                          <div className="flex justify-between items-center border-b border-white/10 pb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-primary">Clinical Overview</span>
                            <button onClick={() => setShowSimulatedChart(false)} className="text-slate-400 hover:text-white">✕</button>
                          </div>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between"><span className="text-slate-400">Blood Pressure:</span><span className="font-bold text-green-400">120/80 mmHg</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Heart Rate:</span><span className="font-bold text-blue-400">72 bpm</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Temperature:</span><span className="font-bold text-amber-400">98.6°F</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Oxygen Level:</span><span className="font-bold text-teal-400">99% Normal</span></div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </>
                )}

                {/* Picture-in-Picture Local Self Feed */}
                <motion.div
                  drag
                  dragConstraints={{ left: -500, right: 0, top: -400, bottom: 0 }}
                  className="absolute bottom-6 right-6 w-48 sm:w-64 aspect-video rounded-2xl overflow-hidden bg-slate-950 border-2 border-white/20 shadow-2xl z-30 cursor-move group"
                >
                  <video
                    ref={selfVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : 'block'}`}
                  />
                  {isVideoOff && (
                    <div className="absolute inset-0 bg-slate-900 flex items-center justify-center flex-col gap-1">
                      <VideoOff size={24} className="text-slate-500" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Camera Off</span>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white font-medium flex items-center gap-1">
                    <span>You</span>
                    {isMicMuted && <MicOff size={10} className="text-red-500" />}
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Bottom Controls Bar */}
            <footer className="h-24 bg-slate-900/60 backdrop-blur-2xl border-t border-white/10 flex items-center justify-center gap-4 md:gap-6 px-6 shrink-0 z-20">
              {/* Mic Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleMic}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors shadow-lg ${
                  isMicMuted ? "bg-red-500 text-white" : "bg-slate-800 hover:bg-slate-700 text-white"
                }`}
              >
                {isMicMuted ? <MicOff size={24} /> : <Mic size={24} />}
              </motion.button>

              {/* Video Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleVideo}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors shadow-lg ${
                  isVideoOff ? "bg-red-500 text-white" : "bg-slate-800 hover:bg-slate-700 text-white"
                }`}
              >
                {isVideoOff ? <VideoOff size={24} /> : <VideoIcon size={24} />}
              </motion.button>

              {/* Clinical Charts Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSimulatedChart(!showSimulatedChart)}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors shadow-lg ${
                  showSimulatedChart ? "bg-primary text-white" : "bg-slate-800 hover:bg-slate-700 text-white"
                }`}
              >
                <Monitor size={24} />
              </motion.button>

              {/* End Call Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleEnd}
                className="px-8 h-14 bg-red-500 hover:bg-red-600 font-bold text-white rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-red-500/20"
              >
                <PhoneOff size={24} />
                <span className="hidden sm:inline">End Consultation</span>
              </motion.button>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
