// InvoiceForm.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { apiGet, apiPost, apiPut } from "../utils/api";

const InvoiceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

const [fieldErrors, setFieldErrors] = useState({});

  // inicializace s výchozími hodnotami pro NOVOU fakturu
  const [invoice, setInvoice] = useState(() => {
    const toISODate = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };

    const today = new Date();
    const issued = toISODate(today);

    const due = new Date(today);
    due.setDate(due.getDate() + 10);
    const dueDate = toISODate(due);

    return {
      invoiceNumber: "",
      seller: "", // ID prodávajícího jako string
      buyer: "",  // ID kupujícího jako string
      issued,     // dnešní datum
      dueDate,    // +10 dní
      product: "",
      price: "",
      vat: "21",  // defaultně 21 %
      note: "",
    };
  });

  const [persons, setPersons] = useState([]);
  const [sellerSearch, setSellerSearch] = useState("");
  const [buyerSearch, setBuyerSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingInvoice, setLoadingInvoice] = useState(!!id);
  const [error, setError] = useState(null);

  // načtení osob pro výběr
  useEffect(() => {
    apiGet("/api/persons")
      .then((data) => setPersons(data))
      .catch((err) => {
        console.error(err);
        alert("Nepodařilo se načíst osoby.");
      });
  }, []);

  // pokud EDIT – načti fakturu a přepiš defaulty daty z API
  useEffect(() => {
    if (!id) {
      setLoadingInvoice(false);
      return;
    }

    setLoadingInvoice(true);
    setError(null);

    apiGet(`/api/invoices/${id}`)
      .then((data) => {
        setInvoice({
          invoiceNumber: data.invoiceNumber || "",
          seller: data.seller?._id != null ? String(data.seller._id) : "",
          buyer: data.buyer?._id != null ? String(data.buyer._id) : "",
          issued: data.issued || "",
          dueDate: data.dueDate || "",
          product: data.product || "",
          price: data.price ?? "",
          vat:
            data.vat !== undefined && data.vat !== null
              ? String(data.vat)
              : "21",
          note: data.note || "",
        });

        // předvyplníme vyhledávací inputy jménem vybraných osob
        setSellerSearch(data.seller?.name || "");
        setBuyerSearch(data.buyer?.name || "");

        setLoadingInvoice(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Nepodařilo se načíst fakturu.");
        setLoadingInvoice(false);
      });
  }, [id]);

  function handleChange(e) {
    const { name, value } = e.target;
    setInvoice((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({}); 

    const payload = {
      seller: invoice.seller !== "" ? { _id: Number(invoice.seller) } : null,
      buyer: invoice.buyer !== "" ? { _id: Number(invoice.buyer) } : null,
      issued: invoice.issued || null,
      dueDate: invoice.dueDate || null,
      product: invoice.product,
      price: invoice.price !== "" ? Number(invoice.price) : null,
      vat: invoice.vat !== "" ? Number(invoice.vat) : null,
      note: invoice.note,
    };

    // číslo posíláme jen při editaci – při vytvoření se generuje automaticky
    if (id) {
      payload.invoiceNumber = invoice.invoiceNumber;
    }

    console.log("Odesílám payload:", payload);

    const request = id
      ? apiPut(`/api/invoices/${id}`, payload)
      : apiPost("/api/invoices", payload);

    request
      .then(() => {
        navigate("/invoices");
      })
      .catch((err) => {
        console.error("Chyba při ukládání faktury:", err);

        // pokud backend vrátil validační chyby na polích
        if (err.data && typeof err.data === "object") {
          setFieldErrors(err.data);
          setError("Prosím opravte zvýrazněné chyby ve formuláři.");
        } else {
          setFieldErrors({});
          setError(err.message || "Nepodařilo se uložit fakturu.");
        }

        setLoading(false);
    });
  }

  if (loadingInvoice) {
    return <p>Načítám fakturu…</p>;
  }

  // filtrování osob podle vyhledávacího textu (omezíme na 10 výsledků)
  const filteredSellers = persons
    .filter((p) =>
      p.name.toLowerCase().includes(sellerSearch.toLowerCase())
    )
    .slice(0, 10);

  const filteredBuyers = persons
    .filter((p) =>
      p.name.toLowerCase().includes(buyerSearch.toLowerCase())
    )
    .slice(0, 10);

  // klik na osobu v seznamu dodavatelů
  const selectSeller = (person) => {
    setInvoice((prev) => ({ ...prev, seller: String(person._id) }));
    setSellerSearch(person.name);
  };

  // klik na osobu v seznamu odběratelů
  const selectBuyer = (person) => {
    setInvoice((prev) => ({ ...prev, buyer: String(person._id) }));
    setBuyerSearch(person.name);
  };

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
          <h1 className="h3 text-center mb-4">
            {id ? "Upravit fakturu" : "Vytvořit fakturu"}
          </h1>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Číslo faktury – jen pro info, generuje se na backendu */}
            <div className="mb-3">
              <label className="form-label">Číslo faktury:</label>
              <input
                className="form-control"
                name="invoiceNumber"
                placeholder="Číslo faktury bude doplněno automaticky"
                value={invoice.invoiceNumber}
                onChange={handleChange}
                readOnly
              />
            </div>

            {/* Vystaveno */}
            <div className="mb-3">
              <label className="form-label">Datum vystavení:</label>
              <input
                type="date"
                className="form-control"
                name="issued"
                value={invoice.issued || ""}
                onChange={handleChange}
              />
            </div>

            {/* Splatnost */}
            <div className="mb-3">
              <label className="form-label">Datum splatnosti:</label>
              <input
                type="date"
                className="form-control"
                name="dueDate"
                value={invoice.dueDate || ""}
                onChange={handleChange}
              />
            </div>

            {/* Produkt */}
            <div className="mb-3">
              <label className="form-label">Název produktu/služby:</label>
              <input
                className="form-control"
                name="product"
                placeholder="Zadejte název produktu/služby"
                value={invoice.product}
                onChange={handleChange}
              />
              {fieldErrors.product &&
                fieldErrors.product.map((msg, i) => (
                  <div key={i} className="text-danger small">
                    {msg}
                  </div>
                ))}
            </div>

            {/* Cena + Kč */}
            <div className="mb-3">
              <label className="form-label">Cena bez DPH:</label>
              <div className="input-group">
                <input
                  type="number"
                  className="form-control"
                  name="price"
                  placeholder="Zadejte cenu bez DPH"
                  value={invoice.price}
                  onChange={handleChange}
                />
                {fieldErrors.price &&
                fieldErrors.price.map((msg, i) => (
                  <div key={i} className="text-danger small">
                    {msg}
                  </div>
                ))}
                <span className="input-group-text">Kč</span>
              </div>
            </div>

            {/* DPH */}
            <div className="mb-3">
              <label className="form-label">DPH (%):</label>
              <input
                type="number"
                className="form-control"
                name="vat"
                placeholder="Zadejte DPH"
                value={invoice.vat}
                onChange={handleChange}
              />
              {fieldErrors.vat &&
                fieldErrors.vat.map((msg, i) => (
                  <div key={i} className="text-danger small">
                    {msg}
                  </div>
                ))}
            </div>

            {/* Poznámka */}
            <div className="mb-3">
              <label className="form-label">Poznámka:</label>
              <textarea
                className="form-control"
                name="note"
                rows={2}
                value={invoice.note}
                onChange={handleChange}
              />
              {fieldErrors.note &&
                fieldErrors.note.map((msg, i) => (
                  <div key={i} className="text-danger small">
                    {msg}
                  </div>
                ))}
            </div>

            {/* DODAVATEL – autocomplete seznam */}
            <div className="mb-3">
              <label className="form-label">Dodavatel:</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Začni psát jméno dodavatele…"
                value={sellerSearch}
                onChange={(e) => {
                  setSellerSearch(e.target.value);
                  // při změně textu nevymazávám hned seller ID – můžeš podle potřeby doladit
                }}
              />
              {fieldErrors.seller &&
                fieldErrors.seller.map((msg, i) => (
                  <div key={i} className="text-danger small">
                    {msg}
                  </div>
                ))}
              {sellerSearch && (
                <ul
                  className="list-group mt-1"
                  style={{ maxHeight: "150px", overflowY: "auto" }}
                >
                  {filteredSellers.length === 0 && (
                    <li className="list-group-item small text-muted">
                      Nenalezen žádný dodavatel.
                    </li>
                  )}
                  {filteredSellers.map((p) => (
                    <li
                      key={p._id}
                      className={
                        "list-group-item list-group-item-action py-1" +
                        (String(p._id) === String(invoice.seller)
                          ? " active"
                          : "")
                      }
                      style={{ cursor: "pointer" }}
                      onClick={() => selectSeller(p)}
                    >
                      {p.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* ODBĚRATEL – autocomplete seznam */}
            <div className="mb-3">
              <label className="form-label">Odběratel:</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Začni psát jméno odběratele…"
                value={buyerSearch}
                onChange={(e) => {
                  setBuyerSearch(e.target.value);
                }}
              />
              {fieldErrors.buyer &&
                fieldErrors.buyer.map((msg, i) => (
                  <div key={i} className="text-danger small">
                    {msg}
                  </div>
                ))}
              {buyerSearch && (
                <ul
                  className="list-group mt-1"
                  style={{ maxHeight: "150px", overflowY: "auto" }}
                >
                  {filteredBuyers.length === 0 && (
                    <li className="list-group-item small text-muted">
                      Nenalezen žádný odběratel.
                    </li>
                  )}
                  {filteredBuyers.map((p) => (
                    <li
                      key={p._id}
                      className={
                        "list-group-item list-group-item-action py-1" +
                        (String(p._id) === String(invoice.buyer)
                          ? " active"
                          : "")
                      }
                      style={{ cursor: "pointer" }}
                      onClick={() => selectBuyer(p)}
                    >
                      {p.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Info o zvolených osobách */}
            <div className="mb-3">
              <div>
                Prodávající:{" "}
                <strong>
                  {persons.find(
                    (p) => String(p._id) === String(invoice.seller)
                  )?.name || "Žádný prodávající není vybrán."}
                </strong>
              </div>
              <div>
                Kupující:{" "}
                <strong>
                  {persons.find(
                    (p) => String(p._id) === String(invoice.buyer)
                  )?.name || "Žádný kupující není vybrán."}
                </strong>
              </div>
            </div>

            {/* Tlačítka */}
            <div className="d-flex justify-content-center mt-3">
              <button
                type="submit"
                className="btn btn-primary me-3"
                disabled={loading}
              >
                {loading ? "Ukládám..." : "Uložit"}
              </button>

              <Link
                to="/invoices"
                className="btn btn-secondary"
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

export default InvoiceForm;