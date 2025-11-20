import React from "react";
import { Link } from "react-router-dom";

const PersonTable = ({ label, items, deletePerson }) => {
  return (
    <div>
      <p>
        {label} {items.length}
      </p>

      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Jméno</th>
            <th>Email</th>
            <th>Telefon</th>
            <th>Akce</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={item._id}>
              {/* Pořadové číslo */}
              <td>{index + 1}</td>

              {/* Jméno */}
              <td>{item.name}</td>

              {/* Email */}
              <td>{item.mail}</td>

              {/* Telefon */}
              <td>{item.telephone}</td>

              {/* Akce */}
              <td>
                <Link
                  to={`/persons/show/${item._id}`}
                  className="btn btn-info btn-sm me-2"
                >
                  Zobrazit
                </Link>

                <Link
                  to={`/persons/edit/${item._id}`}
                  className="btn btn-secondary btn-sm me-2"
                >
                  Upravit
                </Link>

                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => deletePerson(item._id)}
                >
                  Odstranit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Link to="/persons/create" className="btn btn-success mt-3">
        Nová osoba
      </Link>
    </div>
  );
};

export default PersonTable;