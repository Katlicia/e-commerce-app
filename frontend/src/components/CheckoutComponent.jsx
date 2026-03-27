import { Link } from "react-router-dom";

function CheckoutComponent() {
  return (
    <div className=" site-header">
      <div className="container d-flex justify-content-end mt-5 mb-4">
        <Link to="/" style={{ color: "black" }}>
          <p>Alışverişe Geri Dönün</p>
        </Link>
      </div>
    </div>
  );
}

export default CheckoutComponent;
