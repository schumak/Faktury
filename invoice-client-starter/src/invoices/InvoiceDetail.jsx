import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

function InvoiceDetail() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8000/api/invoices/${id}/`)
      .then((res) => res.json())
      .then((data) => setInvoice(data));
  }, [id]);

  if (!invoice) return <p>Načítám…</p>;

  return (
    <div>
      <h1>Faktura {invoice.invoiceNumber}</h1>

      <p><strong>Prodávající:</strong> {invoice.seller?.name}</p>
      <p><strong>Kupující:</strong> {invoice.buyer?.name}</p>
      <p><strong>Vystaveno:</strong> {invoice.issued}</p>
      <p><strong>Splatnost:</strong> {invoice.dueDate}</p>
      <p><strong>Produkt:</strong> {invoice.product}</p>
      <p><strong>Cena:</strong> {invoice.price}</p>
      <p><strong>DPH:</strong> {invoice.vat}</p>
      <p><strong>Poznámka:</strong> {invoice.note}</p>

      <Link to={`/invoices/edit/${invoice._id}`} className="btn btn-secondary me-2">
        Upravit
      </Link>
      <Link to="/invoices" className="btn btn-light">
        Zpět na seznam
      </Link>
    </div>
  );
}

export default InvoiceDetail;
