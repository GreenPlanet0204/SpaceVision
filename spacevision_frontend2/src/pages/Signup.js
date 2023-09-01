import React, { useEffect } from "react";
import Coursour from "../components/Coursour/Coursour";
import { ReactComponent as Logo } from "../assets/logo.svg";
import { ReactComponent as GoogleIcon } from "../assets/google-icon.svg";
import { useNavigate } from "react-router-dom";
import MemberstackDOM from "@memberstack/dom";

const memberstack = MemberstackDOM.init({
  publicKey: "pk_sb_bb958432b1cf47aff84b",
});

const SignUp = () => {
  const navigate = useNavigate();
  const SocialSignUp = async () => {
    try {
      await memberstack.signupWithProvider({
        provider: "google",
      });
      navigate("/USCrudeOil");
    } catch (error) {
      console.error(error);
      navigate("/");
    }
  };

  useEffect(() => {
    localStorage.clear();
  }, []);

  return (
    <div className="auth container">
      <Coursour />
      <div className="form">
        <div className="logo">
          <Logo />
        </div>

        <div className="title">Welcome to SpaceVision</div>
        <div className="text">
          Trading with Satellite Intelligence Powered by ForthGrid
        </div>

        <div className="btn" onClick={SocialSignUp}>
          <div className="label">Sign Up with Google</div>
          <div className="icon">
            <GoogleIcon />
          </div>
        </div>
        {/* </LoginSocialGoogle> */}
      </div>
    </div>
  );
};

export default SignUp;
