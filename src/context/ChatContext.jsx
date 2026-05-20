import { createContext, useState, useEffect, useContext } from "react";
import { collection, query, where, onSnapshot, doc, updateDoc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const { currentUser, userRole } = useContext(AuthContext);
  const [isPatientChatOpen, setIsPatientChatOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [patientChats, setPatientChats] = useState([]);
  const [unreadPatientCount, setUnreadPatientCount] = useState(0);

  // Call states
  const [doctorUserData, setDoctorUserData] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);

  // If user is doctor, load their doctor ID
  useEffect(() => {
    if (!currentUser || userRole !== "doctor") {
      setDoctorUserData(null);
      return;
    }
    const unsub = onSnapshot(doc(db, "users", currentUser.uid), (docSnap) => {
      if (docSnap.exists()) {
        setDoctorUserData(docSnap.data());
      }
    });
    return () => unsub();
  }, [currentUser, userRole]);

  // Listen to patient's chats and call status
  useEffect(() => {
    if (!currentUser || userRole === "doctor" || userRole === "admin" || userRole === "super_admin") {
      setPatientChats([]);
      setUnreadPatientCount(0);
      return;
    }

    const q = query(collection(db, "chats"), where("patientId", "==", currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chats = [];
      let totalUnread = 0;
      let currentIncoming = null;
      let currentActive = null;

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const chatItem = { id: docSnap.id, ...data };
        chats.push(chatItem);
        totalUnread += (data.unreadPatient || 0);

        // Check call status
        if (data.callStatus === "ringing" && data.callerId !== currentUser.uid) {
          currentIncoming = chatItem;
        } else if (data.callStatus === "ringing" && data.callerId === currentUser.uid) {
          currentActive = chatItem;
        } else if (data.callStatus === "in-progress") {
          currentActive = chatItem;
        }
      });

      chats.sort((a, b) => (b.lastMessageTime?.toMillis() || 0) - (a.lastMessageTime?.toMillis() || 0));
      setPatientChats(chats);
      setUnreadPatientCount(totalUnread);
      setIncomingCall(currentIncoming);
      setActiveCall(currentActive);
    }, (error) => {
      console.error("Error listening to patient chats:", error);
    });

    return () => unsubscribe();
  }, [currentUser, userRole]);

  // Listen to doctor's chats and call status
  useEffect(() => {
    if (!doctorUserData?.doctorId) return;

    const q = query(collection(db, "chats"), where("doctorId", "==", doctorUserData.doctorId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let currentIncoming = null;
      let currentActive = null;

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const chatItem = { id: docSnap.id, ...data };

        if (data.callStatus === "ringing" && data.callerId !== currentUser?.uid && data.callerModel !== "doctor") {
          currentIncoming = chatItem;
        } else if (data.callStatus === "ringing" && data.callerModel === "doctor") {
          currentActive = chatItem;
        } else if (data.callStatus === "in-progress") {
          currentActive = chatItem;
        }
      });

      setIncomingCall(currentIncoming);
      setActiveCall(currentActive);
    }, (error) => {
      console.error("Error listening to doctor calls:", error);
    });

    return () => unsubscribe();
  }, [doctorUserData?.doctorId, currentUser]);

  const openChatWithDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setIsPatientChatOpen(true);
  };

  const markPatientChatRead = async (chatId) => {
    if (!chatId) return;
    try {
      await updateDoc(doc(db, "chats", chatId), {
        unreadPatient: 0
      });
    } catch (error) {
      console.error("Error marking chat read:", error);
    }
  };

  // Video Call Actions
  const initiateVideoCall = async (targetDoctor, currentPatient) => {
    if (!currentPatient || !targetDoctor) return;
    const chatId = `${currentPatient.uid}_${targetDoctor.id}`;
    const chatDocRef = doc(db, "chats", chatId);

    try {
      const snap = await getDoc(chatDocRef);
      const callPayload = {
        callStatus: "ringing",
        callerId: currentPatient.uid,
        callerName: currentPatient.displayName || currentPatient.email?.split("@")[0] || "Patient",
        callerPhoto: currentPatient.photoURL || "",
        callerModel: "patient",
        calleeId: targetDoctor.id,
        calleeName: targetDoctor.name || "Doctor",
        calleePhoto: targetDoctor.image || "",
        calleeModel: "doctor",
        callStartTime: serverTimestamp(),
        lastMessage: "🎥 Started a video consultation",
        lastMessageTime: serverTimestamp()
      };

      if (!snap.exists()) {
        await setDoc(chatDocRef, {
          patientId: currentPatient.uid,
          patientName: callPayload.callerName,
          patientPhoto: callPayload.callerPhoto,
          doctorId: targetDoctor.id,
          doctorName: targetDoctor.name,
          doctorPhoto: targetDoctor.image || "",
          hospitalId: targetDoctor.hospitalId || "",
          hospitalName: targetDoctor.hospitalName || "Hospital",
          unreadDoctor: 1,
          unreadPatient: 0,
          createdAt: serverTimestamp(),
          ...callPayload
        });
      } else {
        await updateDoc(chatDocRef, callPayload);
      }
    } catch (error) {
      console.error("Error initiating call:", error);
      toast.error("Could not connect call.");
    }
  };

  const initiateDoctorCall = async (chat) => {
    if (!chat || !currentUser || !doctorUserData) return;
    const chatDocRef = doc(db, "chats", chat.id);

    try {
      await updateDoc(chatDocRef, {
        callStatus: "ringing",
        callerId: currentUser.uid,
        callerName: doctorUserData.name || "Doctor",
        callerPhoto: doctorUserData.image || "",
        callerModel: "doctor",
        calleeId: chat.patientId,
        calleeName: chat.patientName,
        calleePhoto: chat.patientPhoto || "",
        calleeModel: "patient",
        callStartTime: serverTimestamp(),
        lastMessage: "🎥 Started a video consultation",
        lastMessageTime: serverTimestamp()
      });
    } catch (error) {
      console.error("Error initiating doctor call:", error);
      toast.error("Could not connect call.");
    }
  };

  const acceptVideoCall = async (chatId) => {
    if (!chatId) return;
    try {
      await updateDoc(doc(db, "chats", chatId), {
        callStatus: "in-progress"
      });
    } catch (error) {
      console.error("Error accepting call:", error);
    }
  };

  const endVideoCall = async (chatId) => {
    if (!chatId) return;
    try {
      await updateDoc(doc(db, "chats", chatId), {
        callStatus: "idle"
      });
      setActiveCall(null);
      setIncomingCall(null);
    } catch (error) {
      console.error("Error ending call:", error);
    }
  };

  const value = {
    isPatientChatOpen,
    setIsPatientChatOpen,
    selectedDoctor,
    setSelectedDoctor,
    openChatWithDoctor,
    patientChats,
    unreadPatientCount,
    markPatientChatRead,
    incomingCall,
    activeCall,
    initiateVideoCall,
    initiateDoctorCall,
    acceptVideoCall,
    endVideoCall,
    doctorUserData
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
