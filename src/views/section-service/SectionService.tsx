import React from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { getImageUrl } from '@/utils/utils';
import './section-service.scss';

gsap.registerPlugin(ScrollTrigger, useGSAP);

function SectionService(): React.ReactElement {
  useGSAP(() => {
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: '.section-service',
        start: 'top 50%',
        end: 'bottom 100%',
        scrub: 0.5
      }
    });

    timeline.from('.section-service .image-content', { scale: 0.9 });

    timeline.to('.section-service .plan', { scale: 1.35 });
    timeline.to('.section-service .schedule', { scale: 1.35 }, '<');

    timeline.to('.section-service .left-info', { autoAlpha: 1 });
    timeline.to('.section-service .left-info', { autoAlpha: 0 });

    timeline.to('.section-service .right-info', { autoAlpha: 1 });
    timeline.to('.section-service .plan', { autoAlpha: 0 }, '<');
    timeline.to('.section-service .schedule', { autoAlpha: 1 }, '<');
  });

  return (
    <section className="section-service">
      <div className="service-info">
        <h2 className="title">
          YOYO recommends
          <br />
          Multiple service combinations for you
        </h2>
        <p className="intro">
          YOYO provides more personalized service scenarios and recommends
          multiple services in parallel;
          <br />
          You can access the precise services you need with one click, without
          having to operate frequently in the APP.
        </p>
      </div>
      <div className="section-wrapper">
        <div className="sticky-content">
          <div className="image-info left-info">
            <h2 className="title">
              Humanized optimization for convenient travel
            </h2>
            <p className="intro">
              YOYO considers multiple factors such as your current location,
              departure weather, real-time traffic and personal travel habits,
              and provides you with the most suitable travel advice, presenting
              information such as flight check-in, departure reminders,
              boarding, and so on.
            </p>
          </div>
          <div className="image-info right-info">
            <h2 className="title">
              No mistakes in planning, no omissions in travel
            </h2>
            <p className="intro">
              YOYO reminds you of important schedules before you travel,
              <br />
              and helps you plan your itinerary.
            </p>
          </div>
          <div className="image-content">
            <img
              className="mobile"
              src={getImageUrl('/src/assets/section-service/s4-01.png')}
              alt=""
            />
            <img
              className="plan"
              src={getImageUrl('/src/assets/section-service/s4-02.png')}
              alt=""
            />
            <img
              className="schedule"
              src={getImageUrl('/src/assets/section-service/s4-03.png')}
              alt=""
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default SectionService;
