import React, { useEffect, useRef, useState } from "react";
import { ReactComponent as SpaceVisionLogo } from "../../assets/SpaceVision 1.svg";
import { ReactComponent as Logo } from "../../assets/logo.svg";
import ForthGridLogo from "../../assets/ForthGrid_Wht 1.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MemberstackProtected } from "@memberstack/react";
import { ReactComponent as LessIcon } from "../../assets/less.svg";

const Layout = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const ref = useRef(null);

  const handleClickOutside = (event) => {
    if (ref.current && !ref.current.contains(event.target)) {
      setOpen(false);
    }
  };
  /* eslint-disable */
  useEffect(() => {
    const token = localStorage.getItem("_ms-mid");
    if (!token) navigate("/");

    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);
  /* eslint-enable */
  useEffect(() => {
    if (location.pathname === "/USCrudeOil") setTab(0);
    if (location.pathname === "/MiddleEastCrudeOil") setTab(1);
    if (location.pathname === "/GlobalGoldMining") setTab(2);
    if (location.pathname === "/CarbonCredits") setTab(3);
  }, [location]);
  return (
    <MemberstackProtected>
      <div className="container">
        <div className="header">
          <div className="logo">
            <div className="logo-1">
              <SpaceVisionLogo />
            </div>
            <div className="logo-2">
              <Logo />
            </div>
          </div>
          <div className="right">
            <div className="menu">
              <div className={tab === 0 ? "tab active" : "tab"}>
                <Link to="/USCrudeOil">US Crude Oil</Link>
              </div>
              <div className={tab === 1 ? "tab active" : "tab"}>
                <Link to="/MiddleEastCrudeOil">Middle East Crude Oil</Link>
              </div>
              <div className={tab === 2 ? "tab active" : "tab"}>
                <Link to="/GlobalGoldMining">Global Gold Mining</Link>
              </div>
              <div className={tab === 3 ? "tab active" : "tab"}>
                <Link to="/CarbonCredits">Carbon Credits</Link>
              </div>
            </div>
            <div className={open ? "menu-2 active" : "menu-2"}>
              <div className="label" onClick={() => setOpen(!open)} ref={ref}>
                <LessIcon />
                <LessIcon />
                <LessIcon />
              </div>
              <div className="submenu">
                <Link
                  to="/USCrudeOil"
                  className={tab === "0" ? "tab active" : "tab"}
                >
                  US Crude Oil
                </Link>
                <Link
                  to="/MiddleEastCrudeOil"
                  className={tab === "1" ? "tab active" : "tab"}
                >
                  MENA Crude Oil
                </Link>
                <Link
                  to="/GlobalGoldMining"
                  className={tab === "2" ? "tab active" : "tab"}
                >
                  Global Gold Mining
                </Link>
                <Link
                  to="/CarbonCredits"
                  className={tab === "3" ? "tab active" : "tab"}
                >
                  Global Carbon Credits
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="main">{children}</div>
        <div className="footer">
          <div className="left">
            <div className="text">INSIGHTS ARE POWERED BY</div>
            <img src={ForthGridLogo} alt="logo" />
          </div>
          <div className="text">2023</div>
        </div>
      </div>
    </MemberstackProtected>
  );
};

export default Layout;
