'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, ChevronDown, Cpu, Bot, Copy, ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import styles from './AiAgent.module.css';
import RoboticIcon from '@/components/RoboticIcon';

type Message = {
    role: 'user' | 'assistant' | 'system';
    content: string;
};

type Provider = 'gemini' | 'openrouter' | 'groq';

const MODELS = {
    gemini: ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-2.5-flash-lite'],
    openrouter: ['mistralai/mistral-7b-instruct:free', 'nvidia/nemotron-nano-9b-v2:free', 'qwen/qwen3-coder:free', 'tngtech/deepseek-r1t2-chimera:free'],
    groq: ['meta-llama/llama-4-scout-17b-16e-instruct', 'llama-3.3-70b-versatile'],
};

import { useAiAgent } from '@/contexts/AiAgentContext';

export default function AiAgent() {
    const { isOpen, setIsOpen } = useAiAgent();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [provider, setProvider] = useState<Provider>('gemini');
    const [model, setModel] = useState(MODELS.gemini[0]);
    const [isDark, setIsDark] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [isProviderOpen, setIsProviderOpen] = useState(false);
    const [isModelOpen, setIsModelOpen] = useState(false);
    const providerRef = useRef<HTMLDivElement>(null);
    const modelRef = useRef<HTMLDivElement>(null);

    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [likedMessages, setLikedMessages] = useState<Set<number>>(new Set());
    const [dislikedMessages, setDislikedMessages] = useState<Set<number>>(new Set());

    useEffect(() => {
        const checkDarkMode = () => {
            const isDarkMode = document.documentElement.classList.contains('dark') ||
                document.documentElement.getAttribute('data-theme') === 'dark';
            setIsDark(isDarkMode);
        };
        checkDarkMode();
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (providerRef.current && !providerRef.current.contains(event.target as Node)) setIsProviderOpen(false);
            if (modelRef.current && !modelRef.current.contains(event.target as Node)) setIsModelOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleProviderSelect = (p: Provider) => { setProvider(p); setModel(MODELS[p][0]); setIsProviderOpen(false); };
    const handleModelSelect = (m: string) => { setModel(m); setIsModelOpen(false); };

    const copyToClipboard = async (text: string, idx: number) => {
        await navigator.clipboard.writeText(text);
        setCopiedIndex(idx);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handleLike = (idx: number) => {
        const newLiked = new Set(likedMessages);
        const newDisliked = new Set(dislikedMessages);
        if (newLiked.has(idx)) newLiked.delete(idx);
        else { newLiked.add(idx); newDisliked.delete(idx); }
        setLikedMessages(newLiked);
        setDislikedMessages(newDisliked);
    };

    const handleDislike = (idx: number) => {
        const newLiked = new Set(likedMessages);
        const newDisliked = new Set(dislikedMessages);
        if (newDisliked.has(idx)) newDisliked.delete(idx);
        else { newDisliked.add(idx); newLiked.delete(idx); }
        setLikedMessages(newLiked);
        setDislikedMessages(newDisliked);
    };

    const sendMessage = async () => {
        if (!input.trim()) return;
        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/agent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [...messages, userMessage], provider, model }),
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const dark = isDark ? styles.dark : '';

    return (
        <>
            <button onClick={() => setIsOpen(true)} className={`${styles.fab} ${isOpen ? styles.hidden : ''}`}>
                <span>Ask AI</span>
                <Sparkles size={16} />
            </button>

            {isOpen && (
                <div className={styles.overlay}>
                    <div className={`${styles.modal} ${dark}`}>
                        {/* Header */}
                        <header className={`${styles.header} ${dark}`}>
                            <div className={styles.headerLeft}>
                                <div className={`${styles.logo} ${dark}`}><RoboticIcon /></div>
                                <span className={`${styles.title} ${dark}`}>Ask Physical AI</span>
                            </div>
                            <div className={styles.headerRight}>
                                <div className={`${styles.selectors} ${dark}`}>
                                    {/* Provider */}
                                    <div className={styles.dropdown} ref={providerRef}>
                                        <button className={`${styles.dropBtn} ${dark}`} onClick={() => setIsProviderOpen(!isProviderOpen)}>
                                            <Cpu size={12} />
                                            <span>{provider === 'openrouter' ? 'OpenRouter' : provider === 'gemini' ? 'Gemini' : 'Groq'}</span>
                                            <ChevronDown size={12} />
                                        </button>
                                        {isProviderOpen && (
                                            <div className={`${styles.dropMenu} ${dark}`}>
                                                <button onClick={() => handleProviderSelect('gemini')} className={`${styles.dropItem} ${dark}`}>Gemini</button>
                                                <button onClick={() => handleProviderSelect('openrouter')} className={`${styles.dropItem} ${dark}`}>OpenRouter</button>
                                                <button onClick={() => handleProviderSelect('groq')} className={`${styles.dropItem} ${dark}`}>Groq</button>
                                            </div>
                                        )}
                                    </div>
                                    <span className={`${styles.sep} ${dark}`}>|</span>
                                    {/* Model */}
                                    <div className={styles.dropdown} ref={modelRef}>
                                        <button className={`${styles.dropBtn} ${dark}`} onClick={() => setIsModelOpen(!isModelOpen)}>
                                            <span className={styles.modelName}>{model}</span>
                                            <ChevronDown size={12} />
                                        </button>
                                        {isModelOpen && (
                                            <div className={`${styles.dropMenu} ${styles.right} ${dark}`}>
                                                {MODELS[provider].map(m => (
                                                    <button key={m} onClick={() => handleModelSelect(m)} className={`${styles.dropItem} ${dark}`}>{m}</button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button onClick={() => setIsOpen(false)} className={`${styles.closeBtn} ${dark}`}><X size={18} /></button>
                            </div>
                        </header>

                        {/* Chat */}
                        <main className={`${styles.chat} ${dark}`}>
                            {messages.length === 0 ? (
                                <div className={styles.empty}>
                                    <div className={styles.emptyIcon}><Bot size={24} /></div>
                                    <h3 className={`${styles.emptyTitle} ${dark}`}>Hi, I&apos;m your Physical AI Assistant!</h3>
                                    <p className={`${styles.emptyDesc} ${dark}`}>Ask me about ROS 2, Gazebo, Isaac Sim, or Humanoid Control.</p>
                                    <div className={styles.suggestions}>
                                        {['What is Physical AI?', 'How do I install ROS 2?', 'Explain Sim-to-Real', 'What are VLA models?'].map(q => (
                                            <button key={q} onClick={() => { setInput(q); sendMessage(); }} className={`${styles.suggestBtn} ${dark}`}>{q}</button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                messages.map((msg, idx) => (
                                    <div key={idx} className={`${styles.msgRow} ${msg.role === 'user' ? styles.user : styles.bot}`}>
                                        <div className={`${styles.bubble} ${msg.role === 'user' ? styles.userBubble : styles.botBubble} ${dark}`}>
                                            {msg.content}
                                        </div>
                                        {msg.role === 'assistant' && (
                                            <div className={styles.actions}>
                                                <button onClick={() => copyToClipboard(msg.content, idx)} className={`${styles.actBtn} ${copiedIndex === idx ? styles.active : ''} ${dark}`}>
                                                    {copiedIndex === idx ? <Check size={14} /> : <Copy size={14} />}
                                                </button>
                                                <button onClick={() => handleLike(idx)} className={`${styles.actBtn} ${likedMessages.has(idx) ? styles.active : ''} ${dark}`}>
                                                    <ThumbsUp size={14} />
                                                </button>
                                                <button onClick={() => handleDislike(idx)} className={`${styles.actBtn} ${dislikedMessages.has(idx) ? styles.active : ''} ${dark}`}>
                                                    <ThumbsDown size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                            {isLoading && <div className={styles.msgRow}><div className={`${styles.loader} ${dark}`}><span /><span /><span /></div></div>}
                            <div ref={messagesEndRef} />
                        </main>

                        {/* Input */}
                        <footer className={`${styles.footer} ${dark}`}>
                            <div className={styles.inputWrap}>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                    placeholder="Ask a question..."
                                    className={`${styles.input} ${dark}`}
                                />
                                <button onClick={sendMessage} disabled={isLoading || !input.trim()} className={`${styles.sendBtn} ${dark}`}>
                                    <Send size={16} />
                                </button>
                            </div>
                            <p className={styles.footerText}>Powered by <a href="https://abdulrafay.online" target="_blank"><b>Abdul Rafay Khan</b></a></p>
                        </footer>
                    </div>
                </div>
            )}
        </>
    );
}
