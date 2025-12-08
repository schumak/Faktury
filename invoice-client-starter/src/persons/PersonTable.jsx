import React from "react";
import { Link } from "react-router-dom";

const PersonTable = ({ label, items, deletePerson }) => {
  return (
    <div>

      <p className="mb-1 text-muted">
        {label} {items.length}
      </p>

      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Jméno</th>
            <th>IČO</th>
            <th>Email</th>
            <th>Telefon</th>
            <th className="text-end">Akce</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item, index) => (
            <tr key={item._id}>
              <td>{index + 1}</td>
              <td>{item.name}</td>
              <td>{item.identificationNumber}</td>
              <td>{item.mail}</td>
              <td>{item.telephone}</td>

              <td className="text-end">
                <Link
                  to={`/persons/show/${item._id}`}
                  className="btn btn-outline-primary btn-sm me-1"
                  title="Zobrazit"
                >
                  <i className="fa fa-eye"></i>
                </Link>

                <Link
                  to={`/persons/edit/${item._id}`}
                  className="btn btn-outline-secondary btn-sm me-1"
                  title="Upravit"
                >
                  <i className="fa fa-edit"></i>
                </Link>

                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => deletePerson(item._id)}
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

export default PersonTable;