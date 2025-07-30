import React from "react";
import "./Panel.css"; 

const Panel = ({ title, image, description }) => {
  return (
    <div className="panel">
      <div className="panel-content">
        <span className="panel-title">
          <img src={image} alt={title} className="panel-image" />
          {title}
        </span>
        <p className="panel-description">{description}</p>
      </div>
    </div>
  );
};

export default Panel;