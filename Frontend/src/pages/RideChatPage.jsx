// src/pages/RideChatPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api.js';

const SOCKET_URL = import.meta.env.VITE_APP_SOCKET_URL || 'http://localhost:5001';

const RideChatPage = () => {
  const { rideId } = useParams();
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [currentMessage, setCurrentMessage] = useState('');
  const [messageList, setMessageList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!rideId) return;
      setLoadingHistory(true);
      try {
        // This API call now returns pre-translated history
        const { data } = await api.get(`/rides/${rideId}/messages`);
        setMessageList(data);
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
        toast.error("Could not load chat history.");
        setMessageList([]);
      } finally {
        setLoadingHistory(false);
      }
    };

    if (user) {
      fetchHistory(); 

      const newSocket = io(SOCKET_URL);
      setSocket(newSocket);
      
      // --- UPDATED: Send userId on join ---
      newSocket.emit('join_ride_chat', { rideId: rideId, userId: user._id });
      console.log(`User ${user.name} (ID: ${user._id}) joining chat for ride ${rideId}`);

      newSocket.on('connect_error', (err) => {
        console.error("Socket connection error:", err);
        toast.error("Chat connection failed. Trying to reconnect...");
      });
      newSocket.on('connect', () => {
        console.log("Socket connected successfully:", newSocket.id);
        // Re-join room on successful reconnect
        newSocket.emit('join_ride_chat', { rideId: rideId, userId: user._id });
      });

      return () => {
        console.log("Disconnecting socket...");
        newSocket.disconnect();
        setSocket(null);
      };
    } else {
      setMessageList([]);
      setLoadingHistory(false);
    }
  }, [user, rideId]);

  useEffect(() => {
    if (!socket) return;

    const messageListener = (data) => {
      // data = { _id, authorId, author, originalMessage, translatedMessage, ... }
      console.log("Received translated message:", data);
      setMessageList((list) => [...list, data]);
    };

    const errorListener = (errorData) => {
      console.error("Message error from server:", errorData);
      toast.error(errorData.message || "Failed to send message.");
    };

    socket.on('receive_message', messageListener);
    socket.on('message_error', errorListener); 

    return () => {
      socket.off('receive_message', messageListener);
      socket.off('message_error', errorListener);
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageList]);

  const sendMessage = async () => {
    if (currentMessage.trim() !== '' && socket && user) {
      const messageData = {
        rideId: rideId,
        authorId: user._id, 
        authorName: user.name,
        message: currentMessage, // Send the raw, original message
      };

      try {
        await socket.emit('send_message', messageData);
        // We no longer do an optimistic update
        // We wait for the server to broadcast the translated message back
        setCurrentMessage('');
      } catch (error) {
        console.error("Error sending message:", error);
        toast.error("Failed to send message.");
      }
    }
  };

  const handleKeyPress = (event) => {
    if(event.key === 'Enter' && !event.shiftKey){
      event.preventDefault();
      sendMessage();
    }
  }

  if (!user) {
    return (
        <div className="flex justify-center items-center h-screen">
            <p>Please <Link to="/login"><Button variant="link">log in</Button></Link> to view the chat.</p>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto border-x border-border bg-card">
      {/* Header (unchanged) */}
      <header className="flex items-center p-4 border-b border-border sticky top-0 bg-card z-10">
        <Link to={`/my-rides`}>
            <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5"/>
            </Button>
        </Link>
        <h2 className="text-lg font-semibold ml-4">Ride Chat</h2>
      </header>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-subtle">
        {loadingHistory ? (
          <p className="text-center text-muted-foreground">Loading history...</p>
        ) : messageList.length === 0 ? (
          <p className="text-center text-muted-foreground">No messages yet. Start the conversation!</p>
        ) : (
          // --- UPDATED CHAT BUBBLE RENDER ---
          messageList.map((msg) => (
            <div key={msg._id} className={`flex ${msg.authorId === user._id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] p-3 rounded-lg shadow-soft ${msg.authorId === user._id ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-secondary text-secondary-foreground rounded-bl-none'}`}>
                <p className="text-xs font-medium opacity-80 mb-1">{msg.author}</p>
                
                {/* The translated message */}
                <p className="text-sm break-words">{msg.translatedMessage}</p>

                {/* Show original if it's different from the translation */}
                {msg.translatedMessage !== msg.originalMessage && (
                  <p className="text-xs break-words opacity-70 mt-2 border-t border-white/20 pt-1">
                    Original: {msg.originalMessage}
                  </p>
                )}
                
                <p className="text-xs text-right opacity-60 mt-1">{msg.time}</p>
              </div>
            </div>
          ))
          // --- END UPDATED RENDER ---
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area (unchanged) */}
      <div className="p-4 border-t border-border flex items-center sticky bottom-0 bg-card">
        <input
          type="text"
          className="flex-1 border border-input rounded-lg px-4 py-2 mr-2 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Type your message..."
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <Button onClick={sendMessage} size="icon">
          <Send className="w-5 h-5"/>
        </Button>
      </div>
    </div>
  );
};

export default RideChatPage;