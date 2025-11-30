'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createSupabaseClient } from '@/lib/supabase'
import { getUserPlan, canSendMessage, type UserPlan } from '@/lib/planDetection'
import type { User } from '@supabase/supabase-js'
import MarkdownRenderer from './MarkdownRenderer'
import JSZip from 'jszip'

interface File {
  name: string
  content: string
  language: string
}

interface CodingModeProps {
  user: User
  userPlan: UserPlan | null
  onShowPremiumModal?: (title: string, message: string) => void
  onBackToChat?: () => void
}

const LANGUAGE_EXTENSIONS: Record<string, string> = {
  'js': 'javascript',
  'jsx': 'javascript',
  'ts': 'typescript',
  'tsx': 'typescript',
  'py': 'python',
  'html': 'html',
  'css': 'css',
  'json': 'json',
  'md': 'markdown',
  'java': 'java',
  'cpp': 'cpp',
  'c': 'c',
  'go': 'go',
  'rs': 'rust',
  'php': 'php',
  'rb': 'ruby',
  'swift': 'swift',
  'kt': 'kotlin',
  'sh': 'bash',
  'sql': 'sql',
}

function detectLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  return LANGUAGE_EXTENSIONS[ext] || 'plaintext'
}

export default function CodingMode({ user, userPlan, onShowPremiumModal, onBackToChat }: CodingModeProps) {
  const [files, setFiles] = useState<File[]>([
    { name: 'index.html', content: '<!DOCTYPE html>\n<html>\n<head>\n    <title>My App</title>\n</head>\n<body>\n    <h1>Hello World</h1>\n</body>\n</html>', language: 'html' },
  ])
  const [activeFile, setActiveFile] = useState(0)
  const [aiMessages, setAiMessages] = useState<Array<{ id: string; role: 'user' | 'assistant'; content: string; timestamp: Date }>>([])
  const [aiInput, setAiInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showNewFileDialog, setShowNewFileDialog] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const aiMessagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createSupabaseClient()
  
  // Coding mode always uses Luna agent
  const codingAgent = 'luna'

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [files[activeFile]?.content])

  useEffect(() => {
    aiMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [aiMessages])

  const handleAiSend = async () => {
    if (!aiInput.trim() || loading) return

    // Check message limit for free users
    if (!userPlan?.isUnlimited) {
      try {
        const { canSend } = await canSendMessage(user)
        if (!canSend) {
          if (onShowPremiumModal) {
            onShowPremiumModal(
              'Daily Limit Reached',
              'You\'ve reached your daily message limit. Upgrade to Premium for unlimited access.'
            )
          }
          return
        }
      } catch (error) {
        console.error('Error checking message limit:', error)
      }
    }

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: aiInput.trim(),
      timestamp: new Date(),
    }

    setAiMessages(prev => [...prev, userMessage])
    setAiInput('')
    setLoading(true)

    try {
      // Include current file context in the message
      const contextMessage = `Current file: ${files[activeFile].name}\n\n${files[activeFile].content.substring(0, 500)}...`
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...aiMessages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: `${contextMessage}\n\nUser request: ${aiInput.trim()}` }
          ],
          userId: user.id,
          agent: codingAgent, // Always use Luna agent for coding
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.response || 'Failed to get response')
      }

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: data.response || 'I apologize, but I couldn\'t generate a response.',
        timestamp: new Date(),
      }

      setAiMessages(prev => [...prev, aiMessage])

      // Try to extract code blocks from the response
      const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
      const matches = [...data.response.matchAll(codeBlockRegex)]
      
      if (matches.length > 0) {
        matches.forEach((match, idx) => {
          const language = match[1] || detectLanguage(files[activeFile].name)
          const code = match[2]
          const fileName = match[1] ? `generated-${idx + 1}.${match[1]}` : `generated-${idx + 1}.txt`
          
          // Check if file already exists
          const existingIndex = files.findIndex(f => f.name === fileName)
          if (existingIndex >= 0) {
            // Update existing file
            setFiles(prev => prev.map((f, i) => 
              i === existingIndex ? { ...f, content: code, language } : f
            ))
          } else {
            // Create new file
            setFiles(prev => [...prev, { name: fileName, content: code, language }])
            setActiveFile(files.length)
          }
        })
      }

      // Record message count
      try {
        await supabase.from('user_messages').insert({
          user_id: user.id,
          created_at: new Date().toISOString(),
        })
      } catch (error) {
        console.warn('Could not record message count:', error)
      }
    } catch (error) {
      console.error('Error calling AI:', error)
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: error instanceof Error ? error.message : 'An error occurred. Please try again.',
        timestamp: new Date(),
      }
      setAiMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const createNewFile = () => {
    if (!newFileName.trim()) return
    
    const language = detectLanguage(newFileName)
    const newFile: File = {
      name: newFileName.trim(),
      content: '',
      language,
    }
    
    setFiles(prev => [...prev, newFile])
    setActiveFile(files.length)
    setNewFileName('')
    setShowNewFileDialog(false)
  }

  const deleteFile = (index: number) => {
    if (files.length === 1) {
      alert('Cannot delete the last file')
      return
    }
    
    if (confirm(`Delete ${files[index].name}?`)) {
      setFiles(prev => prev.filter((_, i) => i !== index))
      if (activeFile >= files.length - 1) {
        setActiveFile(Math.max(0, activeFile - 1))
      }
    }
  }

  return (
    <div className="flex h-full bg-[var(--bg-primary)]">
      {/* Code Editor Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* File Tabs */}
        <div className="border-b border-[var(--border-primary)] bg-[var(--bg-elevated)] flex items-center gap-1 overflow-x-auto px-2 flex-shrink-0">
          {files.map((file, index) => (
            <button
              key={index}
              onClick={() => setActiveFile(index)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 flex-shrink-0 ${
                activeFile === index
                  ? 'border-[var(--accent-primary)] text-[var(--accent-primary)] bg-[var(--bg-primary)]'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <span>{file.name}</span>
              {files.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteFile(index)
                  }}
                  className="hover:text-red-400 transition-colors"
                >
                  ×
                </button>
              )}
            </button>
          ))}
          <button
            onClick={() => setShowNewFileDialog(true)}
            className="px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-b-2 border-transparent flex-shrink-0"
          >
            + New File
          </button>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-auto">
          {files[activeFile] && (
            <textarea
              ref={textareaRef}
              value={files[activeFile].content}
              onChange={(e) => {
                setFiles(prev => prev.map((f, i) => 
                  i === activeFile ? { ...f, content: e.target.value } : f
                ))
              }}
              placeholder="Start coding here..."
              className="w-full h-full min-h-[500px] bg-[var(--bg-primary)] text-[var(--text-primary)] resize-none outline-none p-6 font-mono text-sm leading-relaxed"
              style={{
                tabSize: 2,
              }}
              spellCheck={false}
            />
          )}
        </div>

        {/* Status Bar */}
        <div className="border-t border-[var(--border-primary)] px-4 py-2 bg-[var(--bg-elevated)] flex items-center justify-between text-xs text-[var(--text-secondary)] flex-shrink-0">
          <div className="flex items-center gap-4">
            <span>{files[activeFile]?.language || 'plaintext'}</span>
            <span>{files[activeFile]?.content.length || 0} characters</span>
            <span>{files[activeFile]?.content.split('\n').length || 0} lines</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(files[activeFile]?.content || '')
                alert('Code copied to clipboard!')
              }}
              className="px-3 py-1 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded hover:border-[var(--accent-primary)] transition-colors"
            >
              Copy
            </button>
            <button
              onClick={async () => {
                try {
                  if (files.length === 0) {
                    alert('No files to download')
                    return
                  }
                  
                  const zip = new JSZip()
                  const folder = zip.folder('Duna AI')
                  
                  if (!folder) {
                    alert('Error creating zip folder')
                    return
                  }
                  
                  files.forEach(file => {
                    folder.file(file.name, file.content)
                  })
                  
                  const blob = await zip.generateAsync({ type: 'blob' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'Duna AI.zip'
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                  URL.revokeObjectURL(url)
                } catch (error) {
                  console.error('Error downloading files:', error)
                  alert('Error downloading files. Please try again.')
                }
              }}
              className="px-3 py-1 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white rounded hover:opacity-90 transition-opacity font-semibold"
            >
              Download All
            </button>
            {onBackToChat && (
              <button
                onClick={onBackToChat}
                className="px-3 py-1 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded hover:border-[var(--accent-primary)] transition-colors"
              >
                ← Back to Chat
              </button>
            )}
          </div>
        </div>
      </div>

      {/* AI Assistant Sidebar */}
      <div className="w-96 border-l border-[var(--border-primary)] flex flex-col bg-[var(--bg-elevated)] flex-shrink-0">
        <div className="border-b border-[var(--border-primary)] px-4 py-3 glass flex-shrink-0">
          <h3 className="text-base font-semibold text-[var(--text-primary)]">AI Coding Assistant</h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Ask me to write code, fix bugs, or explain code</p>
        </div>

        {/* AI Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
          {aiMessages.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-[var(--text-secondary)]">
                Ask me to write code, create files, fix bugs, or explain code. I'll generate code directly into your editor!
              </p>
            </div>
          )}

          {aiMessages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                  message.role === 'user'
                    ? 'bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20'
                    : 'bg-[var(--bg-primary)] border border-[var(--border-primary)]'
                }`}
              >
                <div className="text-[var(--text-primary)]">
                  <MarkdownRenderer content={message.content} />
                </div>
                <p className="text-xs mt-1 text-[var(--text-tertiary)]">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-[var(--border-secondary)] border-t-[var(--accent-primary)] rounded-full animate-spin"></div>
                  <span className="text-xs text-[var(--text-secondary)]">Coding...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={aiMessagesEndRef} />
        </div>

        {/* AI Input */}
        <div className="border-t border-[var(--border-primary)] px-4 py-3 glass flex-shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleAiSend()
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder="Ask to write code..."
              className="flex-1 px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:border-[var(--accent-primary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !aiInput.trim()}
              className="px-4 py-2 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
            >
              Send
            </button>
          </form>
        </div>
      </div>

      {/* New File Dialog */}
      {showNewFileDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-lg p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Create New File</h3>
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="filename.js, index.html, etc."
              className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:border-[var(--accent-primary)] text-[var(--text-primary)] mb-4"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  createNewFile()
                } else if (e.key === 'Escape') {
                  setShowNewFileDialog(false)
                }
              }}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowNewFileDialog(false)}
                className="px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)]"
              >
                Cancel
              </button>
              <button
                onClick={createNewFile}
                className="px-4 py-2 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white rounded-lg"
              >
                Create
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

