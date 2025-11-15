// PersonDetail.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiGet } from "../utils/api";
import { Link } from "react-router-dom";

import Country from "./Country";

const getCountryLabel = (countryValue) => {
    if (!countryValue) return "";

    // Pokud máš nějaký enum/konstantu v Country, pokryj obě varianty
    if (
        countryValue === Country?.CZECHIA ||
        countryValue === "CZECHIA" ||
        countryValue === "CZ"
    ) {
        return "Česká republika";
    }

    if (
        countryValue === Country?.SLOVAKIA ||
        countryValue === "SLOVAKIA" ||
        countryValue === "SK"
    ) {
        return "Slovensko";
    }

    // fallback – když přijde něco jiného, aspoň něco zobrazíš
    return countryValue;
};

const PersonDetail = () => {
    const { id } = useParams();
    const [person, setPerson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) {
            setError("Chybí ID osoby v URL.");
            setLoading(false);
            return;
        }

        let isMounted = true;
        setLoading(true);
        setError(null);

        apiGet(`/api/persons/${id}`)
            .then((data) => {
                if (!isMounted) return;
                setPerson(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                if (!isMounted) return;
                setError("Nepodařilo se načíst data osoby.");
                setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [id]);

    if (loading) {
        return <p>Načítám detail osoby…</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    if (!person) {
        return <p>Osoba nebyla nalezena.</p>;
    }

    const countryLabel = getCountryLabel(person.country);

    return (
        <div>
            <h1>Detail osoby</h1>
            <hr />
            <h3>
                {person.name || "-"} ({person.identificationNumber || "-"})
            </h3>

            <p>
                <strong>Jméno:</strong>
                <br />
                {person.name || "-"}
            </p>

            <p>
                <strong>IČO:</strong>
                <br />
                {person.identificationNumber || "-"}
            </p>

            <p>
                <strong>DIČ:</strong>
                <br />
                {person.taxNumber || "-"}
            </p>

            <p>
                <strong>Bankovní účet:</strong>
                <br />
                {(person.accountNumber && person.bankCode) ? (
                    <>
                        {person.accountNumber}/{person.bankCode}
                        {person.iban ? ` (${person.iban})` : null}
                    </>
                ) : (
                    "-"
                )}
            </p>

            <p>
                <strong>Tel.:</strong>
                <br />
                {person.telephone || "-"}
            </p>

            <p>
                <strong>Mail:</strong>
                <br />
                {person.mail || "-"}
            </p>

            <p>
                <strong>Sídlo:</strong>
                <br />
                {person.street || "-"}
                {person.city ? `, ${person.city}` : ""}
                {person.zip ? `, ${person.zip}` : ""}
                {countryLabel ? `, ${countryLabel}` : ""}
            </p>

            <p>
                <strong>Poznámka:</strong>
                <br />
                {person.note || "-"}
            </p>

            <p>
                <strong>Stát:</strong>
                <br />
                {countryLabel || "-"}
            </p>
            {/* >>> TLAČÍTKA NAVÍC <<< */}
            <div className="mt-3">
            <Link
            to={`/persons/edit/${person._id}`}
            className="btn btn-secondary me-2"
            >
            Upravit
            </Link>

            <Link
            to="/persons"
            className="btn btn-light"
            >
            Zpět na seznam
            </Link>
      </div>
    </div>
  );
}

export default PersonDetail;