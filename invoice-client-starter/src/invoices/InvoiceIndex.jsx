// InvoiceIndex.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet, apiDelete, apiPost  } from "../utils/api"; // stejný helper jako u osob

const InvoiceIndex = () => {
  const [invoices, setInvoices] = useState([]);
  const [allInvoices, setAllInvoices] = useState([]); // kompletní seznam z API
  const [search, setSearch] = useState("");           // text ve vyhledávacím poli

  // načtení faktur
  useEffect(() => {
    apiGet("/api/invoices")
      .then((data) => {
        setInvoices(data);
        setAllInvoices(data);
      })
      .catch((err) => {
        console.error("Chyba při načtení faktur:", err);
        alert("Nepodařilo se načíst faktury.");
      });
  }, []);

  // live filtrování při psaní – stejný princip jako u osob
  useEffect(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      setInvoices(allInvoices);
      return;
    }

    const filtered = allInvoices.filter((inv) => {
      const fields = [
        inv.invoiceNumber,   // číslo faktury
        inv.product,         // produkt
        inv.note,            // poznámka
        inv.seller?.name,    // jméno dodavatele
        inv.buyer?.name,     // jméno odběratele
      ];

      return fields.some((f) =>
        (f || "").toString().toLowerCase().includes(term)
      );
    });

    setInvoices(filtered);
  }, [search, allInvoices]);

  const handleResetFilter = () => {
    setSearch(""); // efekt výše sám vrátí původní seznam
  };

  // SMAZÁNÍ faktury
  const handleDelete = async (id) => {
  if (!window.confirm("Opravdu chceš fakturu smazat?")) return;

    try {
      await apiDelete(`/api/invoices/${id}`); // ← BEZ koncového /, stejně jako detail

      setInvoices((prev) => prev.filter((inv) => inv._id !== id));
      setAllInvoices((prev) => prev.filter((inv) => inv._id !== id));
    } catch (error) {
      console.error("Chyba při mazání faktury:", error);
      alert(error.message || "Mazání faktury selhalo.");
    }
  };

  const handleArchive = async (id) => {
  if (!window.confirm("Archivovat fakturu?")) return;


    try {
      await apiPost(`/api/invoices/${id}/archive/`, {}); // očekávám endpoint /archive/

      setInvoices((prev) => prev.filter((inv) => inv._id !== id));
      setAllInvoices((prev) => prev.filter((inv) => inv._id !== id));
    } catch (error) {
      console.error("Chyba při archivaci faktury:", error);
      alert(error.message || "Archivace faktury selhala.");
    }
  };

  return (
    <div>
      <h1>Seznam faktur</h1>

      <p className="mb-1 text-muted">Počet faktur: {invoices.length}</p>

      <div className="d-flex align-items-center mb-3 mt-3">
        <input
          type="text"
          className="form-control me-2"
          placeholder="Vyhledat (číslo, produkt, klient)…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          type="button"
          className="btn btn-secondary btn-sm py-1"
          onClick={handleResetFilter}
          style={{maxHeight: "50px", minWidth: "120px"}}
        >
          Zrušit filtr
        </button>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Číslo</th>
            <th>Dodavatel</th>
            <th>Odběratel</th>
            <th>Produkt</th>
            <th>Vystaveno</th>
            <th>Splatnost</th>
            <th>Cena</th>
            <th>Akce</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv, index) => (
            <tr key={inv._id}>
              <td>{index + 1}</td>
              <td>{inv.invoiceNumber}</td>
              <td>{inv.seller?.name || "-"}</td>
              <td>{inv.buyer?.name || "-"}</td>
              <td>{inv.product}</td>
              <td>{inv.issued}</td>
              <td>{inv.dueDate}</td>
              <td>{inv.price}</td>
              <td>
                <Link
                  to={`/invoices/show/${inv._id}`}
                  className="btn btn-info btn-sm me-2"
                >
                  Zobrazit
                </Link>

                <Link
                  to={`/invoices/edit/${inv._id}`}
                  className="btn btn-secondary btn-sm me-2"
                >
                  Upravit
                </Link>

                <button
                  type="button"
                  className="btn btn-warning btn-sm me-2"
                  onClick={() => handleArchive(inv._id)}
                >
                  Archivovat
                </button>

                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(inv._id)}
                >
                  Odstranit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Link to="/invoices/create" className="btn btn-success mt-3">
        Nová faktura
      </Link>
    </div>
  );
};

export default InvoiceIndex;