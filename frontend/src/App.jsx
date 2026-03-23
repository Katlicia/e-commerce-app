import "./App.css";
import "bootstrap/dist/css/bootstrap.css";
import Home from "./components/Home.jsx";
import { BrowserRouter, Links, Route, Routes } from "react-router-dom";
import Header from "./layout/Header.jsx";
import Footer from "./layout/Footer.jsx";
import Topbar from "./components/Topbar.jsx";
import Carousel from "./components/Carousel.jsx";
import Featured from "./components/Featured.jsx";
import Chances from "./components/Chances.jsx";
import ProductList from "./components/ProductList.jsx";
import HeaderLinks from "./components/HeaderLinks.jsx";

function App() {
  return (
    <BrowserRouter>
      <Topbar />
      <Header />
      <HeaderLinks />
      <Carousel />
      <Featured />
      <Chances />
      <ProductList />
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
