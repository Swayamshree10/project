// store/useThemeStore.js
import { create } from 'zustand'

export const THEMES = {
  dark: {
    name: 'Dark',
    icon: '🌑',
    '--primary':       '#6366f1',
    '--primary-dark':  '#4338ca',
    '--primary-light': '#a5b4fc',
    '--bg':            '#0f0f1a',
    '--bg2':           '#13131f',
    '--bg3':           '#1a1a2e',
    '--surface':       '#1e1e35',
    '--surface2':      '#252540',
    '--border':        'rgba(99,102,241,0.15)',
    '--text':          '#e2e8f0',
    '--text2':         '#94a3b8',
    '--text3':         '#64748b',
    '--sidebar-bg':    'linear-gradient(180deg,#0d0d1a 0%,#111128 100%)',
    '--header-bg':     'rgba(13,13,26,0.85)',
    '--card-bg':       'rgba(30,30,53,0.7)',
    '--bubble-ai':     'rgba(30,30,53,0.9)',
    '--input-bg':      'rgba(30,30,53,0.8)',
    '--glow':          '0 0 20px rgba(99,102,241,0.3)',
  },
  antigravity: {
    name: 'Antigravity',
    icon: '🚀',
    '--primary':       '#00f5ff',
    '--primary-dark':  '#00b8d4',
    '--primary-light': '#80ffff',
    '--bg':            '#000510',
    '--bg2':           '#000a1a',
    '--bg3':           '#001025',
    '--surface':       '#001830',
    '--surface2':      '#002040',
    '--border':        'rgba(0,245,255,0.15)',
    '--text':          '#e0f7ff',
    '--text2':         '#7ecfdf',
    '--text3':         '#4a9aaa',
    '--sidebar-bg':    'linear-gradient(180deg,#000510 0%,#000d20 100%)',
    '--header-bg':     'rgba(0,5,16,0.9)',
    '--card-bg':       'rgba(0,24,48,0.7)',
    '--bubble-ai':     'rgba(0,20,40,0.9)',
    '--input-bg':      'rgba(0,20,40,0.8)',
    '--glow':          '0 0 20px rgba(0,245,255,0.3)',
  },
  light: {
    name: 'Light',
    icon: '☀️',
    '--primary':       '#6366f1',
    '--primary-dark':  '#4338ca',
    '--primary-light': '#818cf8',
    '--bg':            '#f8fafc',
    '--bg2':           '#f1f5f9',
    '--bg3':           '#e2e8f0',
    '--surface':       '#ffffff',
    '--surface2':      '#f1f5f9',
    '--border':        'rgba(99,102,241,0.15)',
    '--text':          '#1e293b',
    '--text2':         '#475569',
    '--text3':         '#94a3b8',
    '--sidebar-bg':    'linear-gradient(180deg,#1e1b4b 0%,#312e81 100%)',
    '--header-bg':     'rgba(255,255,255,0.95)',
    '--card-bg':       'rgba(255,255,255,0.9)',
    '--bubble-ai':     '#ffffff',
    '--input-bg':      '#ffffff',
    '--glow':          '0 0 20px rgba(99,102,241,0.15)',
  },
}

const useThemeStore = create((set) => ({
  theme: 'dark',
  setTheme: (theme) => {
    const vars = THEMES[theme]
    Object.entries(vars).forEach(([key, val]) => {
      if (key.startsWith('--')) document.documentElement.style.setProperty(key, val)
    })
    set({ theme })
  },
}))

export default useThemeStore
