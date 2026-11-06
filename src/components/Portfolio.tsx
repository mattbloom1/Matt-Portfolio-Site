'use client';

import { useEffect, useRef } from 'react';
import { initPortfolio } from '@/lib/engine';
import { initDrawing } from '@/lib/draw';
import { initFontSwitcher } from '@/lib/fontSwitcher';
import { initLayoutSwitcher } from '@/lib/layoutSwitcher';
import type { SiteContent } from '@/lib/content';

export default function Portfolio({ content }: { content: SiteContent }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sendRef = useRef<HTMLButtonElement>(null);
  useEffect(() => initPortfolio(content), [content]);
  useEffect(() => initDrawing(canvasRef.current as HTMLCanvasElement, sendRef.current as HTMLButtonElement), []);
  useEffect(() => initFontSwitcher(), []);
  useEffect(() => initLayoutSwitcher(), []);

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
      <p className="draw-hint" aria-hidden="true">left click to draw &middot; right click to erase</p>
      <button ref={sendRef} className="send-doodle" type="button" hidden>send doodle</button>
      <h1 className="sr-only">Matthew Bloomfield, Creative Technologist &amp; Director</h1>
      <main id="stage" className="stage" data-state="nav">
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
        <div className="foot-right">
          <time id="clock" />
        </div>
      </footer>
      <noscript>
        <p style={{ padding: 24 }}>Matthew Bloomfield, Creative Technologist &amp; Director. This site needs JavaScript to show its stamps.</p>
      </noscript>
    </>
  );
}
