import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";

import { ChatProvider } from "./context/ChatContext";

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster position="top-right" />
        </BrowserRouter>
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;
