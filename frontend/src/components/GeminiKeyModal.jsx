import { useState, useEffect } from 'react'

export default function GeminiKeyModal({ isOpen, onClose, onSave }) {
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')

  useEffect(() => {
    if (isOpen) {
      const savedKey = localStorage.getItem('ARMOR_GEMINI_API_KEY') || import.meta.env.VITE_GEMINI_API_KEY || ''
      setApiKey(savedKey)
      setStatusMsg('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSave = () => {
    localStorage.setItem('ARMOR_GEMINI_API_KEY', apiKey.trim())
    setStatusMsg('Key saved to local browser context successfully!')
    if (onSave) onSave(apiKey.trim())
    setTimeout(() => {
      onClose()
    }, 1000)
  }

  const handleClear = () => {
    localStorage.removeItem('ARMOR_GEMINI_API_KEY')
    setApiKey('')
    setStatusMsg('Key cleared. Dashboard will use built-in tactical simulation engine.')
    if (onSave) onSave('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-surface-container-low border border-primary/40 rounded-xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>

        <div className="flex justify-between items-center pb-4 border-b border-outline-variant/30 mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">auto_awesome</span>
            <h3 className="font-headline-md text-lg text-primary font-bold tracking-wide">GEMINI AI INTEGRATION</h3>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-primary transition-colors p-1 rounded"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <p className="text-sm text-on-surface-variant mb-4 leading-relaxed">
          Enter your Gemini API key below to unlock live Google Gemini AI multi-modal engine parameter analysis and visual component crack detection.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-label-caps text-primary mb-1">
              GEMINI_API_KEY (VITE_GEMINI_API_KEY)
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded px-3 py-2 text-sm text-on-surface font-data-numeric focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-2.5 text-on-surface-variant hover:text-primary text-sm"
              >
                <span className="material-symbols-outlined text-sm">{showKey ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
          </div>

          {statusMsg && (
            <div className="p-3 bg-primary/10 border border-primary/30 rounded text-xs font-label-caps text-primary">
              {statusMsg}
            </div>
          )}

          <div className="bg-surface-container-highest/30 p-3 rounded border border-outline-variant/20 text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-secondary font-bold">
              <span className="material-symbols-outlined text-sm">info</span>
              <span>TACTICAL HYBRID ENGINE</span>
            </div>
            <p className="text-on-surface-variant text-[11px]">
              If no key is specified or quota is reached, ARMOR-DT automatically runs the built-in military grade simulation heuristics with zero downtime.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-outline-variant/30">
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-error/10 hover:bg-error/20 border border-error/30 text-error text-xs font-label-caps rounded transition-colors"
          >
            CLEAR KEY
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-surface-container-highest text-on-surface hover:bg-surface-bright text-xs font-label-caps rounded transition-colors"
          >
            CANCEL
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-primary text-on-primary font-bold hover:bg-primary-fixed text-xs font-label-caps rounded transition-all shadow-md hover:scale-[1.02] active:scale-95"
          >
            SAVE CONFIG
          </button>
        </div>
      </div>
    </div>
  )
}
