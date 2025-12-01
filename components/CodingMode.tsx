'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createSupabaseClient } from '@/lib/supabase'
import { getUserPlan, canSendMessage, type UserPlan } from '@/lib/planDetection'
import type { User } from '@supabase/supabase-js'
import MarkdownRenderer from './MarkdownRenderer'
import JSZip from 'jszip'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

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
  const requestTimeoutMs = Number(process.env.NEXT_PUBLIC_AI_TIMEOUT_MS) || 65000
  const maxGatewayRetries = Number(process.env.NEXT_PUBLIC_AI_GATEWAY_RETRIES ?? 1)

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
      const payload = {
        messages: [...aiMessages, userMessage].map(m => ({ role: m.role, content: m.content })),
        userId: user.id,
        agent: codingAgent,
      }

      const sendAiRequest = async (attempt = 0): Promise<{ response: string }> => {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), requestTimeoutMs)

        try {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal,
          })

          const contentType = response.headers.get('content-type') || ''
          const text = await response.text()
          const isHtml = contentType.includes('text/html') || text.trim().startsWith('<')
          let data: { response?: string; statusCode?: number }

          if (isHtml) {
            data = {
              response: '⚠️ The AI service is temporarily unavailable.\n\nThe service returned an invalid response. Please try again in a moment.',
              statusCode: response.status || 503,
            }
          } else {
            try {
              data = JSON.parse(text)
            } catch (parseError) {
              console.error('[Coding] Failed to parse JSON response:', parseError)
              data = {
                response: '⚠️ The AI service returned an invalid response. Please try again.',
                statusCode: response.status || 500,
              }
            }
          }

          const statusCode = data?.statusCode || response.status
          const isGatewayIssue = statusCode === 502 || statusCode === 503 || statusCode === 504

          if (isGatewayIssue && attempt < maxGatewayRetries) {
            console.warn('[Coding] Gateway error detected, retrying...', { statusCode, attempt })
            await new Promise(resolve => setTimeout(resolve, 400))
            return sendAiRequest(attempt + 1)
          }

          if (!response.ok) {
            throw new Error(data?.response || `API error: ${response.status} ${response.statusText}`)
          }

          if (!data || !data.response) {
            throw new Error('⚠️ The AI service returned an empty response. Please try again.')
          }

          return data as { response: string }
        } catch (err) {
          if (err instanceof DOMException && err.name === 'AbortError') {
            throw new Error('⚠️ The AI service took too long to respond. Please try again.')
          }
          throw err instanceof Error ? err : new Error('⚠️ Unexpected error contacting the AI service.')
        } finally {
          clearTimeout(timeoutId)
        }
      }

      const data = await sendAiRequest()

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
      console.error('[Coding] Error calling AI:', error)
      
      let errorContent = '⚠️ The AI service is temporarily unavailable.\n\nPlease wait a moment and try again.'
      
      if (error instanceof Error) {
        // If the error message already contains formatted content from API (starts with ⚠️ or contains markdown),
        // use it directly as it's already properly formatted
        if (error.message.includes('⚠️') || error.message.includes('**') || error.message.startsWith('🖼️') || error.message.includes('❌')) {
          errorContent = error.message
        } else if (error.name === 'AbortError' || error.message.includes('timeout')) {
          errorContent = '⚠️ The AI service is temporarily unavailable.\n\nThe request took too long to complete. This can happen on slower connections. Please wait 30-60 seconds and try again.'
        } else if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('Failed to fetch')) {
          errorContent = '⚠️ Network Error\n\nI couldn\'t connect to the AI service. Please check your internet connection and try again.'
        } else if (error.message.includes('502') || error.message.includes('503') || error.message.includes('504')) {
          errorContent = '⚠️ The AI service is temporarily unavailable.\n\nThe service gateway is experiencing temporary issues. Please wait 15-30 seconds and try again.'
        }
      }
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: errorContent,
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
        <div className="flex-1 overflow-auto relative bg-[#1e1e1e]" id="code-editor-container">
          {files[activeFile] && (
            <div className="relative w-full min-h-[500px]">
              <div className="flex">
                {/* Line Numbers */}
                <div className="w-12 bg-[#1e1e1e] border-r border-[#252526] text-right pr-3 py-6 font-mono text-xs text-[#858585] select-none flex-shrink-0">
                  {files[activeFile].content.split('\n').map((_, index) => (
                    <div key={index} className="leading-[1.5]">
                      {index + 1}
                    </div>
                  ))}
                  {files[activeFile].content.split('\n').length === 0 && (
                    <div className="leading-[1.5]">1</div>
                  )}
                </div>
                
                {/* Syntax Highlighted Code Display */}
                <div className="flex-1 relative">
                  <div className="relative min-h-full">
                    <SyntaxHighlighter
                      language={files[activeFile].language}
                      style={vscDarkPlus}
                      customStyle={{
                        margin: 0,
                        padding: '24px',
                        background: '#1e1e1e',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        fontFamily: 'Consolas, "Courier New", monospace',
                        minHeight: '100%',
                      }}
                      showLineNumbers={false}
                      PreTag="div"
                    >
                      {files[activeFile].content || ' '}
                    </SyntaxHighlighter>
                  </div>
                  
                  {/* Invisible Textarea Overlay for Editing */}
                  <textarea
                    ref={textareaRef}
                    value={files[activeFile].content}
                    onChange={(e) => {
                      setFiles(prev => prev.map((f, i) => 
                        i === activeFile ? { ...f, content: e.target.value } : f
                      ))
                    }}
                    placeholder="Start coding here..."
                    className="absolute inset-0 bg-transparent text-transparent resize-none outline-none p-6 font-mono text-sm leading-[1.5] z-20 caret-[#d4c4a0]"
                    style={{
                      tabSize: 2,
                      color: 'transparent',
                      caretColor: '#d4c4a0',
                      fontFamily: 'Consolas, "Courier New", monospace',
                    }}
                    spellCheck={false}
                  />
                </div>
              </div>
            </div>
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
              className="px-3 py-1 bg-[var(--accent-primary)] text-white rounded hover:bg-[var(--accent-hover)] transition-colors font-medium"
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
              className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--accent-primary)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-hover)] hover:border-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
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
                className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--accent-primary)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-hover)] hover:border-[var(--accent-hover)] transition-colors font-medium"
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

