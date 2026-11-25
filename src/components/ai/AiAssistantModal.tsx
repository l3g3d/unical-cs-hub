import React, { useState, useEffect, useRef } from 'react';
import { Bot, Mic, Send, X, Sparkles, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { askGeminiAssistant, ChatMessage } from '../../lib/gemini';
import { startSpeechToText, stopSpeechToText, isSpeechSupported } from '../../lib/speech';
import { ActionPreviewCard } from './ActionPreviewCard';
import { useData } from '../../context/DataContext';
import { AiProposedAction } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_COMMANDS = [
  'Add COS101 lecture for Monday at 10 AM in Science Lecture Theatre',
  'Upload note for COS101 Lecture 3 on Binary Arithmetic',
  'Create a STA111 assignment on Measures of Dispersion due Friday',
  'Change tomorrow\'s COS101 lecture venue to Computing Lecture Hall'
];

export const AiAssistantModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { executeAiAction } = useData();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Good day Course Rep! I am CS HUB AI Assistant. Speak or type your instruction, and I will prepare timetable updates, assignments, or venue notifications for you.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isThinking) return;

    setSpeechError(null);
    setInputValue('');

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    try {
      const response = await askGeminiAssistant(text, messages);

      const assistantMsg: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'assistant',
        text: response.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        proposedAction: response.action || undefined
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'msg-' + (Date.now() + 1),
          sender: 'assistant',
          text: 'I ran into an issue connecting to Gemini. Please try again or rephrase your request.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleToggleVoice = () => {
    if (isRecording) {
      stopSpeechToText();
      setIsRecording(false);
      return;
    }

    if (!isSpeechSupported()) {
      setSpeechError('Speech recognition is not available in this browser. Please type your message.');
      return;
    }

    setSpeechError(null);
    setIsRecording(true);

    const started = startSpeechToText({
      onResult: (transcript, isFinal) => {
        setInputValue(transcript);
        if (isFinal) {
          setIsRecording(false);
          handleSendMessage(transcript);
        }
      },
      onError: (err) => {
        setSpeechError(err);
        setIsRecording(false);
      },
      onEnd: () => {
        setIsRecording(false);
      }
    });

    if (!started) {
      setIsRecording(false);
    }
  };

  const handleConfirmAction = async (action: AiProposedAction) => {
    const result = await executeAiAction(action);
    // Mark action as executed in the message history
    setMessages((prev) =>
      prev.map((msg) =>
        msg.proposedAction?.id === action.id
          ? {
              ...msg,
              proposedAction: { ...msg.proposedAction, status: 'EXECUTED' }
            }
          : msg
      )
    );

    // Add confirmation feedback message
    setMessages((prev) => [
      ...prev,
      {
        id: 'msg-' + Date.now(),
        sender: 'system',
        text: result.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleCancelAction = (action: AiProposedAction) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.proposedAction?.id === action.id
          ? {
              ...msg,
              proposedAction: { ...msg.proposedAction, status: 'CANCELLED' }
            }
          : msg
      )
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-navy-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[85vh] sm:h-[80vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-royal-900 text-white p-4 flex items-center justify-between border-b border-navy-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-royal-600/30 border border-royal-400/50 flex items-center justify-center text-royal-300">
              <Bot className="w-6 h-6 text-royal-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">CS HUB AI Assistant</h3>
                <span className="px-2 py-0.5 rounded-full bg-royal-500/20 text-royal-300 text-[10px] font-semibold uppercase tracking-wider border border-royal-400/30 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  Gemini API
                </span>
              </div>
              <p className="text-xs text-slate-300">Admin Voice & Text Academic Co-Pilot</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition"
              aria-label="Close Assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Security Notice Pill */}
        <div className="bg-royal-50/70 border-b border-royal-100 px-4 py-2 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-1.5 text-royal-800">
            <ShieldCheck className="w-3.5 h-3.5 text-royal-600 flex-shrink-0" />
            <span>Voice & commands restricted to academic schedule, assignments & venues.</span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 hidden sm:inline">100 Level Admin</span>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'user'
                  ? 'items-end'
                  : msg.sender === 'system'
                  ? 'items-center'
                  : 'items-start'
              }`}
            >
              {msg.sender === 'system' ? (
                <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs px-3 py-1.5 rounded-full my-1 font-medium flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {msg.text}
                </div>
              ) : (
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-royal-600 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                  <span
                    className={`block text-[10px] mt-1 ${
                      msg.sender === 'user' ? 'text-royal-200 text-right' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              )}

              {/* Action preview card if proposed */}
              {msg.proposedAction && (
                <div className="w-full max-w-md mt-1">
                  <ActionPreviewCard
                    action={msg.proposedAction}
                    onConfirm={handleConfirmAction}
                    onCancel={handleCancelAction}
                  />
                </div>
              )}
            </div>
          ))}

          {isThinking && (
            <div className="flex items-center gap-2 text-slate-500 text-xs py-2 bg-white px-3.5 rounded-xl border border-slate-200 max-w-fit">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-royal-600" />
              <span>Analyzing instruction with Gemini...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-3 py-2 bg-slate-100 border-t border-slate-200 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5">
          {SAMPLE_COMMANDS.map((cmd, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(cmd)}
              className="text-[11px] bg-white hover:bg-royal-50 hover:text-royal-700 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200 transition flex-shrink-0"
            >
              {cmd}
            </button>
          ))}
        </div>

        {/* Speech Error Banner if any */}
        {speechError && (
          <div className="bg-rose-50 text-rose-700 text-xs px-3 py-1.5 border-t border-rose-200 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{speechError}</span>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          {/* Microphone button */}
          <button
            type="button"
            onClick={handleToggleVoice}
            className={`p-2.5 rounded-xl transition flex-shrink-0 relative ${
              isRecording
                ? 'bg-rose-600 text-white animate-pulse-mic ring-2 ring-rose-400'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title={isRecording ? 'Listening... click to stop' : 'Click to speak instruction'}
          >
            <Mic className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder={isRecording ? 'Listening to your speech...' : 'Type or speak a command...'}
            className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-royal-500 focus:bg-white transition"
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isThinking}
            className="p-2.5 rounded-xl bg-royal-600 hover:bg-royal-500 disabled:opacity-40 text-white transition flex-shrink-0 shadow-sm"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
