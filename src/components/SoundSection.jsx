import React from "react";

function SoundSection() {

  const handleLearnMore = () => {
    const element =  document.querySelector('.display-section'); 
    window.scrollTo({
      top: element?.getBoundingClientRect().bottom,
      left:0 , 
      behavior:'smooth'
    })
  }
  return (
    <div className="sound-section wrapper">
      <div className="body">
        <div className="sound-section-content content">
          <h2 className="title">New sound system</h2>
          <p className="text">Feel the base</p>
          <span className="description">
            Don't miss out any beat.
          </span>
          <ul className="links">
            <li>
                <button className="button">
                    buy
                </button>
                
            </li>
            <li>
                <a className="link" onClick={handleLearnMore}>
                   learn more 
                </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default SoundSection;
