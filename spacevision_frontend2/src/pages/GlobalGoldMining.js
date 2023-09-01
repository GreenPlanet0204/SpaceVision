import React from "react";
import { Link } from "react-router-dom";

const GlobalGoldMining = () => {
  return (
    <>
      <div className="content">
        <div className="title">
          Satellite Powered Analytics Coming Soon To Global Gold Mining Markets
        </div>
        <div className="text">Contact Us To Help Shape These Insights</div>
        <div className="btn-group">
          <div className="btn outline">
            <Link to="/USCrudeOil">Back To US Oil</Link>
          </div>
          <div className="btn primary">Contact US</div>
        </div>
      </div>
    </>
  );
};

export default GlobalGoldMining;
