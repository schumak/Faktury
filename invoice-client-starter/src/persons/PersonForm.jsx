// PersonForm.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { apiGet, apiPost, apiPut } from "../utils/api";
import Country from "./Country"; // klidně může zůstat

const PersonForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [person, setPerson] = useState({
    name: "",
    identificationNumber: "",
    taxNumber: "",
    accountNumber: "",
    bankCode: "",
    iban: "",
    telephone: "",
    mail: "",
    street: "",
    zip: "",
    city: "",
    country: "CZECHIA",
    note: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // EDIT – načíst existující osobu
  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError(null);

    apiGet(`/api/persons/${id}`)
      .then((data) => {
        setPerson(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Nepodařilo se načíst osobu.");
        setLoading(false);
      });
  }, [id]);

  function handleChange(e) {
    const { name, value } = e.target;
    setPerson((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = { ...person };

    const request = id
      ? apiPut(`/api/persons/${id}`, payload)   // update
      : apiPost("/api/persons", payload);       // create

    request
      .then(() => {
        navigate("/persons");
      })
      .catch(() => {
        setError("Nepodařilo se uložit osobu.");
        setLoading(false);
      });
  }

  // kliknutí mimo panel = Zrušit
  function handleOverlayClick() {
    navigate("/persons");
  }

  if (loading && !id) {
    return <p>Načítám…</p>;
  }

  return (
    // překryv přes celou stránku
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
      style={{
        background: "rgba(0,0,0,0.25)",
        zIndex: 1050,
      }}
      onClick={handleOverlayClick}
    >
      {/* vlastní panel – kliknutí uvnitř nesmí zavřít */}
      <div
        className="card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "480px",            
          maxHeight: "80vh",            
          overflowY: "auto",             // skroluje se jen uvnitř
          boxShadow: "0 14px 35px rgba(0,0,0,0.3)", 
          borderRadius: "8px",
        }}
      >
        <div className="card-body" style={{ padding: "16px 20px" }}>
          <h1 className="h4 text-center mb-3">
            {id ? "Upravit osobu" : "Nová osoba"}
          </h1>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Jméno */}
            <div className="mb-2">
              <label className="form-label small">Jméno</label>
              <input
                className="form-control form-control-sm"
                name="name"
                value={person.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* IČO */}
            <div className="mb-2">
              <label className="form-label small">IČO</label>
              <input
                className="form-control form-control-sm"
                name="identificationNumber"
                value={person.identificationNumber || ""}
                onChange={handleChange}
              />
            </div>

            {/* DIČ */}
            <div className="mb-2">
              <label className="form-label small">DIČ</label>
              <input
                className="form-control form-control-sm"
                name="taxNumber"
                value={person.taxNumber || ""}
                onChange={handleChange}
              />
            </div>

            {/* Bankovní účet */}
            <div className="mb-2">
              <label className="form-label small">Číslo účtu</label>
              <input
                className="form-control form-control-sm"
                name="accountNumber"
                value={person.accountNumber || ""}
                onChange={handleChange}
              />
            </div>

            {/* Kód banky */}
            <div className="mb-2">
              <label className="form-label small">Kód banky</label>
              <input
                className="form-control form-control-sm"
                name="bankCode"
                value={person.bankCode || ""}
                onChange={handleChange}
              />
            </div>

            {/* IBAN */}
            <div className="mb-2">
              <label className="form-label small">IBAN</label>
              <input
                className="form-control form-control-sm"
                name="iban"
                value={person.iban || ""}
                onChange={handleChange}
              />
            </div>

            {/* Telefon */}
            <div className="mb-2">
              <label className="form-label small">Telefon</label>
              <input
                className="form-control form-control-sm"
                name="telephone"
                value={person.telephone || ""}
                onChange={handleChange}
              />
            </div>

            {/* E-mail */}
            <div className="mb-2">
              <label className="form-label small">E-mail</label>
              <input
                type="email"
                className="form-control form-control-sm"
                name="mail"
                value={person.mail || ""}
                onChange={handleChange}
              />
            </div>

            {/* Adresa – ulice */}
            <div className="mb-2">
              <label className="form-label small">Ulice</label>
              <input
                className="form-control form-control-sm"
                name="street"
                value={person.street || ""}
                onChange={handleChange}
              />
            </div>

            {/* Město */}
            <div className="mb-2">
              <label className="form-label small">Město</label>
              <input
                className="form-control form-control-sm"
                name="city"
                value={person.city || ""}
                onChange={handleChange}
              />
            </div>

            {/* PSČ */}
            <div className="mb-2">
              <label className="form-label small">PSČ</label>
              <input
                className="form-control form-control-sm"
                name="zip"
                value={person.zip || ""}
                onChange={handleChange}
              />
            </div>

            {/* Země */}
            <div className="mb-2">
              <label className="form-label small">Země</label>
              <select
                className="form-control form-control-sm"
                name="country"
                value={person.country || "CZECHIA"}
                onChange={handleChange}
              >
                <option value="CZECHIA">Česká republika</option>
                <option value="SLOVAKIA">Slovensko</option>
              </select>
            </div>

            {/* Poznámka */}
            <div className="mb-3">
              <label className="form-label small">Poznámka</label>
              <textarea
                className="form-control form-control-sm"
                name="note"
                value={person.note || ""}
                onChange={handleChange}
                rows={2}
              />
            </div>

            {/* Tlačítka */}
            <div className="d-flex justify-content-center mt-2 mb-1">
              <button type="submit" className="btn btn-primary btn-sm me-3">
                Uložit
              </button>

              <Link
                to="/persons"
                className="btn btn-secondary btn-sm"
                onClick={(e) => e.stopPropagation()}
              >
                Zrušit
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PersonForm;