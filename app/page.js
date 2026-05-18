'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '@/components/Header'
import SplitLayout from '@/components/SplitLayout'
import UploadZone from '@/components/UploadZone'
import ImagePreview from '@/components/ImagePreview'
import OptionsPanel from '@/components/OptionsPanel'
import OutputPanel from '@/components/OutputPanel'
import HistorySidebar from '@/components/HistorySidebar'
import RefinementChat from '@/components/RefinementChat'
import { useCodeGeneration } from '@/hooks/useCodeGeneration'
import { useHistory } from '@/hooks/useHistory'
import { useRefinement } from '@/hooks/useRefinement'

// ─── Ambient background ────────────────────────────────────────────────────────
function AmbientBackground() {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', overflow:'hidden' }}>
      <div style={{
        position:'absolute', inset:0,
        backgroundImage:'radial-gradient(circle, rgba(124,106,255,0.12) 1px, transparent 1px)',
        backgroundSize:'28px 28px',
        maskImage:'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
      }} />
      <motion.div
        animate={{ x:[0,30,0], y:[0,20,0], scale:[1,1.08,1] }}
        transition={{ duration:18, repeat:Infinity, ease:'easeInOut' }}
        style={{ position:'absolute', top:'-140px', left:'-100px', width:'560px', height:'560px', borderRadius:'50%', background:'radial-gradient(circle, rgba(124,106,255,0.07) 0%, transparent 70%)' }}
      />
      <motion.div
        animate={{ x:[0,-20,0], y:[0,-30,0], scale:[1,1.12,1] }}
        transition={{ duration:22, repeat:Infinity, ease:'easeInOut', delay:4 }}
        style={{ position:'absolute', bottom:'-120px', right:'-80px', width:'480px', height:'480px', borderRadius:'50%', background:'radial-gradient(circle, rgba(56,189,248,0.06) 0%, transparent 70%)' }}
      />
    </div>
  )
}

function SectionLabel({ number, text }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
      <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.8px', whiteSpace:'nowrap' }}>
        {number} / {text}
      </span>
      <div style={{ flex:1, height:'1px', background:'var(--border-subtle)' }} />
    </div>
  )
}

