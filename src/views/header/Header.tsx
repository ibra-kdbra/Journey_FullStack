import React from 'react';
import './header.scss';

function Header(): React.ReactElement {
  return (
    <div className="header">
      <div className="header-wrapper">
        <i className="logo"></i>
        <ul className="nav-list">
          <li className="item">Phone</li>
          <li className="item">Laptop</li>
          <li className="item">Tablet</li>
          <li className="item">Wearables</li>
          <li className="item">Smart Screen</li>
          <li className="item">More Products</li>
        </ul>
      </div>
    </div>
  );
}

export default Header;
