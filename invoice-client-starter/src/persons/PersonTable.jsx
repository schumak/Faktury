import React from "react";
import {Link} from "react-router-dom";

const PersonTable = ({label, items, deletePerson}) => {
    return (
        <div>
            <p>
                {label} {items.length}
            </p>

            <table
                className="table table-striped"
>
                <thead>
                <tr>
                    <th>#</th>
                    <th>Jméno</th>
                    <th colSpan={3}>Akce</th>
                </tr>
                </thead>
                <tbody>
                {items.map((item, index) => (
                    <tr key={index + 1}>
                        <td>{index + 1}</td>
                        <td>{item.name}</td>
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
                                onClick={() => deletePerson(item._id)}
                                className="btn btn-danger btn-sm"
                            >
                                Odstranit
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            <Link to={"/persons/create"} className="btn btn-success">
                Nová osoba
            </Link>
        </div>
    );
};

export default PersonTable;
