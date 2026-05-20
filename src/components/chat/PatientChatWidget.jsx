import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, ArrowLeft, Check, CheckCheck, Clock, User, Stethoscope, AlertCircle } from "lucide-react";
import { collection, query, orderBy, onSnapshot, addDoc, doc, setDoc, updateDoc, serverTimestamp, getDoc, increment } from "firebase/firestore";
import { db } from "../../firebase";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../common/Button";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export const PatientChatWidget = () => {
  const { currentUser, userRole } = useAuth();
  const { 
    isPatientChatOpen, 
    setIsPatientChatOpen, 
    selectedDoctor, 
    setSelectedDoctor, 
    patientChats, 
    unreadPatientCount,
    markPatientChatRead 
  } = useChat();
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // If user is doctor or admin, don't show patient widget
  if (userRole === "doctor" || userRole === "admin" || userRole === "super_admin") {
    return null;
  }

  const activeChatId = currentUser && selectedDoctor ? `${currentUser.uid}_${selectedDoctor.id}` : null;

  // Listen to messages for active chat
  useEffect(() => {
    if (!activeChatId) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);
    const messagesRef = collection(db, "chats", activeChatId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
      setMessages(msgs);
      setLoadingMessages(false);
      setTimeout(() => scrollToBottom(), 100);

      // Mark read when open
      if (isPatientChatOpen) {
        markPatientChatRead(activeChatId);
      }
    }, (error) => {
      console.error("Error loading messages:", error);
      setLoadingMessages(false);
    });

    return () => unsubscribe();
  }, [activeChatId, isPatientChatOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !currentUser || !selectedDoctor) return;

    const messageText = inputText.trim();
    setInputText("");

    try {
      const chatDocRef = doc(db, "chats", activeChatId);
      const chatDocSnap = await getDoc(chatDocRef);

      const messageData = {
        senderId: currentUser.uid,
        senderModel: "patient",
        text: messageText,
        timestamp: serverTimestamp()
      };

      if (!chatDocSnap.exists()) {
        // Create initial chat document
        await setDoc(chatDocRef, {
          patientId: currentUser.uid,
          patientName: currentUser.displayName || currentUser.email?.split("@")[0] || "Patient",
          patientPhoto: currentUser.photoURL || "",
          doctorId: selectedDoctor.id,
          doctorName: selectedDoctor.name || "Doctor",
          doctorPhoto: selectedDoctor.image || "",
          hospitalId: selectedDoctor.hospitalId || "",
          hospitalName: selectedDoctor.hospitalName || "Hospital",
          lastMessage: messageText,
          lastMessageTime: serverTimestamp(),
          unreadDoctor: 1,
          unreadPatient: 0,
          createdAt: serverTimestamp()
        });
      } else {
        // Update existing chat
        await updateDoc(chatDocRef, {
          lastMessage: messageText,
          lastMessageTime: serverTimestamp(),
          unreadDoctor: increment(1)
        });
      }

      // Add message to subcollection
      await addDoc(collection(db, "chats", activeChatId, "messages"), messageData);
      scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const handleSelectChat = (chat) => {
    setSelectedDoctor({
      id: chat.doctorId,
      name: chat.doctorName,
      image: chat.doctorPhoto,
      hospitalId: chat.hospitalId,
      hospitalName: chat.hospitalName
    });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (!currentUser) {
              toast("Please login to access chats", { icon: "🔒" });
              navigate("/login");
              return;
            }
            setIsPatientChatOpen(!isPatientChatOpen);
          }}
          className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-secondary text-white shadow-2xl flex items-center justify-center relative focus:outline-none ring-4 ring-primary/20 cursor-pointer"
        >
          <MessageSquare size={28} />
          {unreadPatientCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 bg-red-500 text-white font-black text-xs w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md animate-pulse"
            >
              {unreadPatientCount > 99 ? '99+' : unreadPatientCount}
            </motion.span>
          )}
        </motion.button>
      </div>

      {/* Chat Window / Drawer */}
      <AnimatePresence>
        {isPatientChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-28 right-6 w-[380px] sm:w-[420px] h-[600px] max-h-[80vh] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden z-50"
          >
            {/* Top Bar Header */}
            <div className="bg-gradient-to-r from-primary to-secondary p-5 text-white flex items-center justify-between shrink-0 shadow-lg">
              <div className="flex items-center gap-3">
                {selectedDoctor && (
                  <button
                    onClick={() => setSelectedDoctor(null)}
                    className="p-1.5 hover:bg-white/20 rounded-xl transition-colors text-white"
                  >
                    <ArrowLeft size={20} />
                  </button>
                )}
                <div>
                  <h3 className="font-extrabold text-lg leading-tight flex items-center gap-2">
                    {selectedDoctor ? selectedDoctor.name : "Healthcare Chat"}
                  </h3>
                  <p className="text-xs text-white/80 font-medium">
                    {selectedDoctor ? selectedDoctor.hospitalName : "Connect instantly with verified doctors"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPatientChatOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-xl transition-colors text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Body */}
            {!selectedDoctor ? (
              // View 1: Chat List
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-slate-900">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 pt-1">
                  Recent Conversations
                </p>
                {patientChats.length === 0 ? (
                  <div className="text-center py-16 px-4 space-y-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                      <Stethoscope size={32} />
                    </div>
                    <p className="font-bold text-slate-700 dark:text-slate-300">No active chats yet</p>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      Visit any doctor profile and click "Chat with Dr." to begin a real-time consultation.
                    </p>
                    <Link to="/doctors" onClick={() => setIsPatientChatOpen(false)}>
                      <Button size="sm" className="mt-2">Find a Doctor</Button>
                    </Link>
                  </div>
                ) : (
                  patientChats.map((chat) => (
                    <motion.div
                      key={chat.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleSelectChat(chat)}
                      className={`p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer border flex items-center gap-4 relative ${
                        chat.unreadPatient > 0 
                          ? 'border-primary bg-primary/5 dark:bg-primary/10' 
                          : 'border-slate-100 dark:border-slate-700'
                      }`}
                    >
                      <img
                        src={chat.doctorPhoto || "https://ui-avatars.com/api/?name=Doctor&background=random"}
                        alt={chat.doctorName}
                        className="w-12 h-12 rounded-2xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <h4 className="font-bold text-slate-900 dark:text-white truncate text-sm">
                            {chat.doctorName}
                          </h4>
                          <span className="text-[10px] font-semibold text-slate-400 ml-2">
                            {formatTime(chat.lastMessageTime)}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate mb-1">
                          {chat.hospitalName}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
                          {chat.lastMessage}
                        </p>
                      </div>
                      {chat.unreadPatient > 0 && (
                        <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          {chat.unreadPatient}
                        </span>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            ) : (
              // View 2: Active Chat Messages
              <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  <div className="text-center py-2">
                    <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                      Secure Real-Time Consultation
                    </span>
                  </div>

                  {loadingMessages && messages.length === 0 ? (
                    <div className="flex items-center justify-center py-10">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-12 px-4 space-y-2">
                      <p className="text-sm font-semibold text-slate-500">No messages yet</p>
                      <p className="text-xs text-slate-400">Send your first message to begin the conversation with {selectedDoctor.name}.</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.senderModel === "patient";
                      return (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={msg.id}
                          className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm text-sm space-y-1 ${
                              isMe
                                ? "bg-primary text-white rounded-br-none"
                                : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-bl-none"
                            }`}
                          >
                            <p className="leading-relaxed break-words">{msg.text}</p>
                            <div className={`flex items-center gap-1 text-[10px] justify-end ${isMe ? "text-white/80" : "text-slate-400"}`}>
                              <span>{formatTime(msg.timestamp)}</span>
                              {isMe && <CheckCheck size={12} />}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`Reply to ${selectedDoctor.name}...`}
                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 px-4 py-3 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 border-none"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={!inputText.trim()}
                    className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white p-3 rounded-2xl flex items-center justify-center transition-colors shadow-md shadow-primary/20 shrink-0"
                  >
                    <Send size={18} />
                  </motion.button>
                </form>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
