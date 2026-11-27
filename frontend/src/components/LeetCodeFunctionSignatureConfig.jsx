import React, { useState, useEffect } from 'react';
import { 
  SUPPORTED_LANGUAGES, 
  DATA_TYPES, 
  generateAllTemplates 
} from '../utils/codeSignatureGenerator';
import { 
  Code2, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Check, 
  Copy, 
  Sparkles, 
  Sliders, 
  Layers, 
  Settings2,
  FileCode,
  Edit3
} from 'lucide-react';

export const FunctionSignatureConfig = ({
  config,
  initialFunctionName = '',
  initialReturnType = 'int',
  initialParameters = [],
  initialTemplates = null,
  problemTitle = '',
  onChange
}) => {
  const [functionName, setFunctionName] = useState(() => config?.functionName ?? initialFunctionName ?? '');
  const [returnType, setReturnType] = useState(() => config?.returnType ?? initialReturnType ?? 'int');
  const [parameters, setParameters] = useState(() => config?.parameters ?? initialParameters ?? []);
  const [selectedLanguage, setSelectedLanguage] = useState('JAVA');
  const [templates, setTemplates] = useState({});
  const [isManualEdit, setIsManualEdit] = useState({
    JAVA: false,
    CPP: false,
    C: false,
    PYTHON: false,
    JAVASCRIPT: false
  });
  const [copied, setCopied] = useState(false);

  // Sync internal state if config prop updates from parent (e.g., resetNewProblemForm or loading problem)
  useEffect(() => {
    if (config) {
      if (config.functionName !== undefined && config.functionName !== functionName) {
        setFunctionName(config.functionName || '');
      }
      if (config.returnType !== undefined && config.returnType !== returnType) {
        setReturnType(config.returnType || 'int');
      }
      if (config.parameters !== undefined) {
        setParameters(config.parameters || []);
      }
      if (config.templates) {
        setTemplates(config.templates);
      }
    }
  }, [config]);

  // Initialize templates from props or compute
  useEffect(() => {
    if (initialTemplates && Object.keys(initialTemplates).length > 0) {
      setTemplates(initialTemplates);
    } else if (functionName.trim()) {
      recomputeTemplates(functionName, returnType, parameters);
    }
  }, []);

  // Whenever function configuration changes, recompute templates (for languages not locked in manual edit)
  const recomputeTemplates = (fn, ret, params) => {
    if (!fn || !fn.trim()) {
      const emptyTemplates = {
        JAVA: '',
        CPP: '',
        C: '',
        PYTHON: '',
        JAVASCRIPT: ''
      };
      setTemplates(emptyTemplates);
      if (onChange) {
        onChange({
          functionName: '',
          returnType: ret,
          parameters: params,
          templates: emptyTemplates,
          primaryStarterCode: ''
        });
      }
      return;
    }

    const generated = generateAllTemplates({
      functionName: fn.trim(),
      returnType: ret,
      parameters: params
    });

    setTemplates(prev => {
      const updated = { ...generated };
      // Preserve manual edits if admin explicitly edited a language
      Object.keys(prev).forEach(lang => {
        if (isManualEdit[lang] && prev[lang]) {
          updated[lang] = prev[lang];
        }
      });
      if (onChange) {
        onChange({
          functionName: fn,
          returnType: ret,
          parameters: params,
          templates: updated,
          primaryStarterCode: updated.JAVA || updated.PYTHON || Object.values(updated)[0]
        });
      }
      return updated;
    });
  };

  const handleFunctionNameChange = (val) => {
    setFunctionName(val);
    recomputeTemplates(val, returnType, parameters);
  };

  const handleReturnTypeChange = (val) => {
    setReturnType(val);
    recomputeTemplates(functionName, val, parameters);
  };

  // Parameter manipulations
  const handleAddParameter = () => {
    const newParam = { name: `param${parameters.length + 1}`, type: 'int' };
    const updated = [...parameters, newParam];
    setParameters(updated);
    recomputeTemplates(functionName, returnType, updated);
  };

  const handleRemoveParameter = (idx) => {
    const updated = parameters.filter((_, i) => i !== idx);
    setParameters(updated);
    recomputeTemplates(functionName, returnType, updated);
  };

  const handleParamChange = (idx, field, value) => {
    const updated = [...parameters];
    updated[idx] = { ...updated[idx], [field]: value };
    setParameters(updated);
    recomputeTemplates(functionName, returnType, updated);
  };

  // Manual code editor updates
  const handleCodeChange = (lang, newCode) => {
    setIsManualEdit(prev => ({ ...prev, [lang]: true }));
    setTemplates(prev => {
      const updated = { ...prev, [lang]: newCode };
      if (onChange) {
        onChange({
          functionName,
          returnType,
          parameters,
          templates: updated,
          primaryStarterCode: updated.JAVA || updated.PYTHON
        });
      }
      return updated;
    });
  };

  const resetLanguageToAuto = (lang) => {
    setIsManualEdit(prev => ({ ...prev, [lang]: false }));
    const generated = generateAllTemplates({ functionName, returnType, parameters });
    setTemplates(prev => {
      const updated = { ...prev, [lang]: generated[lang] };
      if (onChange) {
        onChange({
          functionName,
          returnType,
          parameters,
          templates: updated,
          primaryStarterCode: updated.JAVA || updated.PYTHON
        });
      }
      return updated;
    });
  };

  const handleCopy = () => {
    const code = templates[selectedLanguage] || '';
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* FUNCTION CONFIGURATION PANEL */}
      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-300 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0D684D] text-white flex items-center justify-center font-bold">
              <Settings2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">
                Dynamic Function Signature Configuration
              </h4>
              <p className="text-xs text-slate-500">
                Configure method name, parameters, and return type. Templates for all 5 languages update automatically.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => recomputeTemplates(functionName, returnType, parameters)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold shadow-2xs transition-all"
            title="Re-generate all language signatures"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#0D684D]" />
            <span>Regenerate Signatures</span>
          </button>
        </div>

        {/* Function Name & Return Type Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Function / Method Name *
            </label>
            <input
              type="text"
              required
              value={functionName}
              onChange={(e) => handleFunctionNameChange(e.target.value)}
              placeholder="e.g. twoSum, maxSubArray, isPalindrome"
              style={{ color: '#0f172a', backgroundColor: '#ffffff', opacity: 1 }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-mono text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Return Type *
            </label>
            <select
              value={returnType}
              onChange={(e) => handleReturnTypeChange(e.target.value)}
              style={{ color: '#0f172a', backgroundColor: '#ffffff', opacity: 1 }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-mono text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {DATA_TYPES.map(t => (
                <option key={t.id} value={t.id} style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic Parameter Fields */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Function Parameters ({parameters.length})
            </label>
            <button
              type="button"
              onClick={handleAddParameter}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-[#0D684D] hover:bg-emerald-100 text-xs font-bold transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Parameter</span>
            </button>
          </div>

          {parameters.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-white text-center text-xs text-slate-500">
              No parameters configured. Click "Add Parameter" if the function accepts inputs.
            </div>
          ) : (
            <div className="space-y-2.5">
              {parameters.map((param, pIdx) => (
                <div 
                  key={pIdx} 
                  className="p-3 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-300 text-slate-600 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                      {pIdx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-700">Param {pIdx + 1}:</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                    <div>
                      <input
                        type="text"
                        value={param.name}
                        onChange={(e) => handleParamChange(pIdx, 'name', e.target.value)}
                        placeholder="Parameter Name (e.g. nums)"
                        style={{ color: '#0f172a', backgroundColor: '#ffffff', opacity: 1 }}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-mono text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <select
                        value={param.type}
                        onChange={(e) => handleParamChange(pIdx, 'type', e.target.value)}
                        style={{ color: '#0f172a', backgroundColor: '#ffffff', opacity: 1 }}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-mono text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        {DATA_TYPES.filter(t => t.id !== 'void').map(t => (
                          <option key={t.id} value={t.id} style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveParameter(pIdx)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors self-end sm:self-center"
                    title="Remove parameter"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* LANGUAGE STARTER CODE PREVIEW & EDIT SECTION */}
      <div className="rounded-2xl border-2 border-slate-400 overflow-hidden bg-white shadow-xs">
        {/* Languages Tabs Bar */}
        <div className="px-4 py-2.5 bg-slate-100 flex flex-wrap items-center justify-between gap-3 text-slate-900 border-b border-slate-300">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider mr-2 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-[#0D684D]" />
              <span>Language:</span>
            </span>

            {SUPPORTED_LANGUAGES.map(lang => {
              const active = selectedLanguage === lang.id;
              const hasManual = isManualEdit[lang.id];
              return (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => setSelectedLanguage(lang.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    active
                      ? 'bg-[#0D684D] text-white shadow-xs font-bold'
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:text-slate-900 font-semibold'
                  }`}
                >
                  <span>{lang.name}</span>
                  {hasManual && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Customized by Admin"></span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {isManualEdit[selectedLanguage] && (
              <button
                type="button"
                onClick={() => resetLanguageToAuto(selectedLanguage)}
                className="text-xs text-amber-600 hover:text-amber-800 underline font-bold cursor-pointer"
              >
                Reset to Auto
              </button>
            )}

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              title="Copy code"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>
        </div>

        {/* Code Editor Window */}
        <div className="relative bg-white">
          <div className="px-4 py-2 bg-slate-50 text-slate-600 font-mono text-[11px] flex items-center justify-between border-b border-slate-200">
            <span className="flex items-center gap-1.5 text-emerald-800 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {isManualEdit[selectedLanguage] 
                  ? 'Customized by Admin (Manual Edit)' 
                  : 'Auto-Generated Function Signature & Starter Code'}
              </span>
            </span>
            <span className="font-semibold text-slate-500">solution.{SUPPORTED_LANGUAGES.find(l => l.id === selectedLanguage)?.ext || 'txt'}</span>
          </div>

          <textarea
            rows={10}
            value={templates[selectedLanguage] || ''}
            onChange={(e) => handleCodeChange(selectedLanguage, e.target.value)}
            placeholder="// Starter code appears here automatically..."
            spellCheck="false"
            style={{ color: '#0f172a', backgroundColor: '#ffffff', opacity: 1 }}
            className="w-full p-4 font-mono text-xs sm:text-sm leading-relaxed bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none resize-y font-semibold selection:bg-emerald-100"
          />
        </div>
      </div>
    </div>
  );
};

export const LeetCodeFunctionSignatureConfig = FunctionSignatureConfig;
