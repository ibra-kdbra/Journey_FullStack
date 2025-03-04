import React from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { getImageUrl } from '@/utils/utils';
import './section-device.scss';

gsap.registerPlugin(ScrollTrigger, useGSAP);

function SectionTvc(): React.ReactElement {
  useGSAP(() => {
    ScrollTrigger.create({
      trigger: '.section-device',
      start: 'top 85%',
      onToggle: ({ isActive }) => {
        if (!isActive) {
          return;
        }

        const timeline = gsap.timeline();

        timeline.fromTo(
          '.section-device .title',
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5 }
        );
        timeline.fromTo(
          '.section-device .intro',
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5 }
        );

        timeline.fromTo(
          '.section-device .pc',
          { opacity: 0 },
          { opacity: 1, duration: 0.6 },
          0
        );
        timeline.fromTo(
          '.section-device .ipad',
          { opacity: 0 },
          { opacity: 1, duration: 0.6 },
          0.5
        );
        timeline.fromTo(
          '.section-device .mobile',
          { opacity: 0 },
          { opacity: 1, duration: 0.6 },
          1
        );
      }
    });
  });

  return (
    <section className="section-device">
      <div className="section-wrapper">
        <div className="image-info">
          <h2 className="title">
            Sync Across Multiple Devices
            <br />
            Access Anywhere
          </h2>
          <p className="intro">
            The first computer version of Honor Note, which helps you to
            organize notes more efficiently and edit notes more quickly. On
            Honor phones, tablets, and computers, you can view and modify notes
            anywhere at any time.
          </p>
        </div>
        <div className="image-content">
          <img
            className="pc"
            src={getImageUrl('/src/assets/section-device/s3-01.png')}
            alt=""
          />
          <img
            className="ipad"
            src={getImageUrl('/src/assets/section-device/s3-02.png')}
            alt=""
          />
          <img
            className="mobile"
            src={getImageUrl('/src/assets/section-device/s3-03.png')}
            alt=""
          />
        </div>
      </div>
    </section>
  );
}

export default SectionTvc;
