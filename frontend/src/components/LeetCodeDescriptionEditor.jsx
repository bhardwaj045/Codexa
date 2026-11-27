import React, { useState, useRef } from 'react';
import { 
  Heading1, 
  Heading2, 
  Heading3, 
  Bold, 
  Italic, 
  Code, 
  FileCode, 
  List, 
  ListOrdered, 
  Table, 
  Sigma, 
  Quote, 
  Eye, 
  Edit3, 
  Sparkles,
  HelpCircle
} from 'lucide-react';

export const ProblemDescriptionEditor = ({
  value = '',
  onChange,
  placeholder = 'Write problem description, background, and task requirements...',
  rows = 10
}) => {
  const [tab, setTab] = useState('editor'); // 'editor' | 'preview'
  const textareaRef = useRef(null);

  const insertText = (before, after = '', defaultText = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end) || defaultText;
    const replacement = `${before}${selected}${after}`;

    const newValue = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + before.length;
      textarea.selectionEnd = start + before.length + selected.length;
    }, 0);
  };

  const insertExampleTemplate = () => {
    const template = `\n### Example 1:\n**Input:** nums = [2,7,11,15], target = 9\n**Output:** [0,1]\n**Explanation:** Because nums[0] + nums[1] == 9, we return [0, 1].\n`;
    insertText('', '', template);
  };

  const insertConstraintsTemplate = () => {
    const template = `\n### Constraints:\n- 1 <= nums.length <= 10^5\n- -10^9 <= nums[i] <= 10^9\n- Only one valid answer exists.\n`;
    insertText('', '', template);
  };

  const insertTableTemplate = () => {
    const template = `\n| Input Format | Expected Type | Description |\n|---|---|---|\n| nums | int[] | Array of integers |\n| target | int | Target sum |\n`;
    insertText('', '', template);
  };

  // Simple Markdown Parser for Preview Tab
  const renderMarkdown = (text) => {
    if (!text) return <p className="text-slate-400 italic">No description provided yet.</p>;

    const lines = text.split('\n');
    const elements = [];
    let inCodeBlock = false;
    let codeBlockContent = [];
    let codeBlockLang = '';

    lines.forEach((line, idx) => {
      // Code blocks
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre key={`code-${idx}`} className="p-4 rounded-xl bg-slate-900 text-emerald-300 font-mono text-xs overflow-x-auto my-3 border border-slate-800">
              <code>{codeBlockContent.join('\n')}</code>
            </pre>
          );
          codeBlockContent = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
          codeBlockLang = line.trim().replace('```', '');
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        return;
      }

      // Headings
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={idx} className="text-base font-extrabold text-slate-900 mt-4 mb-2">
            {line.replace('### ', '')}
          </h3>
        );
        return;
      }
      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={idx} className="text-lg font-extrabold text-slate-900 mt-5 mb-2 pb-1 border-b border-slate-200">
            {line.replace('## ', '')}
          </h2>
        );
        return;
      }
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={idx} className="text-xl font-black text-slate-900 mt-6 mb-3">
            {line.replace('# ', '')}
          </h1>
        );
        return;
      }

      // Bullet lists
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        elements.push(
          <li key={idx} className="ml-5 list-disc text-sm text-slate-700 font-normal leading-relaxed">
            {renderInlineMarkdown(line.replace(/^[-*]\s+/, ''))}
          </li>
        );
        return;
      }

      // Numbered list
      if (/^\d+\.\s/.test(line.trim())) {
        elements.push(
          <li key={idx} className="ml-5 list-decimal text-sm text-slate-700 font-normal leading-relaxed">
            {renderInlineMarkdown(line.replace(/^\d+\.\s+/, ''))}
          </li>
        );
        return;
      }

      // Quotes
      if (line.startsWith('> ')) {
        elements.push(
          <blockquote key={idx} className="border-l-4 border-[#0D684D] pl-3 py-1 my-2 bg-emerald-50/50 rounded-r text-sm text-slate-700 italic">
            {renderInlineMarkdown(line.replace('> ', ''))}
          </blockquote>
        );
        return;
      }

      // Tables
      if (line.includes('|')) {
        elements.push(
          <div key={idx} className="font-mono text-xs text-slate-800 bg-slate-50 px-2 py-1 my-0.5 border-l-2 border-slate-300">
            {line}
          </div>
        );
        return;
      }

      // Empty line
      if (!line.trim()) {
        elements.push(<div key={idx} className="h-2"></div>);
        return;
      }

      // Paragraph
      elements.push(
        <p key={idx} className="text-sm text-slate-700 leading-relaxed font-normal">
          {renderInlineMarkdown(line)}
        </p>
      );
    });

    return elements;
  };

  const renderInlineMarkdown = (str) => {
    // Math expression $...$
    const parts = [];
    const tokens = str.split(/(\$[^\$]+\$|`[^`]+`|\*\*[^\*]+\*\*|\*[^\*]+\*)/g);

    tokens.forEach((token, i) => {
      if (token.startsWith('$') && token.endsWith('$')) {
        parts.push(
          <span key={i} className="font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-xs font-bold border border-emerald-200">
            {token.slice(1, -1)}
          </span>
        );
      } else if (token.startsWith('`') && token.endsWith('`')) {
        parts.push(
          <code key={i} className="font-mono text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded text-xs font-semibold border border-slate-200">
            {token.slice(1, -1)}
          </code>
        );
      } else if (token.startsWith('**') && token.endsWith('**')) {
        parts.push(
          <strong key={i} className="font-bold text-slate-900">
            {token.slice(2, -2)}
          </strong>
        );
      } else if (token.startsWith('*') && token.endsWith('*')) {
        parts.push(
          <em key={i} className="italic text-slate-800">
            {token.slice(1, -1)}
          </em>
        );
      } else {
        parts.push(token);
      }
    });

    return parts;
  };

  return (
    <div className="rounded-2xl border-2 border-slate-400 overflow-hidden bg-white shadow-xs">
      {/* TOOLBAR HEADER - Clean header with Write/Preview without formatting snippet bar */}
      <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-300 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Edit3 className="w-4 h-4 text-[#0D684D]" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Problem Statement Editor</span>
        </div>

        {/* View Switcher: Editor / Live Preview */}
        <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-300 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setTab('editor')}
            className={`flex items-center gap-1 px-3 py-1 rounded-md transition-all ${
              tab === 'editor'
                ? 'bg-slate-900 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Write</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('preview')}
            className={`flex items-center gap-1 px-3 py-1 rounded-md transition-all ${
              tab === 'preview'
                ? 'bg-slate-900 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {/* BODY CONTENT */}
      {tab === 'editor' ? (
        <textarea
          ref={textareaRef}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ color: '#0f172a', backgroundColor: '#ffffff', opacity: 1, caretColor: '#0f172a' }}
          className="w-full p-4 text-sm font-semibold text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none leading-relaxed resize-y font-sans selection:bg-[#0D684D] selection:text-white"
        />
      ) : (
        <div className="p-5 min-h-[220px] bg-slate-50/50 space-y-2 overflow-y-auto max-h-[500px]">
          {renderMarkdown(value)}
        </div>
      )}
    </div>
  );
};

export const LeetCodeDescriptionEditor = ProblemDescriptionEditor;
