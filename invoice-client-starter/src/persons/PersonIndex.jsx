import React, { useEffect, useState } from "react";

import { apiDelete, apiGet } from "../utils/api";

import PersonTable from "./PersonTable";

const PersonIndex = () => {
  const [persons, setPersons] = useState([]);
  const [allPersons, setAllPersons] = useState([]); // kompletní seznam z API
  const [search, setSearch] = useState("");         // text ve vyhledávacím poli

  const deletePerson = async (id) => {
    try {
      await apiDelete("/api/persons/" + id);
    } catch (error) {
      console.log(error.message);
      alert(error.message);
    }
    // smažeme z aktuálního seznamu i z původního
    setPersons((prev) => prev.filter((item) => item._id !== id));
    setAllPersons((prev) => prev.filter((item) => item._id !== id));
  };

  // načtení dat
  useEffect(() => {
    apiGet("/api/persons").then((data) => {
      setPersons(data);
      setAllPersons(data);
    });
  }, []);

  // live filtrování při psaní
  useEffect(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      setPersons(allPersons);
      return;
    }

    const filtered = allPersons.filter((p) => {
      const fields = [
        p.name,
      ];
      return fields.some((f) =>
        (f || "").toString().toLowerCase().includes(term)
      );
    });

    setPersons(filtered);
  }, [search, allPersons]);

  const handleResetFilter = () => {
    setSearch(""); // efekt nad search/allPersons sám vrátí původní seznam
  };

  return (
    <div>
      <h1>Seznam osob</h1>

      {/* Vyhledávání */}
      <div className="d-flex align-items-center mb-3 mt-3">
        <input
          type="text"
          className="form-control me-2"
          placeholder="Vyhledat..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleResetFilter}
          style={{maxHeight: "50px", minWidth: "120px"}}

        >
          Zrušit filtr
        </button>
      </div>

      <PersonTable
        deletePerson={deletePerson}
        items={persons}
        label="Počet osob:"
      />
    </div>
  );
};

export default PersonIndex;