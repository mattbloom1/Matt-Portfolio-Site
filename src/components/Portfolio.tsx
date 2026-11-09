'use client';

import { useEffect, useRef } from 'react';
import { initPortfolio } from '@/lib/engine';
import { initDrawing } from '@/lib/draw';
import { initIconCursor } from '@/lib/iconCursor';
import { initLightbox } from '@/lib/lightbox';
import { initNightMode } from '@/lib/nightmode';
import type { SiteContent } from '@/lib/content';

export default function Portfolio({ content }: { content: SiteContent }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sendRef = useRef<HTMLButtonElement>(null);
  useEffect(() => initPortfolio(content), [content]);
  useEffect(() => initDrawing(canvasRef.current as HTMLCanvasElement, sendRef.current as HTMLButtonElement), []);
  // ?fonts dev tool: only loaded when asked for, so it stays out of the normal bundle.
  useEffect(() => {
    if (!/[?&]fonts\b/.test(location.search)) return;
    let stop = () => {}, gone = false;
    import('@/lib/fontSwitcher').then((m) => { if (!gone) stop = m.initFontSwitcher(); });
    return () => { gone = true; stop(); };
  }, []);
  useEffect(() => initIconCursor(), []);
  useEffect(() => initLightbox(), []);
  useEffect(() => initNightMode(), []);

  return (
    <>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <filter id="bleed" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap id="bleed-disp" in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <div className="grain" aria-hidden="true" />
      <div className="bg" id="bg" aria-hidden="true" />
      <canvas ref={canvasRef} className="drawing" aria-hidden="true" />
      <h1 className="sr-only">Matthew Bloomfield, Creative Technologist &amp; Designer</h1>
      <main id="stage" className="stage" data-state="nav">
        <p className="tagline">I design and build things people use,<br /><span>in software, hardware and infrastructure.</span></p>
        <nav id="stamps" className="stamps" aria-label="Sections" />
        <button className="home" id="home" type="button" aria-label="Home" hidden />
        <section id="content" className="content" tabIndex={-1} hidden />
        <div id="bleed-layer" className="bleed-layer" aria-hidden="true" />
      </main>
      <footer className="footer">
        <div className="foot-left">
          <span>Matthew Bloomfield</span>
          <a href="mailto:matthewb3333@gmail.com" id="email">matthewb3333@gmail.com</a>
        </div>
        <div className="foot-tools" role="group" aria-label="Drawing tools">
          {/* Placeholder icons: swap for Matt's pencil/eraser images (public/tools/) */}
          <button type="button" className="tool on" id="tool-pencil" aria-label="Pencil" aria-pressed="true" title="Pencil">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><path d="M4 20l1-4L16.5 4.5a1.5 1.5 0 012 0l1 1a1.5 1.5 0 010 2L8 19z"/><path d="M14.5 6.5l3 3"/></svg>
          </button>
          <button type="button" className="tool" id="tool-eraser" aria-label="Eraser" aria-pressed="false" title="Eraser">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><path d="M4 16l9-9a2 2 0 013 0l3 3a2 2 0 010 3l-6 6H8z"/><path d="M8 20h12M9 11l5 5"/></svg>
          </button>
          <button type="button" className="tool" id="tool-undo" aria-label="Undo" title="Undo">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round"><path d="M9 7L4 12l5 5"/><path d="M4 12h10a5 5 0 010 7"/></svg>
          </button>
          <button type="button" className="tool" id="tool-reset" aria-label="Clear drawing" title="Clear drawing">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round"><path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/></svg>
          </button>
          <span className="send-wrap">
            <span className="bubble" aria-hidden="true"><span id="send-bubble" /></span>
            <button ref={sendRef} type="button" className="tool" id="tool-send" aria-label="Send doodle to Matt">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round"><path d="M21 3L3 11l7 3 3 7z"/><path d="M10 14l11-11"/></svg>
            </button>
          </span>
        </div>
        <div className="foot-right">
          <time id="clock" />
        </div>
      </footer>
      <noscript>
        <p style={{ padding: 24 }}>Matthew Bloomfield, Creative Technologist &amp; Designer. This site needs JavaScript to show its stamps.</p>
      </noscript>
    </>
  );
}