// ─── Left panel ────────────────────────────────────────────────────────────────
function LeftPanel({
  onGenerate, isLoading,
  initialImage, initialOptions,
  // Refinement props
  code, status, currentOptions,
  onCodeUpdate, onClearRefinement,
  onImageChange,
}) {
  const [image, setImage] = useState(initialImage || null)

  const handleSetImage = (img) => {
    setImage(img)
    if (onImageChange) onImageChange(img)
  }

  const handleRemove = () => {
    if (image?.url && image.url.startsWith('blob:')) URL.revokeObjectURL(image.url)
    setImage(null)
    if (onImageChange) onImageChange(null)
  }

  const isDone = status === 'done'

  // Refinement hook lives here so it has access to current image
  const {
    messages, isRefining, refine, clearMessages, cancelRefine,
  } = useRefinement({
    onCodeUpdate,
    framework: currentOptions?.framework || 'react',
    styling:   currentOptions?.styling   || 'tailwind',
  })

  const handleRefine = (instruction) => {
    refine({ instruction, currentCode: code, image })
  }

  const handleClearRefinement = () => {
    clearMessages()
    if (onClearRefinement) onClearRefinement()
  }

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren:0.08, delayChildren:0.15 } },
  }
  const itemVariants = {
    hidden:  { opacity:0, y:14 },
    visible: { opacity:1, y:0, transition:{ duration:0.45, ease:[0.23,1,0.32,1] } },
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      {/* Scrollable top section */}
      <div style={{ flex:1, overflow:'auto' }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ display:'flex', flexDirection:'column', gap:'16px', width:'100%', padding:'20px 20px 0' }}
        >
          <motion.div variants={itemVariants}><SectionLabel number="01" text="Upload Design" /></motion.div>

          <motion.div variants={itemVariants}>
            <AnimatePresence mode="wait">
              {image ? (
                <motion.div key="preview"
                  initial={{ opacity:0, scale:0.97, y:8 }}
                  animate={{ opacity:1, scale:1, y:0 }}
                  exit={{ opacity:0, scale:0.97, y:-8 }}
                  transition={{ duration:0.3, ease:[0.23,1,0.32,1] }}
                >
                  <ImagePreview image={image} onRemove={handleRemove} onReplace={handleRemove} />
                </motion.div>
              ) : (
                <motion.div key="upload"
                  initial={{ opacity:0, scale:0.97, y:8 }}
                  animate={{ opacity:1, scale:1, y:0 }}
                  exit={{ opacity:0, scale:0.97, y:-8 }}
                  transition={{ duration:0.3, ease:[0.23,1,0.32,1] }}
                >
                  <UploadZone onFileAccepted={handleSetImage} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div variants={itemVariants}><SectionLabel number="02" text="Configure" /></motion.div>

          <motion.div variants={itemVariants} style={{ paddingBottom: isDone ? '0' : '20px' }}>
            <OptionsPanel
              hasImage={!!image}
              isLoading={isLoading}
              initialOptions={initialOptions}
              onGenerate={(opts) => onGenerate({ image, ...opts })}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Refinement chat — sticks to bottom of left panel */}
      <AnimatePresence>
        {isDone && (
          <motion.div
            key="refine-chat"
            initial={{ opacity:0, y:20 }}
            animate={{ opacity:1, y:0 }}
            exit={{ opacity:0, y:20 }}
            transition={{ duration:0.35, ease:[0.23,1,0.32,1] }}
          >
            <RefinementChat
              isVisible={true}
              isRefining={isRefining}
              messages={messages}
              onRefine={handleRefine}
              onClear={handleClearRefinement}
              onCancel={cancelRefine}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main page ──────────────────────────────────────────────────────────────────
export default function HomePage() {
  const {
    code, files, status, error, tokenCount,
    isLoading, generate, cancel, reset, setCode, setStatus, setFileContent,
  } = useCodeGeneration()

  const { entries, saveEntry, deleteEntry, clearAll } = useHistory()

  const [activeTab,       setActiveTab]       = useState('code')
  const [lastPayload,     setLastPayload]      = useState(null)
  const [currentOptions,  setCurrentOptions]   = useState({ framework:'react', styling:'tailwind' })
  const [activeHistoryId, setActiveHistoryId]  = useState(null)
  const [historyOpen,     setHistoryOpen]      = useState(false)
  const [leftPanelKey,    setLeftPanelKey]     = useState(0)
  const [restoredImage,   setRestoredImage]    = useState(null)
  const [restoredOptions, setRestoredOptions]  = useState(null)
  const [currentImage,    setCurrentImage]     = useState(null) // live image for compare tab

  // ── Generate ────────────────────────────────────────────────────────────────
  const handleGenerate = useCallback((payload) => {
    setLastPayload(payload)
    setCurrentOptions({ framework: payload.framework, styling: payload.styling })
    setActiveTab('code')
    setActiveHistoryId(null)
    generate(payload)
  }, [generate])

  // Save to history when done
  const savedRef    = useRef(false)
  const prevStatus  = useRef(status)
  const codeRef     = useRef(code)
  const filesRef    = useRef(files)
  codeRef.current   = code
  filesRef.current  = files

  if (prevStatus.current !== status) {
    if (status === 'done' && lastPayload && !savedRef.current) {
      savedRef.current = true
      setTimeout(async () => {
        const id = await saveEntry({
          image:        lastPayload.image,
          framework:    lastPayload.framework,
          styling:      lastPayload.styling,
          instructions: lastPayload.instructions,
          code:         filesRef.current?.component || codeRef.current,
          files:        filesRef.current,
        })
        if (id) setActiveHistoryId(id)
        savedRef.current = false
      }, 100)
    }
    prevStatus.current = status
  }

  // ── Restore from history ────────────────────────────────────────────────────
  const handleRestore = useCallback((entry) => {
    const fakeImage = entry.imageDataURL
      ? { url: entry.imageDataURL, name: entry.imageName, size: 0, type: 'image/png', file: null }
      : null

    setRestoredImage(fakeImage)
    setCurrentImage(fakeImage)
    setRestoredOptions({ framework: entry.framework, styling: entry.styling, instructions: entry.instructions })
    setCurrentOptions({ framework: entry.framework, styling: entry.styling })
    setActiveHistoryId(entry.id)
    setActiveTab('code')
    setLeftPanelKey(k => k + 1)

    // Restore both the files object and the component code
    if (entry.files) {
      setFileContent('component', entry.files.component || '')
      setFileContent('styles',    entry.files.styles    || null)
      setFileContent('test',      entry.files.test      || '')
      setFileContent('index',     entry.files.index     || '')
    }
    setCode(entry.files?.component || entry.code || '')
    setStatus('done')

    if (window.innerWidth < 900) setHistoryOpen(false)
  }, [setCode, setStatus, setFileContent])

  const handleRetry = useCallback(() => {
    if (lastPayload) generate(lastPayload)
  }, [lastPayload, generate])

  const handleReset = useCallback(() => {
    reset()
    setActiveTab('code')
    setActiveHistoryId(null)
    setCurrentImage(null)
  }, [reset])

  return (
    <div style={{ position:'relative' }}>
      <AmbientBackground />

      <HistorySidebar
        entries={entries}
        activeId={activeHistoryId}
        onRestore={handleRestore}
        onDelete={deleteEntry}
        onClearAll={clearAll}
        isOpen={historyOpen}
        onToggle={() => setHistoryOpen(p => !p)}
      />

      <motion.div
        animate={{ marginLeft: historyOpen ? '280px' : '0px' }}
        transition={{ duration:0.3, ease:[0.23,1,0.32,1] }}
        style={{ position:'relative', zIndex:1 }}
      >
        <Header
          historyCount={entries.length}
          onOpenHistory={() => setHistoryOpen(p => !p)}
          historyOpen={historyOpen}
        />
        <SplitLayout
          leftPanel={
            <LeftPanel
              key={leftPanelKey}
              onGenerate={handleGenerate}
              isLoading={isLoading}
              initialImage={restoredImage}
              initialOptions={restoredOptions}
              code={code}
              status={status}
              currentOptions={currentOptions}
              onCodeUpdate={setCode}
              onClearRefinement={() => {}}
              onImageChange={setCurrentImage}
            />
          }
          rightPanel={
            <OutputPanel
              status={status}
              code={code}
              files={files}
              error={error}
              tokenCount={tokenCount}
              framework={currentOptions.framework}
              styling={currentOptions.styling}
              onCancel={cancel}
              onReset={handleReset}
              onRetry={handleRetry}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onCodeChange={setCode}
              onFileChange={setFileContent}
              uploadedImage={currentImage}
            />
          }
        />
      </motion.div>
    </div>
  )
}