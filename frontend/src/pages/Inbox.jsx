import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getConversations, getMessages, sendMessage } from '../services/messageService';
import { Send, Search, MessageSquare, Loader2, ArrowLeft, Check, CheckCheck } from 'lucide-react';

const Inbox = () => {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [conversations, setConversations] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  
  const [loadingConv, setLoadingConv] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const activeSetRef = useRef(false); // Predict double-renders preventing recursive sets
  const chatContainerRef = useRef(null); // Explicit DOM anchor preventing global Window scrolls

  // Polling Conversations every 5s pulling global unread bubbles
  useEffect(() => {
    const fetchConv = async () => {
      try {
        const data = await getConversations();
        setConversations(data);
        
        // Snag ?userId parameters seamlessly converting external UI clicks into chat views
        const queryUserId = searchParams.get('userId');
        const queryName = searchParams.get('name');
        
        if (queryUserId && !activeSetRef.current) {
            const existingConv = data.find(c => c._id === queryUserId);
            if (existingConv) {
                setActiveUser({ ...existingConv.user, _id: existingConv._id });
            } else {
                // Instantiating brand new conversational array
                setActiveUser({ 
                   _id: queryUserId, 
                   name: queryName || 'Service Provider', 
                   profileImage: `https://ui-avatars.com/api/?name=${queryName || 'Provider'}&background=10b981&color=fff`
                });
            }
            activeSetRef.current = true;
        }
      } catch (err) {
        console.error("Inbox Sync Error:", err);
      } finally {
        setLoadingConv(false);
      }
    };
    
    fetchConv();
    const interval = setInterval(fetchConv, 5000);
    return () => clearInterval(interval);
  }, [searchParams]);

  // Aggressive short-polling simulating Socket connections fetching direct message arrays
  useEffect(() => {
    let interval;
    if (activeUser) {
      const fetchMsgs = async () => {
        try {
          const data = await getMessages(activeUser._id);
          setMessages(prev => {
             // Strict mapping preventing jittery scroll-locks on identical arrays
             if (prev.length !== data.length) {
                setTimeout(scrollToBottom, 100); // Async DOM bind push
             }
             return data;
          });
        } catch (err) {
          console.error("Message Payload Sync Error:", err);
        }
      };
      
      setLoadingMsgs(true);
      fetchMsgs().then(() => setLoadingMsgs(false));
      interval = setInterval(fetchMsgs, 3000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [activeUser]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({
           top: chatContainerRef.current.scrollHeight,
           behavior: 'smooth'
        });
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeUser) return;
    
    setIsSending(true);
    try {
      const newMsg = await sendMessage({ receiverId: activeUser._id, content: text });
      setMessages(prev => [...prev, newMsg]);
      setText('');
      scrollToBottom();
      
      // Flash the updated conversations matrix preventing 5-sec input delay
      const updatedConv = await getConversations();
      setConversations(updatedConv);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-80px)] p-4 sm:p-8">
      <div className="max-w-7xl mx-auto h-[80vh] bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex relative">
        
        {/* Sidebar - Conversation List */}
        <div className={`w-full md:w-1/3 border-r border-slate-200 flex flex-col bg-white ${activeUser ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h1 className="text-2xl font-extrabold text-slate-900">Inbox</h1>
            <MessageSquare className="w-6 h-6 text-slate-400" />
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {loadingConv ? (
              <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>
            ) : conversations.length === 0 && !activeUser ? (
              <div className="text-center p-10 text-slate-500">
                <p>No messages yet.</p>
                <p className="text-sm mt-2">Reach out to a professional to start chatting!</p>
              </div>
            ) : (
              conversations.map(conv => (
                <div 
                  key={conv._id}
                  onClick={() => setActiveUser({ ...conv.user, _id: conv._id })}
                  className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all ${activeUser?._id === conv._id ? 'bg-primary-50 border-primary-100 border' : 'hover:bg-slate-50 border border-transparent'}`}
                >
                  <div className="relative">
                    <img src={conv.user.profileImage || `https://ui-avatars.com/api/?name=${conv.user.name}&background=10b981&color=fff`} className="w-12 h-12 rounded-full object-cover" alt="" />
                    {conv.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-slate-900 truncate">{conv.user.name}</h3>
                      <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                        {new Date(conv.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-bold text-slate-900' : 'text-slate-500'}`}>
                      {conv.lastMessage}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Panel - Active Chat Window */}
        <div className={`w-full md:w-2/3 flex flex-col bg-slate-50/50 ${!activeUser ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
          {!activeUser ? (
            <div className="text-center p-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-300">
                <MessageSquare className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Your Messages</h2>
              <p className="text-slate-500 max-w-sm">Select a conversation from the sidebar or start a new message directly from a Service Profile.</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-4">
                  <button onClick={() => setActiveUser(null)} className="md:hidden p-2 -ml-2 text-slate-500 bg-slate-100 rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <img src={activeUser.profileImage || `https://ui-avatars.com/api/?name=${activeUser.name}&background=10b981&color=fff`} className="w-10 h-10 rounded-full object-cover" alt="" />
                  <div>
                    <h3 className="font-bold text-slate-900">{activeUser.name}</h3>
                    <p className="text-xs text-slate-500 capitalize">{activeUser.role || 'Service Professional'}</p>
                  </div>
                </div>
              </div>

              {/* Message Transcript Area */}
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6">
                {loadingMsgs && messages.length === 0 ? (
                  <div className="flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = msg.sender === currentUser._id;
                    return (
                      <div key={msg._id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-5 py-3 ${isMe ? 'bg-primary-600 text-white rounded-br-sm shadow-md' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm'}`}>
                          <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        <div className={`flex items-center gap-1 mt-1 text-[11px] font-medium text-slate-400 ${isMe ? 'pr-1' : 'pl-1'}`}>
                          {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {isMe && (
                             msg.read ? <CheckCheck className="w-3 h-3 text-blue-500 ml-1" /> : <Check className="w-3 h-3 ml-1" />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chat Input Field */}
              <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                <form onSubmit={handleSend} className="flex gap-3">
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type your message here..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-6 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-slate-900"
                  />
                  <button 
                    type="submit" 
                    disabled={!text.trim() || isSending}
                    className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shrink-0"
                  >
                    {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-1" />}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inbox;
