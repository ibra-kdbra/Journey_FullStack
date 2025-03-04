import React from 'react';
import { getImageUrl } from '@/utils/utils';
import './section-scene.scss';

function SectionScene(): React.ReactElement {
  return (
    <section className="section-scene">
      <div className="section-wrapper">
        <div className="cover-info">
          <h2 className="title">
            YOYO recommends doubling the number of scenarios
          </h2>
          <p className="intro">
            YOYO recommends more service scenarios, becoming your intimate
            assistant for multiple scenarios such as travel, work life,
            entertainment, etc.:
            <br />
            Manage for you Subway commuting, worry-free clocking in, health
            code, payment code, comfortable movie watching, express delivery
            reminder, charging reminder and other scenarios.
          </p>
        </div>
        <img
          className="cover"
          src={getImageUrl('/src/assets/section-scene/s5-01.png')}
          alt=""
        />
      </div>
    </section>
  );
}

export default SectionScene;
