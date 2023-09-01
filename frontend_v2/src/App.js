import "./App.scss";
import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import USCrudeOil from "./pages/USCrudeOil";
import MiddleEastCrudeOil from "./pages/MiddleEastCrudeOil";
import GlobalGoldMining from "./pages/GlobalGoldMining";
import CarbonCredits from "./pages/CarbonCredits";
import SignUp from "./pages/Signup";
import Layout from "./components/Layout/Layout";

function App() {
  return (
    <>
      <Routes>
        <Route exact path="/" Component={Login} />
        <Route path="/signup" Component={SignUp} />
      </Routes>
      <Layout>
        <Routes>
          <Route path="/USCrudeOil" Component={USCrudeOil} />
          <Route path="/MiddleEastCrudeOil" Component={MiddleEastCrudeOil} />
          <Route path="/GlobalGoldMining" Component={GlobalGoldMining} />
          <Route path="/CarbonCredits" Component={CarbonCredits} />
        </Routes>
      </Layout>
    </>
  );
}

export default App;
