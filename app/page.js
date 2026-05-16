'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '@/components/Header'
import SplitLayout from '@/components/SplitLayout'
import UploadZone from '@/components/UploadZone'
import ImagePreview from '@/components/ImagePreview'
import OptionsPanel from '@/components/OptionsPanel'
import OutputPanel from '@/components/OutputPanel'
import { useCodeGeneration } from '@/hooks/useCodeGeneration'

// ─── Animated ambient background ──────────────────────────────────────────────
function AmbientBackground() {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', overflow:'hidden' }}>
      {/* Dot grid */}
      <div style={{
        position:'absolute', inset:0,
        backgroundImage:'radial-gradient(circle, rgba(124,106,255,0.13) 1px, transparent 1px)',
        backgroundSize:'28px 28px',
        maskImage:'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
      }} />

      {/* Orb 1 — top left, slow drift */}
      <motion.div
        animate={{ x:[0,30,0], y:[0,20,0], scale:[1,1.08,1] }}
        transition={{ duration:18, repeat:Infinity, ease:'easeInOut' }}
        style={{
          position:'absolute', top:'-140px', left:'-100px',
          width:'560px', height:'560px', borderRadius:'50%',
          background:'radial-gradient(circle, rgba(124,106,255,0.07) 0%, transparent 70%)',
        }}
      />

      {/* Orb 2 — bottom right */}
      <motion.div
        animate={{ x:[0,-20,0], y:[0,-30,0], scale:[1,1.12,1] }}
        transition={{ duration:22, repeat:Infinity, ease:'easeInOut', delay:4 }}
        style={{
          position:'absolute', bottom:'-120px', right:'-80px',
          width:'480px', height:'480px', borderRadius:'50%',
          background:'radial-gradient(circle, rgba(56,189,248,0.06) 0%, transparent 70%)',
        }}
      />

      {/* Orb 3 — centre subtle */}
      <motion.div
        animate={{ opacity:[0.3,0.6,0.3] }}
        transition={{ duration:8, repeat:Infinity, ease:'easeInOut', delay:2 }}
        style={{
          position:'absolute', top:'30%', left:'40%',
          width:'300px', height:'300px', borderRadius:'50%',
          background:'radial-gradient(circle, rgba(192,132,252,0.04) 0%, transparent 70%)',
        }}
      />
    </div>
  )
}

// ─── Section label ─────────────────────────────────────────────────────────────
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

// ─── Left panel with staggered entrance ───────────────────────────────────────
function LeftPanel({ onGenerate, isLoading }) {
  const [image, setImage] = useState(null)

  const handleRemove = () => {
    if (image?.url) URL.revokeObjectURL(image.url)
    setImage(null)
  }

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
  }
  const itemVariants = {
    hidden:  { opacity:0, y:14 },
    visible: { opacity:1, y:0, transition:{ duration:0.5, ease:[0.23,1,0.32,1] } },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ display:'flex', flexDirection:'column', gap:'16px', width:'100%', paddingBottom:'20px' }}
    >
      <motion.div variants={itemVariants}><SectionLabel number="01" text="Upload Design" /></motion.div>

      {/* Upload zone / preview swap with AnimatePresence */}
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
              <UploadZone onFileAccepted={setImage} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div variants={itemVariants}><SectionLabel number="02" text="Configure" /></motion.div>

      <motion.div variants={itemVariants}>
        <OptionsPanel
          hasImage={!!image}
          isLoading={isLoading}
          onGenerate={(opts) => onGenerate({ image, ...opts })}
        />
      </motion.div>
    </motion.div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const {
    code, status, error, tokenCount,
    isLoading, generate, cancel, reset, setCode,
  } = useCodeGeneration()

  const [activeTab,     setActiveTab]     = useState('code')
  const [lastPayload,   setLastPayload]   = useState(null)
  const [currentOptions, setCurrentOptions] = useState({ framework:'react', styling:'tailwind' })

  const handleGenerate = useCallback((payload) => {
    setLastPayload(payload)
    setCurrentOptions({ framework:payload.framework, styling:payload.styling })
    setActiveTab('code')
    generate(payload)
  }, [generate])

  const handleRetry = useCallback(() => {
    if (lastPayload) generate(lastPayload)
  }, [lastPayload, generate])

  const handleReset = useCallback(() => {
    reset()
    setActiveTab('code')
  }, [reset])

  return (
    <div style={{ position:'relative' }}>
      <AmbientBackground />
      <div style={{ position:'relative', zIndex:1 }}>
        <Header />
        <motion.div
          initial={{ opacity:0 }}
          animate={{ opacity:1 }}
          transition={{ duration:0.5, delay:0.1 }}
        >
          <SplitLayout
            leftPanel={
              <LeftPanel onGenerate={handleGenerate} isLoading={isLoading} />
            }
            rightPanel={
              <OutputPanel
                status={status}
                code={code}
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
              />
            }
          />
        </motion.div>
      </div>
    </div>
  )
}