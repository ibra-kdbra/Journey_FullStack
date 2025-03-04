import React from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { getImageUrl } from '@/utils/utils';
import './section-magic.scss';

gsap.registerPlugin(ScrollTrigger, useGSAP);

function SectionMagic(): React.ReactElement {
  useGSAP(() => {
    ScrollTrigger.create({
      trigger: '.section-magic',
      start: 'top center',
      scrub: 0.5,
      onToggle: ({ isActive }) => {
        if (!isActive) {
          gsap.to('.section-magic .title', {
            y: 50,
            opacity: 0,
            duration: 0.5,
            ease: 'power1.inOut'
          });
          return;
        }

        gsap.fromTo(
          '.section-magic .title',
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'power1.inOut' }
        );
      }
    });
    ScrollTrigger.create({
      trigger: '.section-magic',
      start: 'top 30%',
      scrub: 0.5,
      onToggle: ({ isActive }) => {
        if (!isActive) {
          gsap.to('.section-magic .list', {
            y: 50,
            opacity: 0,
            duration: 0.5,
            ease: 'power1.inOut'
          });
          return;
        }

        gsap.fromTo(
          '.section-magic .list',
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'power1.inOut' }
        );
      }
    });
  });

  return (
    <section className="section-magic">
      <div className="section-wrapper">
        <h2 className="title">4 Major Technologies, 1 New Experience</h2>
        <ul className="list">
          <li className="item">
            <img
              className="cover"
              src={getImageUrl('/src/assets/section-magic/magic-ring.svg')}
              alt=""
            />
            <p className="subtitle">MagicRing Trust Ring</p>
            <p className="intro">Cross-system trustworthy connection</p>
          </li>
          <li className="item">
            <img
              className="cover"
              src={getImageUrl('/src/assets/section-magic/magic-ring.svg')}
              alt=""
            />
            <p className="subtitle">Magic Live Intelligent Engine</p>
            <p className="intro">Platform-level AI capabilities</p>
          </li>
          <li className="item">
            <img
              className="cover"
              src={getImageUrl('/src/assets/section-magic/magic-ring.svg')}
              alt=""
            />
            <p className="subtitle">Turbo X System Engine</p>
            <p className="intro">Core-level performance enhancement</p>
          </li>
          <li className="item">
            <img
              className="cover"
              src={getImageUrl('/src/assets/section-magic/magic-ring.svg')}
              alt=""
            />
            <p className="subtitle">MagicGuard Honor Security</p>
            <p className="intro">Three-layer security protection system</p>
          </li>
        </ul>
      </div>
    </section>
  );
}

export default SectionMagic;
