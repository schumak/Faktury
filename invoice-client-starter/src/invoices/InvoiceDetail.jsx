// InvoiceDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { apiGet } from "../utils/api";

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setError("Chybí ID faktury v URL.");
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    apiGet(`/api/invoices/${id}`)
      .then((data) => {
        if (!isMounted) return;
        setInvoice(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        if (!isMounted) return;
        setError("Nepodařilo se načíst data faktury.");
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return <p>Načítám detail faktury…</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!invoice) {
    return <p>Faktura nebyla nalezena.</p>;
  }

  // jména se berou z vnořených objektů, NE celý objekt
  const sellerName = invoice.seller?.name || "-";
  const buyerName = invoice.buyer?.name || "-";

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
      style={{ background: "rgba(0,0,0,0.25)", zIndex: 1050 }}
      onClick={() => navigate("/invoices")}
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
        <div className="card-body" style={{ padding: "24px 28px" }}>
          <h1 className="h4 text-center mb-3">Detail faktury</h1>

          <h3 className="h5 mb-3">
            {invoice.invoiceNumber || "-"}
            {invoice.product ? ` – ${invoice.product}` : ""}
          </h3>

          {/* Základní údaje */}
          <div className="mb-2">
            <div className="small text-muted">Číslo faktury</div>
            <div>{invoice.invoiceNumber || "-"}</div>
          </div>

          <div className="mb-2">
            <div className="small text-muted">Datum vystavení</div>
            <div>{invoice.issued || "-"}</div>
          </div>

          <div className="mb-2">
            <div className="small text-muted">Datum splatnosti</div>
            <div>{invoice.dueDate || "-"}</div>
          </div>

          {/* Subjekty */}
          <div className="mb-2">
            <div className="small text-muted">Dodavatel</div>
            <div>{sellerName}</div>
          </div>

          <div className="mb-2">
            <div className="small text-muted">Odběratel</div>
            <div>{buyerName}</div>
          </div>

          {/* Produkt / částka */}
          <div className="mb-2">
            <div className="small text-muted">Produkt / služba</div>
            <div>{invoice.product || "-"}</div>
          </div>

          <div className="mb-2">
            <div className="small text-muted">Cena bez DPH</div>
            <div>
              {invoice.price != null && invoice.price !== ""
                ? `${invoice.price} Kč`
                : "-"}
            </div>
          </div>

          <div className="mb-3">
            <div className="small text-muted">DPH</div>
            <div>
              {invoice.vat != null && invoice.vat !== ""
                ? `${invoice.vat} %`
                : "-"}
            </div>
          </div>

          {/* Poznámka */}
          <div className="mb-3">
            <div className="small text-muted">Poznámka</div>
            <div>{invoice.note || "-"}</div>
          </div>

          {/* Tlačítka */}
          <div className="d-flex justify-content-center mt-2 mb-1">
            <Link
              to={`/invoices/edit/${invoice._id}`}
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
                navigate("/invoices");
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

export default InvoiceDetail;