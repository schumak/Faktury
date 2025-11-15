import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

function InvoiceForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [persons, setPersons] = useState([]);

  const [form, setForm] = useState({
    invoiceNumber: "",
    sellerId: "",
    buyerId: "",
    issued: "",
    dueDate: "",
    product: "",
    price: "",
    vat: "",
    note: "",
  });

  // načti seznam osob pro dropdown
  useEffect(() => {
    fetch("http://localhost:8000/api/persons/")
      .then((res) => res.json())
      .then((data) => setPersons(data));
  }, []);

  // pokud editace, načti fakturu
  useEffect(() => {
    if (!id) return;

    fetch(`http://localhost:8000/api/invoices/${id}/`)
      .then((res) => res.json())
      .then((data) => {
        setForm({
          invoiceNumber: data.invoiceNumber || "",
          sellerId: data.seller?._id || "",
          buyerId: data.buyer?._id || "",
          issued: data.issued || "",
          dueDate: data.dueDate || "",
          product: data.product || "",
          price: data.price || "",
          vat: data.vat || "",
          note: data.note || "",
        });
      });
  }, [id]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    // payload přesně podle Varianty B
    const payload = {
      invoiceNumber: form.invoiceNumber || undefined,
      seller: { _id: Number(form.sellerId) },
      buyer: { _id: Number(form.buyerId) },
      issued: form.issued,
      dueDate: form.dueDate,
      product: form.product,
      price: form.price,
      vat: form.vat,
      note: form.note,
    };

    const method = id ? "PUT" : "POST";
    const url = id
      ? `http://localhost:8000/api/invoices/${id}/`
      : "http://localhost:8000/api/invoices/";

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) {
          const error = await res.json();
          console.error("Chyba:", error);
          alert("Chyba při ukládání faktury");
          return;
        }
        return res.json();
      })
      .then(() => {
        navigate("/invoices");
      });
  }

  return (
    <div className="mt-4">
      <h1>{id ? "Upravit fakturu" : "Nová faktura"}</h1>

      <form onSubmit={handleSubmit} className="mt-3">

        {/* ČÍSLO FAKTURY */}
        <div className="mb-3">
          <label className="form-label">Číslo faktury</label>
          <input
            type="text"
            className="form-control"
            name="invoiceNumber"
            value={form.invoiceNumber}
            onChange={handleChange}
            placeholder="Např. 2023001"
          />
        </div>

        {/* PRODÁVAJÍCÍ */}
        <div className="mb-3">
          <label className="form-label">Prodávající</label>
          <select
            className="form-control"
            name="sellerId"
            value={form.sellerId}
            onChange={handleChange}
          >
            <option value="">-- Vyber osobu --</option>
            {persons.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* KUPUJÍCÍ */}
        <div className="mb-3">
          <label className="form-label">Kupující</label>
          <select
            className="form-control"
            name="buyerId"
            value={form.buyerId}
            onChange={handleChange}
          >
            <option value="">-- Vyber osobu --</option>
            {persons.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* DATUM VYSTAVENÍ */}
        <div className="mb-3">
          <label className="form-label">Datum vystavení</label>
          <input
            type="date"
            className="form-control"
            name="issued"
            value={form.issued}
            onChange={handleChange}
          />
        </div>

        {/* DATUM SPLATNOSTI */}
        <div className="mb-3">
          <label className="form-label">Splatnost</label>
          <input
            type="date"
            className="form-control"
            name="dueDate"
            value={form.dueDate}
            onChange={handleChange}
          />
        </div>

        {/* PRODUKT */}
        <div className="mb-3">
          <label className="form-label">Produkt</label>
          <input
            type="text"
            className="form-control"
            name="product"
            value={form.product}
            onChange={handleChange}
            placeholder="Např. konzultace, článek..."
          />
        </div>

        {/* CENA */}
        <div className="mb-3">
          <label className="form-label">Cena</label>
          <input
            type="number"
            className="form-control"
            name="price"
            value={form.price}
            onChange={handleChange}
          />
        </div>

        {/* DPH */}
        <div className="mb-3">
          <label className="form-label">DPH (%)</label>
          <input
            type="number"
            className="form-control"
            name="vat"
            value={form.vat}
            onChange={handleChange}
          />
        </div>

        {/* POZNÁMKA */}
        <div className="mb-3">
          <label className="form-label">Poznámka</label>
          <textarea
            className="form-control"
            name="note"
            value={form.note}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Uložit
        </button>

        <Link to="/invoices" className="btn btn-secondary ms-2">
          Zpět
        </Link>
      </form>
    </div>
  );
}

export default InvoiceForm;
