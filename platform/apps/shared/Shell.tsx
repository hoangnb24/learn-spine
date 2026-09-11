import type { ReactNode } from 'react';
import './styles.css';

export function EmptyIcon({ kind = 'image' }: { kind?: 'image' | 'folder' | 'file' | 'motion' }) {
  return <svg className={`empty-icon ${kind}`} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {kind === 'image' && <><rect x="7" y="11" width="50" height="42" rx="2"/><circle cx="44" cy="23" r="4"/><path d="m11 46 14-15 12 12 7-7 9 10"/></>}
    {kind === 'folder' && <path d="M7 20V15h19l7 7h24v30H7V20Z"/>}
    {kind === 'file' && <><path d="M17 7h23l10 10v40H17Z M40 7v12h10 M24 28h19 M24 35h19 M24 42h12"/></>}
    {kind === 'motion' && <path d="m6 33 9-1 5-9 8 25 8-34 7 24 5-6 10 1"/>}
  </svg>;
}

export function Header({ app }: { app: 'editor' | 'player' }) {
  return <header className="app-header">
    <a className="brand" href="./index.html" aria-label="learn-spine, về Editor"><span className="brand-mark" aria-hidden="true">◇</span>learn-spine{app === 'player' && <span className="brand-suffix">/ Player</span>}</a>
    <nav aria-label="Ứng dụng">
      <a href="./index.html" aria-current={app === 'editor' ? 'page' : undefined}>Editor</a>
      <a href="./player.html" aria-current={app === 'player' ? 'page' : undefined}>Player</a>
    </nav>
    <span className="header-note">Không gian sáng tạo 2D</span>
  </header>;
}

export function EmptyState({ title, description, kind, large = false }: { title: string; description?: string; kind?: 'image' | 'folder' | 'file' | 'motion'; large?: boolean }) {
  return <div className={`empty-state${large ? ' large' : ''}`}><EmptyIcon kind={kind}/><p className="empty-title">{title}</p>{description && <p className="empty-description">{description}</p>}</div>;
}

export function Panel({ title, children, className = '' }: { title: string; children: ReactNode; className?: string }) {
  return <section className={`panel ${className}`} aria-label={title}><h2 className="panel-heading">{title}</h2>{children}</section>;
}

export function Footer({ player = false }: { player?: boolean }) {
  return <footer className="status-bar"><span><span className="status-dot"/>{player ? 'Player' : 'Workspace trống'}</span><span>Chưa mở project</span></footer>;
}
