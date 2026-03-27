import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import CheckoutComponent from "../components/CheckoutComponent";
import { logoutUser } from "../redux/authSlice";
import { Link } from "react-router-dom";

function CheckoutPage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [email, setEmail] = useState("");

  return (
    <div>
      <CheckoutComponent />
      <div className="container">
        <div className="row mt-5">
          <div className="col-6">
            <div className="d-flex justify-content-between align-items-center w-100">
              <h4>
                <strong>HESABINIZ</strong>
              </h4>
              {user ? (
                <a
                  className="text-selected"
                  role="button"
                  onClick={() => dispatch(logoutUser())}
                >
                  Çıkış Yap
                </a>
              ) : (
                <Link className="text-selected" to="/login">
                  Giriş Yap
                </Link>
              )}
            </div>
            <input
              className="w-100 py-3 px-3 rounded"
              style={{ border: "1px solid #BDBDBD" }}
              placeholder="Mail adresinizi giriniz"
              value={user ? user.email : email}
              disabled={!!user}
              onChange={(e) => setEmail(e.target.value)}
            />
            <span>
              Sipariş bilgileriniz bu mail adresi üzerinden paylaşılacaktır.
            </span>
            <div className="d-flex justify-content-between align-items-center w-100">
              <h4>
                <strong>TESLİMAT</strong>
              </h4>
              <span
                className="text-selected"
                role="button"
                onClick={() => dispatch(logoutUser())}
              >
                Adres Ekle
              </span>
            </div>
            <div className="">
              <input
                className="custom-checkbox me-2"
                type="checkbox"
                id="flexCheckDefault"
              />
              <label className="form-check-label" htmlFor="flexCheckDefault">
                <strong role="button">Gizlilik Sözlemesini</strong> ve{" "}
                <strong role="button">Satış Sözleşmesini</strong> okudum,
                onaylıyorum.
              </label>
            </div>
            <button className="btn orange-btn w-100 rounded py-3 fw-semibold">
              Siparişi Tamamla
            </button>
            <div className="mt-5">
              <h4>
                <strong>ÖDEME</strong>
              </h4>
            </div>
          </div>
          <div className="col-6">
            <h4>asafs</h4>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
