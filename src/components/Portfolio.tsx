'use client';

import { useEffect } from 'react';
import { initPortfolio } from '@/lib/engine';
import type { SiteContent } from '@/lib/content';

export default function Portfolio({ content }: { content: SiteContent }) {
  useEffect(() => initPortfolio(content), [content]);

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
      <h1 className="sr-only">Matthew Bloomfield, Creative Technologist &amp; Director</h1>
      <main id="stage" className="stage" data-state="opener">
        <div className="opener" id="opener">
          <div id="opener-stamp" className="opener-stamp" />
          <button className="skip" id="skip" type="button">Skip</button>
        </div>
        <nav id="stamps" className="stamps" aria-label="Sections" />
        <button className="home" id="home" type="button" aria-label="Home" hidden />
        <section id="content" className="content" tabIndex={-1} hidden />
        <div id="bleed-layer" className="bleed-layer" aria-hidden="true" />
      </main>
      <footer className="footer">
        <div className="foot-left">
          <span className="micro" id="micro-l" />
          <span>Matthew Bloomfield</span>
          <a href="mailto:matthewb3333@gmail.com" id="email">matthewb3333@gmail.com</a>
        </div>
        <div className="foot-right">
          <button className="replay" id="replay" type="button">Replay intro</button>
          <span className="micro" id="micro-r" />
          <time id="clock" />
        </div>
      </footer>
      <noscript>
        <p style={{ padding: 24 }}>Matthew Bloomfield, Creative Technologist &amp; Director. This site needs JavaScript to show its stamps.</p>
      </noscript>
    </>
  );
}
