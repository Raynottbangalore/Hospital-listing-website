import { useState, useEffect, useRef } from "react";
import { collection, query, where, orderBy, onSnapshot, addDoc, doc, updateDoc, serverTimestamp, getDoc, increment } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../hooks/useAuth";
import { useChat } from "../../context/ChatContext";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Send, CheckCheck, User, MessageSquare, Clock, Phone, Video, Info } from "lucide-react";
import toast from "react-hot-toast";

export const DoctorMessages = () => {
  const { currentUser } = useAuth();
  const { initiateDoctorCall } = useChat();
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [search, setSearch] = useState("");
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);

  // 1. Load doctor info
  useEffect(() => {
    if (!currentUser?.uid) return;
    const unsubUser = onSnapshot(doc(db, "users", currentUser.uid), (userDoc) => {
      if (userDoc.exists()) {
        const data = userDoc.data();
        setDoctorInfo(data);
      }
    });
    return () => unsubUser();
  }, [currentUser]);

  // 2. Load all chats for this doctorId
  useEffect(() => {
    if (!doctorInfo?.doctorId) {
      setLoadingChats(false);
      return;
    }

    setLoadingChats(true);
    const q = query(collection(db, "chats"), where("doctorId", "==", doctorInfo.doctorId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatList = [];
      snapshot.forEach((docSnap) => {
        chatList.push({ id: docSnap.id, ...docSnap.data() });
      });
      // Sort by lastMessageTime desc
      chatList.sort((a, b) => (b.lastMessageTime?.toMillis() || 0) - (a.lastMessageTime?.toMillis() || 0));
      setChats(chatList);
      setLoadingChats(false);
    }, (error) => {
      console.error("Error loading doctor chats:", error);
      setLoadingChats(false);
    });

    return () => unsubscribe();
  }, [doctorInfo?.doctorId]);

  // 3. Load messages for selected chat
  useEffect(() => {
    if (!selectedChat?.id) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);
    const q = query(collection(db, "chats", selectedChat.id, "messages"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
      setMessages(msgs);
      setLoadingMessages(false);
      setTimeout(() => scrollToBottom(), 100);

      // Mark as read for doctor
      if (selectedChat.unreadDoctor > 0) {
        updateDoc(doc(db, "chats", selectedChat.id), { unreadDoctor: 0 }).catch(err => console.error(err));
      }
    }, (error) => {
      console.error("Error loading chat messages:", error);
      setLoadingMessages(false);
    });

    return () => unsubscribe();
  }, [selectedChat?.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedChat || !currentUser) return;

    const msgText = inputText.trim();
    setInputText("");

    try {
      const messageData = {
        senderId: currentUser.uid,
        senderModel: "doctor",
        text: msgText,
        timestamp: serverTimestamp()
      };

      await addDoc(collection(db, "chats", selectedChat.id, "messages"), messageData);

      await updateDoc(doc(db, "chats", selectedChat.id), {
        lastMessage: msgText,
        lastMessageTime: serverTimestamp(),
        unreadPatient: increment(1)
      });

      scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filteredChats = chats.filter(c => 
    c.patientName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-8rem)] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col md:flex-row">
      {/* Left Sidebar: Patients list */}
      <div className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 space-y-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Patient Messages</h2>
            <p className="text-xs text-slate-500 font-medium">Real-time patient consultations</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search patients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loadingChats ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-2">
              <MessageSquare className="mx-auto text-slate-400" size={32} />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No conversations found</p>
            </div>
          ) : (
            filteredChats.map((chat) => {
              const isSelected = selectedChat?.id === chat.id;
              return (
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border flex items-center gap-3 relative ${
                    isSelected
                      ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                      : chat.unreadDoctor > 0
                      ? "bg-white dark:bg-slate-800 border-primary/30 shadow-sm"
                      : "bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/50 border-slate-100 dark:border-slate-700/80"
                  }`}
                >
                  <img
                    src={chat.patientPhoto || "https://ui-avatars.com/api/?name=" + encodeURIComponent(chat.patientName) + "&background=random"}
                    alt={chat.patientName}
                    className="w-12 h-12 rounded-2xl object-cover shrink-0 border border-white/20 shadow-xs"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className={`font-bold truncate text-sm ${isSelected ? "text-white" : "text-slate-900 dark:text-white"}`}>
                        {chat.patientName}
                      </h4>
                      <span className={`text-[10px] font-semibold ml-2 ${isSelected ? "text-white/80" : "text-slate-400"}`}>
                        {formatTime(chat.lastMessageTime)}
                      </span>
                    </div>
                    <p className={`text-xs truncate ${isSelected ? "text-white/90" : "text-slate-500 dark:text-slate-400 font-medium"}`}>
                      {chat.lastMessage || "No messages yet"}
                    </p>
                  </div>
                  {chat.unreadDoctor > 0 && !isSelected && (
                    <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-md animate-pulse">
                      {chat.unreadDoctor}
                    </span>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Main Area: Chat Window */}
      <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
        {selectedChat ? (
          <>
            {/* Top Bar Header */}
            <div className="p-5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <img
                  src={selectedChat.patientPhoto || "https://ui-avatars.com/api/?name=" + encodeURIComponent(selectedChat.patientName) + "&background=random"}
                  alt={selectedChat.patientName}
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                />
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    {selectedChat.patientName}
                  </h3>
                  <span className="text-xs bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 w-max mt-0.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    Patient Consultation
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => initiateDoctorCall(selectedChat)} className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl transition-colors">
                  <Phone size={18} />
                </button>
                <button onClick={() => initiateDoctorCall(selectedChat)} className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl transition-colors">
                  <Video size={18} />
                </button>
                <button className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl transition-colors">
                  <Info size={18} />
                </button>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="text-center py-2">
                <span className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-1.5 rounded-full text-slate-500 dark:text-slate-400 font-bold shadow-xs">
                  Conversation started with {selectedChat.patientName}
                </span>
              </div>

              {loadingMessages && messages.length === 0 ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderModel === "doctor";
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={msg.id}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-3xl px-5 py-3.5 shadow-sm text-sm space-y-1 ${
                          isMe
                            ? "bg-primary text-white rounded-br-none shadow-primary/20"
                            : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-bl-none"
                        }`}
                      >
                        <p className="leading-relaxed break-words">{msg.text}</p>
                        <div className={`flex items-center gap-1 text-[10px] justify-end ${isMe ? "text-white/80" : "text-slate-400"}`}>
                          <span>{formatTime(msg.timestamp)}</span>
                          {isMe && <CheckCheck size={14} />}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Type a message to ${selectedChat.patientName}...`}
                className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 px-5 py-3.5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 border-none transition-all"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white p-3.5 rounded-2xl flex items-center justify-center transition-colors shadow-lg shadow-primary/20 shrink-0"
              >
                <Send size={20} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <MessageSquare size={40} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Your Consultation Center</h3>
            <p className="text-slate-500 max-w-sm text-sm">
              Select a patient from the sidebar to view clinical consultation history and reply to messages in real-time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
