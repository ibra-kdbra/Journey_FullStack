import React from "react";
import Iphone from "../assets/images/iphone-14.jpg";
import HoldingIphone from '../assets/images/iphone-hand.png'
function Jumbotron() {
    const handleLearnMore = () => {
       const element =  document.querySelector('.sound-section');
       window.scrollTo({
        top: element?.getBoundingClientRect().top,
        let: 0 ,
        behavior: 'smooth'
       })
    }
  return (
    <div className="jumbotron-section wrapper">
      <h2 className="title">New</h2>
      <img className="logo" src={Iphone} alt="Iphone 14 pro" />
      <p className="text">Big and Bigger. </p>
      <span className="description">from $1.63/mo . for 24mo . 999</span>
      <ul className="links">
        <li>
          <button className="button">buy</button>
        </li>
        <li>
          <a className="link" onClick={handleLearnMore}>Learn more</a>
        </li>
      </ul>
      <img className="iphone-img" src={HoldingIphone} alt="iphone"/>
    </div>
  );
}

export default Jumbotron;
