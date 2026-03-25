import "./App.css";
import "bootstrap/dist/css/bootstrap.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Header from "./layout/Header.jsx";
import Footer from "./layout/Footer.jsx";
import Topbar from "./components/Topbar.jsx";
import Carousel from "./components/Carousel.jsx";
import Featured from "./components/Featured.jsx";
import Chances from "./components/Chances.jsx";
import ProductList from "./components/ProductList.jsx";
import HeaderLinks from "./components/HeaderLinks.jsx";
import NewDeals from "./components/NewDeals.jsx";
import AdBanners from "./components/AdBanners.jsx";
import SuggestedProducts from "./components/SuggestedProducts.jsx";
import Brands from "./components/Brands.jsx";
import PopularLinks from "./components/PopularLinks.jsx";

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
      <NewDeals />
      <ProductList />
      <AdBanners />
      <SuggestedProducts />
      <ProductList />
      <Brands />
      <PopularLinks />
      {/* <Routes>
        <Route path="/" element={} />
      </Routes> */}
      <Footer />
    </BrowserRouter>
  );
}

export default App;
