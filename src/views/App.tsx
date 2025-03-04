import React from 'react';
import Header from './header/Header';
import SectionHero from './section-hero/SectionHero';
import SectionTvc from './section-tvc/SectionTvc';
import SectionMagic from './section-magic/SectionMagic';
import SectionMagicRing from './section-magic-ring/SectionMagicRing';
import SectionConnect from './section-connect/SectionConnect';
import SectionNotice from './section-notice/SectionNotice';
import SectionDevice from './section-device/SectionDevice';
import SectionNote from './section-note/SectionNote';
// Eleventh screen
import SectionMagicLive from './section-magic-live/SectionMagicLive';
import SectionService from './section-service/SectionService';
import SectionScene from './section-scene/SectionScene';
import SectionMagicText from './section-magic-text/SectionMagicText';
import SectionTurbo from './section-turbo/SectionTurbo';
import SectionTurboOS from './section-turbo-os/SectionTurboOS';
import SectionTurboGpu from './section-turbo-gpu/SectionTurboGpu';
import SectionTurboLink from './section-turbo-link/SectionTurboLink';
import SectionMagicGuard from './section-magic-guard/SectionMagicGuard';
import SectionFlowDesign from './section-flow-design/SectionFlowDesign';
// Twenty-first screen
import SectionSuggest from './section-suggest/SectionSuggest';

function App(): React.ReactElement {
  return (
    <>
      <Header />
      <SectionHero />
      <SectionTvc />
      <SectionMagic />
      <SectionMagicRing />
      <SectionConnect
        title={['Swipe up with three fingers', 'Interconnect all devices']}
        intro={[
          'Enter the control center, swipe up with three fingers,',
          'drag the icon to touch the surrounding Honor devices,',
          'and seamlessly connect multiple devices.'
        ]}
        videoURL={'/src/assets/section-connect/s1.mp4'}
      />
      <SectionConnect
        title={['Continue across devices', 'Seamless work transition']}
        intro={[
          'The work already opened on one Honor device',
          'can be continued on another nearby Honor device,',
          'and the work transition is seamless.'
        ]}
        videoURL={'/src/assets/section-connect/s2.mp4'}
      />
      <SectionConnect
        title={['One keyboard and mouse', 'Multi-device collaboration']}
        intro={[
          'In the Honor computer manager,',
          'you can find up to five nearby Honor devices;',
          'use one keyboard and mouse to control any three of them,',
          'and enjoy seamless multi-device collaboration.'
        ]}
        videoURL={'/src/assets/section-connect/s3.mp4'}
      />
      <SectionNotice />
      <SectionDevice />
      <SectionNote />
      <SectionMagicLive />
      <SectionService />
      <SectionScene />
      <SectionMagicText />
      <SectionTurbo />
      <SectionTurboOS />
      <SectionTurboGpu />
      <SectionTurboLink />
      <SectionMagicGuard />
      <SectionFlowDesign />
      <SectionSuggest />
    </>
  );
}

export default App;
