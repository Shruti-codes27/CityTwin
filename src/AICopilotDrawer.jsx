import { useState, useRef, useEffect } from "react";
import {
  Bot,
  X,
  Send,
  Sparkles,
  Minus,
  MessageSquare,
  ChevronDown,
} from "lucide-react";
import { COPILOT_PROMPTS, generateCopilotAnswer } from "./services/copilotEngine";
import { speakNavigationInstruction } from "./navigationEngine";

export default function AICopilotDrawer({
  isOpen,
  onClose,
  onOpen,
  scenario,
  params,
  telemetry,
  activeRoute,
  voiceEnabled,
}) {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "ai",
      text: "Hello, I am CityAI, Mumbai's automated emergency copilot. How can I assist you with your evacuation, shelter availability, or road conditions?",
      points: [
        "Ask about nearest dry evacuation routes and shelter capacity.",
        "Check hospital bed status and medical emergency protocols.",
        "Request assistance checklists for elderly, infants, or walking on foot.",
      ],
      time: "Now",
    },
  ]);

  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = (textToSend = null) => {
    const query = (textToSend || inputVal).trim();
    if (!query) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: "user",
      text: query,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setIsTyping(true);

    setTimeout(() => {
      const response = generateCopilotAnswer(query, {
        scenario,
        params,
        telemetry,
        activeRoute,
      });

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: response.text,
        points: response.points,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);

      if (voiceEnabled) {
        speakNavigationInstruction(response.text.replace(/\*\*/g, ""), voiceEnabled);
      }
    }, 400);
  };

  // 1. When closed: render the floating launcher widget button in bottom-right
  if (!isOpen) {
    return (
      <button
        className="floating-chat-launcher"
        onClick={onOpen}
        title="Open CityAI Copilot Assistant"
      >
        <div className="launcher-pulse-ring" />
        <Bot size={20} />
        <span className="launcher-text">CityAI Copilot</span>
        <span className="launcher-status-dot" />
      </button>
    );
  }

  // 2. When open: render the floating small chat window (No backdrop)
  return (
    <div className="floating-chat-window">
      {/* Floating Header */}
      <div className="chat-window-header">
        <div className="chat-title-group">
          <div className="chat-bot-avatar">
            <Bot size={17} />
          </div>
          <div>
            <h4>CityAI Copilot</h4>
            <small>
              <span className="live-dot" /> Telemetry Intelligence Active
            </small>
          </div>
        </div>

        <div className="chat-window-controls">
          <button
            className="btn-chat-control"
            onClick={onClose}
            title="Minimize Chat"
          >
            <Minus size={15} />
          </button>
          <button
            className="btn-chat-control close"
            onClick={onClose}
            title="Close Chat"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="chat-quick-prompts">
        <span className="prompts-tag">
          <Sparkles size={11} /> QUICK QUESTIONS:
        </span>
        <div className="prompts-scroll-row">
          {COPILOT_PROMPTS.map((p) => (
            <button
              key={p.id}
              className="quick-chip-btn"
              onClick={() => handleSend(p.query)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Message Thread */}
      <div className="chat-messages-scroll">
        {messages.map((m) => (
          <div key={m.id} className={`chat-message-bubble ${m.sender}`}>
            <div className="message-header-line">
              <strong>{m.sender === "ai" ? "CityAI" : "You"}</strong>
              <small>{m.time}</small>
            </div>
            <div className="message-content-text">{m.text}</div>

            {m.points && m.points.length > 0 && (
              <ul className="message-bullet-list">
                {m.points.map((pt, idx) => (
                  <li
                    key={idx}
                    dangerouslySetInnerHTML={{
                      __html: pt.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
                    }}
                  />
                ))}
              </ul>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="chat-message-bubble ai typing">
            <span>Analyzing city sensor telemetry & route coordinates...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form
        className="chat-input-bar"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <input
          type="text"
          placeholder="Ask about shelters, roads, hospitals..."
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
        />
        <button
          type="submit"
          className="btn-send-message"
          disabled={!inputVal.trim()}
          title="Send Question"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
