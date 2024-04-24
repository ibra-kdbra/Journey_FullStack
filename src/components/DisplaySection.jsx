import React from "react";

function DisplaySection({ triggerPreview }) {
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };
  return (
    <div className="display-section wrapper">
      <h2 className="title">new</h2>
      <p className="text"> Brilliant </p>
      <span className="description">
        More than 2x brightness in the sun
      </span>
      <button className="button" onClick={triggerPreview}>
        Try me{" "}
      </button>
      <button className="back-button" onClick={handleScrollToTop}>
        {" "}
        Top{" "}
      </button>
    </div>
  );
}

export default DisplaySection;
