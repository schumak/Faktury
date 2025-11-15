import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function InvoiceIndex() {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/invoices/")
      .then((res) => res.json())
      .then((data) => setInvoices(data));
  }, []);

function handleDelete(id) {
    if (!window.confirm("Opravdu chceš fakturu smazat?")) {
      return;
    }

    fetch(`http://localhost:8000/api/invoices/${id}/`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Chyba při mazání faktury");
        }
        // odstraníme fakturu ze stavu, ať se okamžitě ztratí ze seznamu
        setInvoices((prev) => prev.filter((inv) => inv._id !== id));
      })
      .catch((err) => {
        console.error(err);
        alert("Nepodařilo se smazat fakturu.");
      });
  }

  return (
    <div>
      <h1>Faktury</h1>

      <Link to="/invoices/create" className="btn btn-primary mb-3">
        Nová faktura
      </Link>

      <table className="table table-striped">
        <thead>
          <tr>
            <th>Číslo</th>
            <th>Prodávající</th>
            <th>Kupující</th>
            <th>Vystaveno</th>
            <th>Splatnost</th>
            <th>Cena</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv._id}>
              <td>{inv.invoiceNumber}</td>
              <td>{inv.seller?.name}</td>
              <td>{inv.buyer?.name}</td>
              <td>{inv.issued}</td>
              <td>{inv.dueDate}</td>
              <td>{inv.price}</td>
              <td>
                <Link to={`/invoices/show/${inv._id}`} className="btn btn-sm btn-info me-2">
                  Detail
                </Link>
                <Link to={`/invoices/edit/${inv._id}`} className="btn btn-sm btn-secondary">
                  Upravit
                </Link>
                <button
                  onClick={() => handleDelete(inv._id)} className="btn btn-sm btn-danger ms-2">
                  Smazat
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default InvoiceIndex;
