import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Mic,
  Send,
  X,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  Paperclip,
  FileText,
  CheckCircle2,
  Database,
} from 'lucide-react';
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
  'How many registered students are using the platform?',
  'Add COS101 lecture for Monday at 10 AM in Science Lecture Theatre',
  'Upload notes for MTH101 on Set Theory & Mathematical Induction',
  'Show me all the assignments currently available',
  'Update Thursday lecture time for STA111 to 09:00',
  'Create a departmental announcement: Departmental orientation next Monday',
  'Change venue of COS101 to SLT',
  'Remove the outdated assignment',
];

function formatToolLabel(tool: string, args: Record<string, any> = {}): string {
  switch (tool) {
    case 'upload_note':
      return `Uploaded note for ${args.courseCode || ''} (${args.topic || 'Lecture'})`;
    case 'update_note':
      return `Updated note for ${args.courseCode || ''}`;
    case 'delete_note':
      return `Deleted note (ID: ${args.id || ''})`;
    case 'add_timetable_class':
      return `Added ${args.courseCode || ''} (${args.dayOfWeek || ''} ${args.startTime || ''})`;
    case 'update_timetable_class':
      return `Updated timetable class ${args.courseCode || ''}`;
    case 'delete_timetable_class':
      return `Removed timetable class`;
    case 'update_venue':
      return `Relocated ${args.courseCode || ''} to ${args.venueName || ''}`;
    case 'create_assignment':
      return `Created assignment for ${args.courseCode || ''}: "${args.title || ''}"`;
    case 'update_assignment':
      return `Updated assignment details`;
    case 'delete_assignment':
      return `Deleted assignment record`;
    case 'publish_announcement':
      return `Published announcement: "${args.title || ''}"`;
    case 'delete_announcement':
      return `Deleted announcement`;
    case 'update_course_rep':
      return `Updated Course Representative profile`;
    case 'get_platform_stats':
      return `Queried central database metrics`;
    case 'list_assignments':
      return `Inspected active assignments`;
    case 'list_notes':
      return `Inspected course lecture notes`;
    case 'list_timetable':
      return `Queried weekly timetable entries`;
    case 'list_courses':
      return `Retrieved 100L curriculum`;
    default:
      return `Database: ${tool.replace(/_/g, ' ')}`;
  }
}

