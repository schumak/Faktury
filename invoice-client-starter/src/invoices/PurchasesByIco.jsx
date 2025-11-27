import React, { useState, useEffect } from "react";

function PurchasesByIco() {
  const [ico, setIco] = useState("");
  const [invoices, setInvoices] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [mode, setMode] = useState("purchases"); // "purchases" nebo "sales"

  useEffect(() => {
    // automatické načítání po dopsání IČ (8 číslic) nebo změně režimu
    if (ico && ico.length === 8 && /^[0-9]+$/.test(ico)) {
      const timeout = setTimeout(() => {
        loadInvoices();
      }, 500); // debounce 500 ms

      return () => clearTimeout(timeout);
    } else {
      // pokud IČ není validní, smažeme výsledky a hlášku
      setInvoices([]);
      setStatusMessage("");
    }
  }, [ico, mode]);

  function loadInvoices() {
    if (!ico) {
      alert("Zadej IČ.");
      return;
    }

    const endpointType = mode; // "purchases" nebo "sales"

    fetch(`http://localhost:8000/api/identification/${ico}/${endpointType}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Chybná odpověď serveru");
        }
        return res.json();
      })
      .then((data) => {
        if (data.count === 0) {
          setInvoices([]);
          setStatusMessage(
            data.message ||
              (mode === "sales"
                ? "Nenalezeny žádné vystavené faktury."
                : "Nenalezeny žádné přijaté faktury.")
          );
        } else {
          const list = Array.isArray(data.invoices) ? data.invoices : [];
          setInvoices(list);
          setStatusMessage(
            `${mode === "sales" ? "Vystavených" : "Přijatých"} faktur: ${
              data.count
            }`
          );
        }
      })
      .catch((err) => {
        console.error(err);
        alert("Došlo k chybě při načítání faktur.");
      });
  }

  return (
    <div className="mt-4">
      <h1>
        {mode === "sales"
          ? "Vystavené faktury dle IČ"
          : "Přijaté faktury dle IČ"}
      </h1>

      {/* IČ + načtení */}
      <div className="mb-3 d-flex align-items-center">
        <input
          type="text"
          className="form-control me-2"
          style={{ maxWidth: "200px" }}
          value={ico}
          onChange={(e) => setIco(e.target.value)}
          placeholder="Zadej IČ (např. 05861381)"
        />
      </div>

      {/* volba režimu */}
      <div className="mb-3">
        <button
          type="button"
          className={
            "btn me-2 " +
            (mode === "purchases" ? "btn-primary" : "btn-outline-primary")
          }
          onClick={() => setMode("purchases")}
        >
          Přijaté faktury
        </button>
        <button
          type="button"
          className={
            "btn " +
            (mode === "sales" ? "btn-success" : "btn-outline-success")
          }
          onClick={() => setMode("sales")}
        >
          Vystavené faktury
        </button>
      </div>

      {statusMessage && (
        <div className="alert alert-info py-2">{statusMessage}</div>
      )}

      {Array.isArray(invoices) && invoices.length > 0 && (
        <table className="table table-striped mt-3">
          <thead>
            <tr>
              <th>Číslo faktury</th>
              <th>Datum</th>
              <th>Dodavatel</th>
              <th>Odběratel</th>
              <th>Datum vystavení</th>
              <th>Cena</th>
              <th>DPH</th>
              <th>Poznámka</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv._id}>
                <td>{inv.invoiceNumber}</td>
                <td>{inv.issued}</td>
                <td>{inv.seller?.name}</td>
                <td>{inv.buyer?.name}</td>
                <td>{inv.issued}</td>
                <td>{inv.price} Kč</td>
                <td>{inv.vat} %</td>
                <td>{inv.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default PurchasesByIco;