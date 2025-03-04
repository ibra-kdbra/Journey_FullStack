import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { getImageUrl } from '@/utils/utils';
import './section-note.scss';

gsap.registerPlugin(ScrollTrigger, useGSAP);

function SectionNote(): React.ReactElement {
  const stickyContentRef = useRef<HTMLDivElement | null>(null);

  useGSAP(() => {
    const clientWidth = document.documentElement.clientWidth;
    const scrollWidth = stickyContentRef.current?.scrollWidth ?? 0;
    const offsetLeft = stickyContentRef.current?.offsetLeft ?? 0;

    gsap.to('.section-note .sticky-content', {
      scrollTrigger: {
        trigger: '.section-note',
        start: 'top 65px',
        end: 'bottom 100%',
        scrub: 0
      },
      x: -(scrollWidth + offsetLeft * 2 - clientWidth),
      ease: 'none'
    });

    gsap.to('.section-note .card-blur .card-content', {
      scrollTrigger: {
        trigger: '.section-note',
        start: 'top 65px',
        end: 'center 100%',
        scrub: 0
      },
      filter: 'blur(0px)',
      scale: 1,
      ease: 'none'
    });

    gsap.to('.section-note .card-offset', {
      scrollTrigger: {
        trigger: '.section-note',
        start: 'center center',
        end: 'bottom bottom',
        scrub: 0
      },
      x: -offsetLeft,
      ease: 'none'
    });
  });

  return (
    <section className="section-note">
      <div className="section-wrapper">
        <div className="sticky-content" ref={stickyContentRef}>
          <div className="card card-offset">
            <div className="card-content">
              <div className="cover-info">
                <h2 className="title">
                  Collecting All Favorites
                  <br />
                  Interest Always Online
                </h2>
                <p className="intro">
                  Here's a trick to save your data plan:
                  <br />
                  You can save web pages offline now.
                  <br />
                  Save your favorite knowledge, videos or
                  <br />
                  any interesting content forever,
                  <br />
                  and let them stay online, no matter
                  <br />
                  whether your device is online or offline.
                </p>
              </div>
              <img
                className="cover"
                src={getImageUrl('/src/assets/section-note/s2-01.jpg')}
                alt=""
              />
            </div>
          </div>
          <div className="card card-blur">
            <div className="card-content">
              <div className="cover-info">
                <h2 className="title">
                  Sound Notes
                  <br />
                  One Click Away
                </h2>
                <p className="intro">
                  The audio recording is linked to the note,
                  <br />
                  click on the note, and it will jump to
                  <br />
                  the corresponding audio segment.
                  <br />
                  Reviewing meetings, lessons, or
                  <br />
                  taking notes is much more efficient now.
                </p>
              </div>
              <img
                className="cover"
                src={getImageUrl('/src/assets/section-note/s2-01.jpg')}
                alt=""
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SectionNote;
