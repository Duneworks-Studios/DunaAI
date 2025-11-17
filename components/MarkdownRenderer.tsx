'use client'

import React from 'react'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  // Simple markdown parser for basic formatting
  const parseMarkdown = (text: string): React.ReactNode[] => {
    const lines = text.split('\n')
    const elements: React.ReactNode[] = []
    let currentParagraph: string[] = []
    let inList = false
    let listItems: string[] = []

    const processParagraph = (para: string[]) => {
      if (para.length === 0) return null
      
      const paraText = para.join('\n')
      return <p key={elements.length} className="mb-3 last:mb-0">{renderInlineMarkdown(paraText)}</p>
    }

    const processList = () => {
      if (listItems.length === 0) return null
      
      const items = listItems.map((item, idx) => {
        // Remove list markers (-, *, 1., etc.)
        const cleanItem = item.replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, '')
        return (
          <li key={idx} className="mb-1 ml-4">
            {renderInlineMarkdown(cleanItem)}
          </li>
        )
      })
      
      return <ul key={elements.length} className="list-disc mb-3 ml-4 space-y-1">{items}</ul>
    }

    lines.forEach((line, index) => {
      const trimmed = line.trim()
      
      // Headings
      if (trimmed.startsWith('# ')) {
        if (inList) {
          elements.push(processList())
          listItems = []
          inList = false
        }
        if (currentParagraph.length > 0) {
          elements.push(processParagraph(currentParagraph))
          currentParagraph = []
        }
        elements.push(
          <h1 key={elements.length} className="text-xl font-bold mb-2 mt-4 first:mt-0">
            {renderInlineMarkdown(trimmed.substring(2))}
          </h1>
        )
        return
      }
      
      if (trimmed.startsWith('## ')) {
        if (inList) {
          elements.push(processList())
          listItems = []
          inList = false
        }
        if (currentParagraph.length > 0) {
          elements.push(processParagraph(currentParagraph))
          currentParagraph = []
        }
        elements.push(
          <h2 key={elements.length} className="text-lg font-bold mb-2 mt-4 first:mt-0">
            {renderInlineMarkdown(trimmed.substring(3))}
          </h2>
        )
        return
      }
      
      if (trimmed.startsWith('### ')) {
        if (inList) {
          elements.push(processList())
          listItems = []
          inList = false
        }
        if (currentParagraph.length > 0) {
          elements.push(processParagraph(currentParagraph))
          currentParagraph = []
        }
        elements.push(
          <h3 key={elements.length} className="text-base font-bold mb-2 mt-4 first:mt-0">
            {renderInlineMarkdown(trimmed.substring(4))}
          </h3>
        )
        return
      }
      
      // Lists
      if (trimmed.match(/^[-*]\s+/) || trimmed.match(/^\d+\.\s+/)) {
        if (currentParagraph.length > 0) {
          elements.push(processParagraph(currentParagraph))
          currentParagraph = []
        }
        listItems.push(trimmed)
        inList = true
        return
      }
      
      // Empty line
      if (trimmed === '') {
        if (inList) {
          elements.push(processList())
          listItems = []
          inList = false
        } else if (currentParagraph.length > 0) {
          elements.push(processParagraph(currentParagraph))
          currentParagraph = []
        }
        return
      }
      
      // Regular paragraph line
      if (inList) {
        elements.push(processList())
        listItems = []
        inList = false
      }
      currentParagraph.push(line)
    })
    
    // Process remaining content
    if (inList) {
      elements.push(processList())
    }
    if (currentParagraph.length > 0) {
      elements.push(processParagraph(currentParagraph))
    }
    
    return elements.length > 0 ? elements : [<p key="empty">{text}</p>]
  }

  // Render inline markdown (bold, italic, code)
  const renderInlineMarkdown = (text: string): React.ReactNode[] => {
    if (!text) return [text]
    
    const parts: React.ReactNode[] = []
    let currentIndex = 0
    let key = 0
    let i = 0
    
    while (i < text.length) {
      // Check for ***bold italic*** (must check before **bold**)
      if (text.substring(i, i + 3) === '***') {
        const endIdx = text.indexOf('***', i + 3)
        if (endIdx !== -1) {
          // Add text before
          if (i > currentIndex) {
            parts.push(<span key={key++}>{text.substring(currentIndex, i)}</span>)
          }
          // Add bold italic
          const content = text.substring(i + 3, endIdx)
          parts.push(
            <strong key={key++} className="font-bold italic">
              {content}
            </strong>
          )
          currentIndex = endIdx + 3
          i = endIdx + 3
          continue
        }
      }
      
      // Check for **bold**
      if (text.substring(i, i + 2) === '**') {
        const endIdx = text.indexOf('**', i + 2)
        if (endIdx !== -1) {
          // Add text before
          if (i > currentIndex) {
            parts.push(<span key={key++}>{text.substring(currentIndex, i)}</span>)
          }
          // Add bold
          const content = text.substring(i + 2, endIdx)
          parts.push(
            <strong key={key++} className="font-bold">
              {content}
            </strong>
          )
          currentIndex = endIdx + 2
          i = endIdx + 2
          continue
        }
      }
      
      // Check for `code`
      if (text[i] === '`') {
        const endIdx = text.indexOf('`', i + 1)
        if (endIdx !== -1) {
          // Add text before
          if (i > currentIndex) {
            parts.push(<span key={key++}>{text.substring(currentIndex, i)}</span>)
          }
          // Add code
          const content = text.substring(i + 1, endIdx)
          parts.push(
            <code key={key++} className="bg-[var(--bg-tertiary)] px-1.5 py-0.5 rounded text-xs font-mono">
              {content}
            </code>
          )
          currentIndex = endIdx + 1
          i = endIdx + 1
          continue
        }
      }
      
      // Check for *italic* (only if not part of ** or ***)
      if (text[i] === '*' && text.substring(i, i + 2) !== '**') {
        const endIdx = text.indexOf('*', i + 1)
        if (endIdx !== -1 && (endIdx === i + 1 || endIdx + 1 >= text.length || text[endIdx + 1] !== '*')) {
          // Add text before
          if (i > currentIndex) {
            parts.push(<span key={key++}>{text.substring(currentIndex, i)}</span>)
          }
          // Add italic
          const content = text.substring(i + 1, endIdx)
          parts.push(
            <em key={key++} className="italic">
              {content}
            </em>
          )
          currentIndex = endIdx + 1
          i = endIdx + 1
          continue
        }
      }
      
      i++
    }
    
    // Add remaining text
    if (currentIndex < text.length) {
      parts.push(<span key={key++}>{text.substring(currentIndex)}</span>)
    }
    
    return parts.length > 0 ? parts : [text]
  }

  return (
    <div className={`whitespace-pre-wrap leading-relaxed break-words ${className}`}>
      {parseMarkdown(content)}
    </div>
  )
}

