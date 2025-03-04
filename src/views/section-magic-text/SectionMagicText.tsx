import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { getImageUrl } from '@/utils/utils';
import './section-magic-text.scss';

gsap.registerPlugin(ScrollTrigger, useGSAP);

function SectionMagicText(): React.ReactElement {
  const stickyContentRef = useRef<HTMLDivElement | null>(null);

  useGSAP(() => {
    const clientWidth = document.documentElement.clientWidth;
    const scrollWidth = stickyContentRef.current?.scrollWidth ?? 0;
    const offsetLeft = stickyContentRef.current?.offsetLeft ?? 0;

    gsap.to('.section-magic-text .sticky-content', {
      scrollTrigger: {
        trigger: '.section-magic-text',
        start: 'top 65px',
        end: `bottom +=${scrollWidth / 3}`,
        scrub: 0
      },
      x: -(scrollWidth + offsetLeft * 2 - clientWidth),
      ease: 'none'
    });

    gsap.to('.section-magic-text .card-blur-1 .card-content', {
      scrollTrigger: {
        trigger: '.section-magic-text',
        start: 'top 65px',
        end: 'center 100%',
        scrub: 0
      },
      filter: 'blur(0px)',
      scale: 1,
      ease: 'none'
    });

    gsap.to('.section-magic-text .card-blur-2 .card-content', {
      scrollTrigger: {
        trigger: '.section-magic-text',
        start: 'top -100%',
        end: 'bottom bottom',
        scrub: 0
      },
      filter: 'blur(0px)',
      scale: 1,
      ease: 'none'
    });
  });

  return (
    <section className="section-magic-text">
      <div className="section-wrapper">
        <h2 className="title">Magic Text</h2>
        <div className="sticky-content" ref={stickyContentRef}>
          <div className="card">
            <div className="card-content">
              <div className="cover-info">
                <p className="subtitle">Fast and Accurate Extraction</p>
                <p className="intro">
                  Select any text on your phone screen with a single tap,
                  <br />
                  and extract it with high precision.
                </p>
              </div>
              <img
                className="cover"
                src={getImageUrl('/src/assets/section-magic-text/s6-01.jpg')}
                alt=""
              />
            </div>
          </div>
          <div className="card card-blur card-blur-1">
            <div className="card-content">
              <div className="cover-info">
                <p className="subtitle">Convenient Life Services</p>
                <p className="intro">
                  Intelligently analyze the semantics of text in images:
                  <br />
                  phone numbers, addresses, QR codes, flight information,
                  <br />
                  ID cards, emails, websites, and more.
                </p>
              </div>
              <img
                className="cover"
                src={getImageUrl('/src/assets/section-magic-text/s6-02.jpg')}
                alt=""
              />
            </div>
          </div>
          <div className="card card-blur card-blur-2">
            <div className="card-content">
              <div className="cover-info">
                <p className="subtitle">Auto-Scan Documents</p>
                <p className="intro">
                  Scan documents automatically, remove shadows, and prevent
                  <br />
                  duplicates. Export formats include images, TXT, and PDF.
                </p>
              </div>
              <img
                className="cover"
                src={getImageUrl('/src/assets/section-magic-text/s6-02.jpg')}
                alt=""
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SectionMagicText;
