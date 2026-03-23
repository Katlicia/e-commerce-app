import "./App.css";
import "bootstrap/dist/css/bootstrap.css";
import Home from "./components/Home.jsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Header from "./layout/Header.jsx";
import Footer from "./layout/Footer.jsx";
import Topbar from "./components/Topbar.jsx";
import Carousel from "./components/Carousel.jsx";
import Featured from "./components/Featured.jsx";
import Chances from "./components/Chances.jsx";
import ProductCard from "./components/ProductCard.jsx";

function App() {
  return (
    <BrowserRouter>
      <Topbar />
      <Header />
      <Carousel />
      <Featured />
      <Chances />
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
