import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { apiGet, apiDelete, apiPost } from "../utils/api";

const InvoiceIndex = () => {
  const [invoices, setInvoices] = useState([]);
  const [allInvoices, setAllInvoices] = useState([]);

  const [sellerFilter, setSellerFilter] = useState("");
  const [buyerFilter, setBuyerFilter] = useState("");
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [descriptionFilter, setDescriptionFilter] = useState("");
  const [limitCount, setLimitCount] = useState("");

  const formatPrice = (value) => {
    if (!value) return "-";
    return Number(value).toLocaleString("cs-CZ") + " Kč";
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("cs-CZ");
  };

  const daysUntil = (date) => {
    const now = new Date();
    const due = new Date(date);
    return Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  };

  useEffect(() => {
    apiGet("/api/invoices")
      .then((data) => setAllInvoices(data || []))
      .catch((err) => {
        console.error("Chyba při načtení faktur:", err);
        alert("Nepodařilo se načíst faktury.");
      });
  }, []);

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

  useEffect(() => {
    let result = allInvoices.filter((inv) => {
      const sellerName = inv.seller?.name || "";
      const buyerName = inv.buyer?.name || "";
      const product = inv.product || "";
      const note = inv.note || "";
      const priceNum = Number(inv.price) || 0;

      if (sellerFilter && sellerName !== sellerFilter) return false;
      if (buyerFilter && buyerName !== buyerFilter) return false;

      if (priceFrom !== "" && priceNum < Number(priceFrom)) return false;
      if (priceTo !== "" && priceNum > Number(priceTo)) return false;

      if (descriptionFilter.trim()) {
        const descTerm = descriptionFilter.trim().toLowerCase();
        const combined = `${product} ${note}`.toLowerCase();
        if (!combined.includes(descTerm)) return false;
      }

      return true;
    });

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
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="m-0">Seznam faktur</h1>
        <Link to="/invoices/create" className="btn btn-success">
          <i className="fa fa-plus me-1"></i>
          Nová faktura
        </Link>
      </div>

      {/* FILTR */}
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

      <p className="mb-1 text-muted">
        Počet faktur: {invoices.length}
      </p>

      {/* TABULKA */}
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
            <th className="text-end">Akce</th>
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
              <td>{formatDate(inv.issued)}</td>
              <td>{formatDate(inv.dueDate)}</td>
              <td>{formatPrice(inv.price)}</td>

              <td className="text-end">
                <Link
                  to={`/invoices/show/${inv._id}`}
                  className="btn btn-outline-primary btn-sm me-1"
                  title="Zobrazit"
                >
                  <i className="fa fa-eye"></i>
                </Link>

                <Link
                  to={`/invoices/edit/${inv._id}`}
                  className="btn btn-outline-secondary btn-sm me-1"
                  title="Upravit"
                >
                  <i className="fa fa-edit"></i>
                </Link>

                <button
                  type="button"
                  className="btn btn-outline-warning btn-sm me-1"
                  onClick={() => handleArchive(inv._id)}
                  title="Archivovat"
                >
                  <i className="fa fa-archive"></i>
                </button>

                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => handleDelete(inv._id)}
                  title="Odstranit"
                >
                  <i className="fa fa-trash"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InvoiceIndex;