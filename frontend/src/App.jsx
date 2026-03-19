import "./App.css";
import Home from "./components/Home.jsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Header from "./layout/Header.jsx";
import Footer from "./layout/Footer.jsx";
import Topbar from "./components/Topbar.jsx";
import Carousel from "./components/Carousel.jsx";

function App() {
  return (
    <BrowserRouter>
      <Topbar />
      <Header />
      <Carousel />
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
