import "../styles/Header.css";
import profileIcon from "../assets/Header/profile-icon.svg";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../redux/authSlice";
import { Link } from "react-router-dom";

function Header() {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);

  return (
    <header className="site-header sticky-top">
      <div className="container">
        <div className="header-main d-flex align-items-center justify-content-between">
          <h1>
            <Link to="/" style={{ textDecoration: "none" }} className="logo">
              <span className="orange-text">Listensi Panel</span>
            </Link>
          </h1>
          <div className="header-actions">
            {user ? (
              <div className="dropdown">
                <div
                  className="header-action"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <img
                    src={profileIcon}
                    style={{
                      width: "40px",
                      backgroundColor: "#F1F2F6",
                      padding: "5px",
                      borderRadius: "10px",
                    }}
                  />
                  <span className="header-action-text">
                    <small>
                      {user.name.charAt(0).toUpperCase() + user.name.slice(1)}{" "}
                      {user.surname.toUpperCase()}
                    </small>
                    <strong>Hesabım</strong>
                  </span>
                </div>
                <ul className="dropdown-menu dropdown-menu-end">
                  {user.isAdmin && (
                    <li>
                      <Link className="dropdown-item" to="/">
                        Admin Paneli
                      </Link>
                    </li>
                  )}
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <Link
                      to="/login"
                      className="dropdown-item text-danger"
                      onClick={() => {
                        dispatch(logoutUser());
                      }}
                    >
                      Çıkış Yap
                    </Link>
                  </li>
                </ul>
              </div>
            ) : (
              <Link className="header-action" to="/login">
                <img
                  src={profileIcon}
                  style={{
                    width: "40px",
                    backgroundColor: "#F1F2F6",
                    padding: "5px",
                    borderRadius: "10px",
                  }}
                />
                <span className="header-action-text">
                  <small>Hoş geldiniz</small>
                  <strong>Giriş Yap</strong>
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
