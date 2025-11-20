// PersonDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { apiGet } from "../utils/api";

import Country from "./Country";

const getCountryLabel = (countryValue) => {
  if (!countryValue) return "";

  if (
    countryValue === Country?.CZECHIA ||
    countryValue === "CZECHIA" ||
    countryValue === "CZ"
  ) {
    return "Česká republika";
  }

  if (
    countryValue === Country?.SLOVAKIA ||
    countryValue === "SLOVAKIA" ||
    countryValue === "SK"
  ) {
    return "Slovensko";
  }

  return countryValue;
};

const PersonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setError("Chybí ID osoby v URL.");
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    apiGet(`/api/persons/${id}`)
      .then((data) => {
        if (!isMounted) return;
        setPerson(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        if (!isMounted) return;
        setError("Nepodařilo se načíst data osoby.");
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return <p>Načítám detail osoby…</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!person) {
    return <p>Osoba nebyla nalezena.</p>;
  }

  const countryLabel = getCountryLabel(person.country);

  // klik mimo panel = návrat na seznam
  const handleOverlayClick = () => {
    navigate("/persons");
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
      style={{
        background: "rgba(0,0,0,0.25)",
        zIndex: 1050,
      }}
      onClick={handleOverlayClick}
    >
      <div
        className="card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "520px",
          maxHeight: "80vh",
          overflowY: "auto",
          boxShadow: "0 14px 35px rgba(0,0,0,0.3)",
          borderRadius: "8px",
        }}
      >
        <div className="card-body" style={{ padding: "16px 20px" }}>
          <h1 className="h4 text-center mb-3">Detail osoby</h1>

          <h3 className="h5 mb-3">
            {person.name || "-"}{" "}
            {person.identificationNumber
              ? `(${person.identificationNumber})`
              : ""}
          </h3>

          <div className="mb-2">
            <div className="small text-muted">Jméno</div>
            <div>{person.name || "-"}</div>
          </div>

          <div className="mb-2">
            <div className="small text-muted">IČO</div>
            <div>{person.identificationNumber || "-"}</div>
          </div>

          <div className="mb-2">
            <div className="small text-muted">DIČ</div>
            <div>{person.taxNumber || "-"}</div>
          </div>

          <div className="mb-2">
            <div className="small text-muted">Bankovní účet</div>
            <div>
              {person.accountNumber && person.bankCode ? (
                <>
                  {person.accountNumber}/{person.bankCode}
                  {person.iban ? ` (${person.iban})` : null}
                </>
              ) : (
                "-"
              )}
            </div>
          </div>

          <div className="mb-2">
            <div className="small text-muted">Telefon</div>
            <div>{person.telephone || "-"}</div>
          </div>

          <div className="mb-2">
            <div className="small text-muted">E-mail</div>
            <div>{person.mail || "-"}</div>
          </div>

          <div className="mb-2">
            <div className="small text-muted">Sídlo</div>
            <div>
              {person.street || "-"}
              {person.city ? `, ${person.city}` : ""}
              {person.zip ? `, ${person.zip}` : ""}
              {countryLabel ? `, ${countryLabel}` : ""}
            </div>
          </div>

          <div className="mb-2">
            <div className="small text-muted">Stát</div>
            <div>{countryLabel || "-"}</div>
          </div>

          <div className="mb-3">
            <div className="small text-muted">Poznámka</div>
            <div>{person.note || "-"}</div>
          </div>

          <div className="d-flex justify-content-center mt-2 mb-1">
            <Link
              to={`/persons/edit/${person._id}`}
              className="btn btn-secondary btn-sm me-3"
              onClick={(e) => e.stopPropagation()}
            >
              Upravit
            </Link>

            <button
              type="button"
              className="btn btn-light btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate("/persons");
              }}
            >
              Zavřít
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonDetail;