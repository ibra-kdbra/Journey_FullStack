import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { getImageUrl } from '@/utils/utils';
import './section-notice.scss';

gsap.registerPlugin(ScrollTrigger, useGSAP);

function SectionNotice(): React.ReactElement {
  const stickyContentRef = useRef<HTMLDivElement | null>(null);

  useGSAP(() => {
    const clientWidth = document.documentElement.clientWidth;
    const scrollWidth = stickyContentRef.current?.scrollWidth ?? 0;
    const offsetLeft = stickyContentRef.current?.offsetLeft ?? 0;

    gsap.to('.section-notice .sticky-content', {
      scrollTrigger: {
        trigger: '.section-notice',
        start: 'top 65px',
        end: 'bottom 100%',
        scrub: 0
      },
      x: -(scrollWidth + offsetLeft * 2 - clientWidth),
      ease: 'none'
    });

    gsap.to('.section-notice .card-blur .card-content', {
      scrollTrigger: {
        trigger: '.section-notice',
        start: 'top 65px',
        end: 'center 100%',
        scrub: 0
      },
      filter: 'blur(0px)',
      scale: 1,
      ease: 'none'
    });

    gsap.to('.section-notice .card-offset', {
      scrollTrigger: {
        trigger: '.section-notice',
        start: 'center center',
        end: 'bottom bottom',
        scrub: 0
      },
      x: -offsetLeft,
      ease: 'none'
    });
  });

  return (
    <section className="section-notice">
      <div className="section-wrapper">
        <div className="sticky-content" ref={stickyContentRef}>
          <div className="card card-offset">
            <div className="card-content">
              <div className="cover-info">
                <h2 className="title">
                  Important, Don't Miss
                  <br />
                  Focused, No Distractions
                </h2>
                <p className="intro">
                  Directly on your current Honor device,
                  <br />
                  customize and view all phone notifications and messages.
                  <br />
                  Don't miss important information, stay focused without
                  distractions.
                </p>
              </div>
              <img
                className="cover"
                src={getImageUrl('/src/assets/section-notice/s1-01.jpg')}
                alt=""
              />
            </div>
          </div>
          <div className="card card-blur">
            <div className="card-content">
              <div className="cover-info">
                <h2 className="title">
                  Never Miss a Call
                  <br />
                  Uninterrupted Thinking
                </h2>
                <p className="intro">
                  Make and receive calls on your current Honor device,
                  <br />
                  ensuring important calls are never missed, and productivity is
                  uninterrupted.
                </p>
              </div>
              <img
                className="cover"
                src={getImageUrl('/src/assets/section-notice/s1-02.jpg')}
                alt=""
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SectionNotice;
