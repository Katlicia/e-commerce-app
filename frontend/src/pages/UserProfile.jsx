import { Link } from "react-router-dom";
import HeaderLinks from "../components/HeaderLinks";

function UserProfile() {
  return (
    <>
      <HeaderLinks />
      <div className="container my-4">
        <div className="pd-breadcrumb mb-3">
          <Link to="/">Anasayfa</Link>
          {" / "}
          <span style={{ color: "black" }}>Profiliniz</span>
        </div>
      </div>
    </>
  );
}

export default UserProfile;
