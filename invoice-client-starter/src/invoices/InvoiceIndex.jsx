// InvoiceIndex.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { apiGet, apiDelete, apiPost } from "../utils/api";

const InvoiceIndex = () => {
  const [invoices, setInvoices] = useState([]);
  const [allInvoices, setAllInvoices] = useState([]);

  // stav – HORNÍ FILTR
  const [sellerFilter, setSellerFilter] = useState("");     // Dodavatel
  const [buyerFilter, setBuyerFilter] = useState("");       // Odběratel
  const [priceFrom, setPriceFrom] = useState("");           // Cena od
  const [priceTo, setPriceTo] = useState("");               // Cena do
  const [descriptionFilter, setDescriptionFilter] = useState(""); // Popis
  const [limitCount, setLimitCount] = useState("");         // Limit počtu faktur

  // načtení faktur z API
  useEffect(() => {
    apiGet("/api/invoices")
      .then((data) => {
        setAllInvoices(data || []);
      })
      .catch((err) => {
        console.error("Chyba při načtení faktur:", err);
        alert("Nepodařilo se načíst faktury.");
      });
  }, []);

  // unikátní dodavatelé a odběratelé pro selecty
  const sellerOptions = useMemo(() => {
    const names = new Set();
    allInvoices.forEach((inv) => {
      if (inv.seller?.name) names.add(inv.seller.name);
    });
    return Array.from(names);
  }, [allInvoices]);

  const buyerOptions = useMemo(() => {
    const names = new Set();
    allInvoices.forEach((inv) => {
      if (inv.buyer?.name) names.add(inv.buyer.name);
    });
    return Array.from(names);
  }, [allInvoices]);

  // Hlavní filtrování (horní formulář + rychlé vyhledávání)
  useEffect(() => {
    let result = allInvoices.filter((inv) => {
      // převody na bezpečné hodnoty
      const sellerName = inv.seller?.name || "";
      const buyerName = inv.buyer?.name || "";
      const product = inv.product || "";
      const note = inv.note || "";
      const priceNum = Number(inv.price) || 0;

      // 1) Dodavatel
      if (sellerFilter && sellerName !== sellerFilter) return false;

      // 2) Odběratel
      if (buyerFilter && buyerName !== buyerFilter) return false;

      // 3) Cena od / do
      if (priceFrom !== "" && priceNum < Number(priceFrom)) return false;
      if (priceTo !== "" && priceNum > Number(priceTo)) return false;

      // 4) Popis – beru produkt + poznámku
      if (descriptionFilter.trim()) {
        const descTerm = descriptionFilter.trim().toLowerCase();
        const combined = `${product} ${note}`.toLowerCase();
        if (!combined.includes(descTerm)) return false;
      }

      return true;
    });

    // limit počtu faktur
    if (limitCount) {
      const limit = Number(limitCount);
      if (!Number.isNaN(limit) && limit > 0) {
        result = result.slice(0, limit);
      }
    }

    setInvoices(result);
  }, [
    allInvoices,
    sellerFilter,
    buyerFilter,
    priceFrom,
    priceTo,
    descriptionFilter,
    limitCount,
  ]);


  const handleResetAllFilters = () => {
    setSellerFilter("");
    setBuyerFilter("");
    setPriceFrom("");
    setPriceTo("");
    setDescriptionFilter("");
    setLimitCount("");
  };

  // SMAZÁNÍ faktury
  const handleDelete = async (id) => {
    if (!window.confirm("Opravdu chceš fakturu smazat?")) return;

    try {
      await apiDelete(`/api/invoices/${id}`);

      setAllInvoices((prev) => prev.filter((inv) => inv._id !== id));
    } catch (error) {
      console.error("Chyba při mazání faktury:", error);
      alert(error.message || "Mazání faktury selhalo.");
    }
  };

  const handleArchive = async (id) => {
    if (!window.confirm("Archivovat fakturu?")) return;

    try {
      await apiPost(`/api/invoices/${id}/archive/`, {});
      setAllInvoices((prev) => prev.filter((inv) => inv._id !== id));
    } catch (error) {
      console.error("Chyba při archivaci faktury:", error);
      alert(error.message || "Archivace faktury selhala.");
    }
  };

  return (
    <div>
      <h1>Seznam faktur</h1>

      {/* HORNÍ FILTRAČNÍ FORMULÁŘ */}
      <form className="mb-3" onSubmit={(e) => e.preventDefault()}>
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Dodavatel:</label>
            <select
              className="form-select"
              value={sellerFilter}
              onChange={(e) => setSellerFilter(e.target.value)}
            >
              <option value="">(nevybrán)</option>
              {sellerOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label">Odběratel:</label>
            <select
              className="form-select"
              value={buyerFilter}
              onChange={(e) => setBuyerFilter(e.target.value)}
            >
              <option value="">(nevybrán)</option>
              {buyerOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-2">
            <label className="form-label">Cena od:</label>
            <input
              type="number"
              className="form-control"
              placeholder="neuveden"
              value={priceFrom}
              onChange={(e) => setPriceFrom(e.target.value)}
            />
          </div>

          <div className="col-md-2">
            <label className="form-label">Cena do:</label>
            <input
              type="number"
              className="form-control"
              placeholder="neuveden"
              value={priceTo}
              onChange={(e) => setPriceTo(e.target.value)}
            />
          </div>

          <div className="col-md-2">
            <label className="form-label">Limit počtu faktur:</label>
            <input
              type="number"
              className="form-control"
              placeholder="neuveden"
              value={limitCount}
              onChange={(e) => setLimitCount(e.target.value)}
            />
          </div>          

          <div className="col-md-4">
            <label className="form-label">Popis:</label>
            <input
              type="text"
              className="form-control"
              placeholder="neuveden"
              value={descriptionFilter}
              onChange={(e) => setDescriptionFilter(e.target.value)}
            />
          </div>


          <div className="col-md-2 d-flex align-items-end">
            <button
              type="button"
              className="btn btn-secondary w-100"
              onClick={handleResetAllFilters}
            >
              Zrušit filtry
            </button>
          </div>
        </div>

      </form>


      <p className="mb-1 text-muted">Počet faktur: {invoices.length}</p>

      {/* TABULKA FAKTUR */}
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