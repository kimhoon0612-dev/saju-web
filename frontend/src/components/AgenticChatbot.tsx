"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, BookOpen, Users, Mic, Square, ChevronLeft, Phone } from 'lucide-react';
import Link from 'next/link';
import { cn } from './DestinyMatrixCard';

interface ChatMessage {
    role: 'user' | 'ai';
    content: string;
    citations?: string;
    expertRecommended?: boolean;
}

interface AgenticChatbotProps {
    sajuContext?: any; // The whole matrix + daily fortune from the parent
    isFullScreen?: boolean; // If true, render as a full page inline component instead of a modal
}

export default function AgenticChatbot({ sajuContext, isFullScreen = false }: AgenticChatbotProps) {
    const [isOpen, setIsOpen] = useState(isFullScreen);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<BlobPart[]>([]);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial greeting when opened, if no messages exist
    useEffect(() => {
        if ((isOpen || isFullScreen) && messages.length === 0) {
            if (sajuContext) {
                setMessages([{
                    role: 'ai',
                    content: `안녕하세요! 1:1 라이프 코치 AI입니다. 현재 고객님의 사주 원국과 오늘(${sajuContext?.daily_fortune?.date || '오늘'})의 운세 흐름(일진)을 완벽히 동기화했습니다. 사업, 연애, 진로 등 무엇이든 편하게 물어보세요!`,
                }]);
            } else {
                setMessages([{
                    role: 'ai',
                    content: `안녕하세요! 1:1 라이프 코치 AI입니다. 정확한 맞춤형 코칭을 위해서는 홈 화면(운세 탭)으로 돌아가 출생 정보를 먼저 입력하고 [운명 분석하기]를 눌러주세요. 그 전에는 일반적인 운세나 명리학 질문만 간단히 답변해 드립니다!`,
                }]);
            }
        }
    }, [isOpen, messages.length, sajuContext]);

    // Auto-scroll to bottom of chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (text: string) => {
        const userMsg = text.trim();
        if (!userMsg) return;

        const currentHistory = messages.map(m => ({ role: m.role, content: m.content }));

        const newMessages: ChatMessage[] = [
            ...messages,
            { role: 'user', content: userMsg }
        ];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMsg,
                    history: currentHistory,
                    saju_context: sajuContext || {}
                })
            });

            if (!response.ok) throw new Error("서버 오류");

            const data = await response.json();

            setMessages(prev => [
                ...prev,
                { role: 'ai', content: data.reply, citations: data.citations, expertRecommended: data.expert_consultation_recommended }
            ]);

        } catch (error) {
            console.error("채팅 오류:", error);
            setMessages(prev => [
                ...prev,
                { role: 'ai', content: "우주 파동 통신에 일시적인 오류가 발생했습니다. 다시 시도해주세요." }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(inputText);
        setInputText('');
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            // WebM is relatively standard; fallback to audio/mp4 or just let it be default if webm is entirely unsupported
            const options = MediaRecorder.isTypeSupported('audio/webm') ? { mimeType: 'audio/webm' } : undefined;
            const mediaRecorder = new MediaRecorder(stream, options);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: options?.mimeType || 'audio/webm' });
                const formData = new FormData();
                formData.append('audio', audioBlob, 'recording.webm');

                setIsLoading(true);
                try {
                    const response = await fetch('/api/transcribe', {
                        method: 'POST',
                        body: formData,
                    });

                    if (!response.ok) throw new Error("STT 오류");

                    const data = await response.json();
                    if (data.text) {
                        sendMessage(data.text);
                    } else {
                        throw new Error("Empty transcription");
                    }
                } catch (error) {
                    console.error("Transcription error:", error);
                    setMessages(prev => [
                        ...prev,
                        { role: 'ai', content: "음성 인식 중 오류가 발생했습니다. 다시 시도해주세요." }
                    ]);
                    setIsLoading(false);
                }

                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Microphone access denied or error:", err);
            alert("마이크 접근 권한이 필요합니다.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(inputText);
        }
    };






    if (isFullScreen) {
        return (
            <div className="flex flex-col h-screen w-full bg-[#f8f9fa] relative z-50">
                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-white border-b border-gray-100 shrink-0 h-14">
                    <div className="flex items-center gap-2">
                        <Link href="/experts" className="p-2 -ml-2 text-gray-600 hover:text-gray-900 transition-colors">
                            <ChevronLeft className="w-6 h-6" />
                        </Link>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#2AC1BC] to-[#1E8A85] flex items-center justify-center text-white">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-sm">AI 라이프 코치</h3>
                            <p className="text-[11px] text-[#2AC1BC] font-medium">명리학 기반 맞춤 상담</p>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={cn("flex flex-col max-w-[85%]", msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start")}>
                            <div className={cn(
                                "p-3 rounded-2xl text-[14px] leading-relaxed break-words",
                                msg.role === 'user'
                                    ? "bg-[#2AC1BC] text-white rounded-br-sm"
                                    : "bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm"
                            )}>
                                {msg.content}
                            </div>
                            {msg.expertRecommended && (
                                <Link href="/experts" className="mt-2 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 text-orange-800 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-sm hover:from-yellow-100 hover:to-orange-100 transition-colors">
                                    <Users className="w-3.5 h-3.5" />
                                    인간 전문가에게 심층 상담받기
                                </Link>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="mr-auto items-start max-w-[85%] flex flex-col">
                            <div className="p-4 rounded-2xl bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#2AC1BC] animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 rounded-full bg-[#2AC1BC] animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 rounded-full bg-[#2AC1BC] animate-bounce" style={{ animationDelay: '300ms' }} />
                                <span className="ml-1 text-xs text-gray-400 font-medium">우주 파동 분석 중...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="absolute bottom-0 left-0 w-full p-4 bg-white border-t border-gray-100">
                    <div className="flex gap-2 relative">
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="명리학 코치에게 무엇이든 물어보세요..."
                            className="flex-1 h-[48px] max-h-[120px] bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#2AC1BC] focus:ring-1 focus:ring-[#2AC1BC] resize-none pr-24"
                            rows={1}
                        />
                        <div className="absolute right-2 bottom-1.5 flex items-center gap-1">
                            <button
                                onClick={isRecording ? stopRecording : startRecording}
                                className={cn(
                                    "p-2 rounded-full transition-colors flex items-center justify-center",
                                    isRecording ? "bg-red-50 text-red-500 animate-pulse" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                                )}
                            >
                                {isRecording ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={() => sendMessage(inputText)}
                                disabled={!inputText.trim() || isLoading}
                                className="p-2 bg-[#2AC1BC] text-white rounded-full hover:bg-[#1E8A85] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Modal / Slide-out version
    return (
        <>
            {/* Floating Action Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 w-14 h-14 bg-gradient-to-r from-[var(--color-wood-green)] to-[var(--color-water-blue)] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(46,204,113,0.4)] hover:scale-110 transition-transform z-50 animate-bounce hover:animate-none"
                    aria-label="Open 1:1 Life Coach"
                >
                    <MessageSquare className="w-6 h-6 text-black" />
                </button>
            )}

            {/* Chatbot Panel (Slide Out) */}
            <div className={cn(
                "fixed top-0 right-0 h-full w-full sm:w-[450px] bg-black/80 backdrop-blur-2xl border-l border-white/10 shadow-2xl z-50 flex flex-col transition-transform duration-500 transform",
                isOpen ? "translate-x-0" : "translate-x-full"
            )}>
                {/* Header */}
                <header className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-wood-green)] to-[var(--color-water-blue)] flex items-center justify-center shadow-lg">
                            <Sparkles className="w-5 h-5 text-black" />
                        </div>
                        <div>
                            <h3 className="font-pretendard font-bold text-white text-base">Agentic Life Coach</h3>
                            <p className="font-outfit text-xs text-[var(--color-wood-neon)] font-medium">Volatile Privacy Active</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </header>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 font-pretendard">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={cn(
                            "flex flex-col max-w-[85%]",
                            msg.role === 'user' ? "self-end items-end" : "self-start items-start"
                        )}>
                            <div className={cn(
                                "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-md",
                                msg.role === 'user'
                                    ? "bg-gradient-to-br from-[var(--color-water-blue)] to-[#1a252f] text-white rounded-br-sm"
                                    : "bg-white/10 border border-white/10 text-gray-200 rounded-bl-sm"
                            )}>
                                {msg.content}
                            </div>

                            {/* XAI Citation Box */}
                            {msg.role === 'ai' && msg.citations && (
                                <div className="mt-2 bg-black/50 border border-yellow-500/20 rounded-xl p-3 text-xs text-gray-400 w-full">
                                    <div className="flex items-center gap-1.5 mb-1 text-yellow-500/80 font-medium">
                                        <BookOpen className="w-3 h-3" />
                                        <span>XAI (고전문헌 근거)</span>
                                    </div>
                                    <p className="whitespace-pre-wrap">{msg.citations}</p>
                                </div>
                            )}

                            {/* Expert Recommendation CTA */}
                            {msg.role === 'ai' && msg.expertRecommended && (
                                <div className="mt-2 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/40 rounded-xl p-3 w-full animate-in fade-in slide-in-from-bottom-2">
                                    <div className="flex items-center gap-1.5 mb-2 text-purple-300 font-bold text-sm">
                                        <Users className="w-4 h-4" />
                                        <span>심층 상담이 필요한 주제입니다</span>
                                    </div>
                                    <p className="text-xs text-gray-300 mb-3 font-pretendard leading-relaxed">
                                        해당 고민은 인간 역학 전문가와의 깊이 있는 1:1 상담을 통해 명확한 해답을 얻으실 수 있습니다.
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => alert(`📞 060-XXXX-XXXX 로 전화 다이얼이 연결됩니다.\n(상담사 랜덤 배정)\n\n※ 본 상담은 30초당 1,300원의 정보이용료가 청구됩니다.`)}
                                            className="flex-1 py-2.5 rounded-lg bg-white text-gray-900 font-bold text-xs hover:bg-gray-100 transition-all text-center flex flex-col items-center justify-center"
                                        >
                                            <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gray-600" />060 상담</span>
                                            <span className="text-[9px] text-gray-500 font-medium">후불 (30초/1,300원)</span>
                                        </button>
                                        <button
                                            onClick={() => alert(`현재 보유 코인이 부족합니다.\n\n코인 스토어로 이동하여 충전하시겠습니까?`)}
                                            className="flex-1 py-2.5 rounded-lg bg-[#111827] border border-gray-700 text-white font-bold text-xs hover:bg-gray-800 transition-all flex flex-col items-center justify-center group relative overflow-hidden"
                                        >
                                            {/* Emojii decoration */}
                                            <div className="absolute -top-1 -right-1 text-base opacity-40 group-active:scale-110 transition-transform">✨</div>

                                            <span className="flex items-center gap-1.5"><span className="text-yellow-400">⚡</span>코인 상담</span>
                                            <span className="text-[9px] text-gray-300 font-medium bg-white/10 px-1.5 py-0.5 mt-0.5 rounded">선불 (할인중)</span>
                                        </button>
                                    </div>
                                    <Link href="/experts" onClick={() => setIsOpen(false)} className="block w-full text-center py-2 mt-2 rounded-lg border border-purple-500/40 text-purple-300 font-bold text-xs hover:bg-purple-500/10 transition-all">
                                        직접 전문가 목록에서 선택하기
                                    </Link>
                                </div>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="self-start px-4 py-3 rounded-2xl bg-white/10 border border-white/10 text-gray-300 rounded-bl-sm flex gap-2 items-center">
                            <div className="w-2 h-2 rounded-full bg-[var(--color-wood-neon)] animate-bounce" />
                            <div className="w-2 h-2 rounded-full bg-[var(--color-wood-neon)] animate-bounce delay-100" />
                            <div className="w-2 h-2 rounded-full bg-[var(--color-wood-neon)] animate-bounce delay-200" />
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-white/10 bg-black/40">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="운명에 대해 무엇이든 물어보세요..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3 text-sm text-white focus:outline-none focus:border-[var(--color-water-blue)] focus:ring-1 focus:ring-[var(--color-water-blue)] transition-all font-pretendard"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !inputText.trim()}
                            className="w-12 h-12 rounded-full bg-[var(--color-water-blue)] flex items-center justify-center text-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--color-wood-neon)] transition-colors shrink-0"
                        >
                            <Send className="w-5 h-5 ml-1" />
                        </button>

                        {/* Record Button */}
                        <button
                            type="button"
                            disabled={isLoading}
                            onClick={isRecording ? stopRecording : startRecording}
                            className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed",
                                isRecording
                                    ? "bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                                    : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                            )}
                        >
                            {isRecording ? <Square className="w-5 h-5 fill-current" /> : <Mic className="w-5 h-5" />}
                        </button>
                    </form>
                    <p className="text-center text-[10px] text-gray-500 mt-3 font-pretendard flex items-center justify-center gap-1">
                        대화 내용은 창을 닫으면 완전히 <strong className="text-red-400">휘발</strong>되며 저장되지 않습니다. {isRecording && <span className="text-red-400 ml-1">(녹음 중...)</span>}
                    </p>
                </div>
            </div>
        </>
    );
}