export const AiAssistantModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { executeAiAction, refreshData } = useData();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Good day Course Rep Divine! I am your CS HUB AI Assistant powered by Gemini 3.1.\n\nI can directly manage your website database: upload notes, update timetables, relocate lecture venues, create assignments, broadcast announcements, and check live student enrollment statistics. What would you like done?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  // File attachment state
  const [attachedFile, setAttachedFile] = useState<{
    fileName: string;
    mimeType: string;
    base64Data: string;
    sizeFormatted: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Selected file exceeds 10 MB limit. Please select a smaller document.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.includes(',') ? result.split(',')[1] : result;
      const sizeKb = Math.round(file.size / 1024);
      const sizeFormatted = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;

      setAttachedFile({
        fileName: file.name,
        mimeType: file.type || 'application/pdf',
        base64Data,
        sizeFormatted,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeAttachment = () => {
    setAttachedFile(null);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if ((!text && !attachedFile) || isThinking) return;

    setSpeechError(null);
    setInputValue('');

    const currentAttachment = attachedFile;
    setAttachedFile(null);

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: text || (currentAttachment ? `Attached: ${currentAttachment.fileName}` : ''),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachmentName: currentAttachment?.fileName,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    try {
      const response = await askGeminiAssistant(
        text,
        messages,
        currentAttachment
          ? {
              fileName: currentAttachment.fileName,
              mimeType: currentAttachment.mimeType,
              base64Data: currentAttachment.base64Data,
            }
          : null
      );

      const assistantMsg: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'assistant',
        text: response.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        proposedAction: response.action || undefined,
        executedTools: response.executedTools || [],
        mutated: Boolean(response.mutated),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // If database was modified by AI tools, immediately sync UI for admin and students
      if (response.mutated) {
        await refreshData();
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'msg-' + (Date.now() + 1),
          sender: 'assistant',
          text: 'I encountered a connection error. Please verify your internet connection or rephrase your command.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
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
      },
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
              proposedAction: { ...msg.proposedAction, status: 'EXECUTED' },
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
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    await refreshData();
  };

  const handleCancelAction = (action: AiProposedAction) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.proposedAction?.id === action.id
          ? {
              ...msg,
              proposedAction: { ...msg.proposedAction, status: 'CANCELLED' },
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
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold uppercase tracking-wider border border-emerald-400/30 flex items-center gap-1">
                  <Database className="w-2.5 h-2.5" />
                  Live Database Connected
                </span>
              </div>
              <p className="text-xs text-slate-300">Intelligent Departmental Management Copilot</p>
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

        {/* Security & Role Notice Banner */}
        <div className="bg-royal-50/70 border-b border-royal-100 px-4 py-2 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-1.5 text-royal-800">
            <ShieldCheck className="w-3.5 h-3.5 text-royal-600 flex-shrink-0" />
            <span>Authenticated Admin Session — changes update live portal for all students.</span>
          </div>
          <span className="text-[11px] font-semibold text-royal-700 bg-white px-2 py-0.5 rounded border border-royal-200 hidden sm:inline">
            100L Super Admin
          </span>
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
                  {/* File attachment preview if user sent a file */}
                  {msg.attachmentName && (
                    <div className="mb-2 pb-2 border-b border-white/20 flex items-center gap-1.5 text-[11px] font-medium text-royal-100">
                      <FileText className="w-3.5 h-3.5" />
                      <span>{msg.attachmentName}</span>
                    </div>
                  )}

                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                  {/* Executed Tools Badges */}
                  {msg.executedTools && msg.executedTools.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                      {msg.executedTools.map((t, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{formatToolLabel(t.tool, t.args)}</span>
                        </span>
                      ))}
                    </div>
                  )}

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
            <div className="flex items-center gap-2 text-slate-500 text-xs py-2 bg-white px-3.5 rounded-xl border border-slate-200 max-w-fit shadow-xs">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-royal-600" />
              <span>Executing instructions on central database...</span>
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

        {/* Attached File Chip (Pending Send) */}
        {attachedFile && (
          <div className="px-3 py-2 bg-royal-50/80 border-t border-royal-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-royal-900 font-medium truncate">
              <FileText className="w-4 h-4 text-royal-600 shrink-0" />
              <span className="truncate">{attachedFile.fileName}</span>
              <span className="text-[10px] text-royal-500">({attachedFile.sizeFormatted})</span>
            </div>
            <button
              onClick={removeAttachment}
              className="p-1 rounded-full hover:bg-royal-200/50 text-royal-600 transition"
              title="Remove file"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Speech Error Banner if any */}
        {speechError && (
          <div className="bg-rose-50 text-rose-700 text-xs px-3 py-1.5 border-t border-rose-200 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{speechError}</span>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          {/* Paperclip attachment button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex-shrink-0"
            title="Attach lecture note or document"
          >
            <Paperclip className="w-4 h-4" />
          </button>

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
            <Mic className="w-4 h-4" />
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder={
              isRecording
                ? 'Listening to your speech...'
                : attachedFile
                ? 'Tell AI what to do with this file (e.g. "Upload for COS101 Lecture 3")...'
                : 'Type or speak a website management command...'
            }
            className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-royal-500 focus:bg-white transition"
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={(!inputValue.trim() && !attachedFile) || isThinking}
            className="p-2.5 rounded-xl bg-royal-600 hover:bg-royal-500 disabled:opacity-40 text-white transition flex-shrink-0 shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
