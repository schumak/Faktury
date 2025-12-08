import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function PersonStatistics() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [includeHidden, setIncludeHidden] = useState(false);
  const [sortDesc, setSortDesc] = useState(true); // řazení obratu ↑↓

  const navigate = useNavigate();

  function loadStats(nextIncludeHidden) {
    const flag =
      typeof nextIncludeHidden === "boolean" ? nextIncludeHidden : includeHidden;

    setLoading(true);
    const query = flag ? "?include_hidden=true" : "";

    fetch(`http://localhost:8000/api/persons/statistics${query}`)
      .then((res) => res.json())
      .then((json) => {
        setStats(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    loadStats(false); // první načtení bez smazaných
  }, []);

  // součet revenues
  const totalRevenue = stats.reduce(
    (sum, p) => sum + (p.revenue || 0),
    0
  );

  // procentuální podíl
  function formatPercent(value) {
    if (!totalRevenue) return "0 %";
    return ((value / totalRevenue) * 100).toFixed(1) + " %";
  }

  // řazení podle revenue
  function sortByRevenue() {
    const sorted = [...stats].sort((a, b) =>
      sortDesc ? b.revenue - a.revenue : a.revenue - b.revenue
    );
    setStats(sorted);
    setSortDesc(!sortDesc);
  }

    // řazení podle jména
  function sortByName() {
    const sorted = [...stats].sort((a, b) =>
      sortDesc ? b.personName.localeCompare(a.personName) : a.personName.localeCompare(b.personName)
    );
    setStats(sorted);
    setSortDesc(!sortDesc);
  }

  return (
    <div className="mt-4">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h2 className="h5 mb-0">Statistiky společností</h2>
          <span className="badge bg-light text-primary">
            Celkem osob: {stats.length}
          </span>
        </div>

        <div className="card-body">
          {/* OVládací tlačítka */}
          <div className="mb-3 d-flex flex-wrap gap-2">
            <button className="btn btn-primary" onClick={() => loadStats()}>
              Aktualizovat
            </button>

            <button
              type="button"
              className={"btn " + (includeHidden ? "btn-warning" : "btn-outline-warning")}
              onClick={() => {
                const newValue = !includeHidden;
                setIncludeHidden(newValue);
                loadStats(newValue);
              }}
            >
              {includeHidden
                ? "Skrýt smazané kontakty"
                : "Zobrazit i smazané kontakty"}
            </button>
          </div>

          {loading && <p>Načítám data...</p>}

          {!loading && stats.length === 0 && (
            <div className="alert alert-info mb-0">
              Zatím tu nejsou žádné osoby nebo faktury.
            </div>
          )}

          {!loading && stats.length > 0 && (
            <>
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>ID osoby</th>
                    <th onClick={sortByName} style={{ cursor: "pointer" }}>
                      Název / jméno {sortDesc ? "▼" : "▲"}
                    </th>
                    <th onClick={sortByRevenue} style={{ cursor: "pointer" }}>
                      Obrat (Kč) {sortDesc ? "▼" : "▲"}
                    </th>
                    <th>Podíl na obratu</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map((p) => (
                    <tr
                      key={p.personId}
                      className={p.revenue > 0 ? "table-success" : "table-light text-muted"}
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate(`/persons/show/${p.personId}?from=stats`)}
                    >
                      <td>{p.personId}</td>
                      <td>{p.personName}</td>
                      <td className="fw-semibold">{p.revenue ? `${p.revenue} Kč` : "0 Kč"}</td>
                      <td style={{ width: "200px" }}>
                        <div className="d-flex align-items-center gap-2">
                          <div className="progress flex-grow-1" style={{ height: "8px" }}>
                            <div
                              className="progress-bar"
                              role="progressbar"
                              style={{
                                width:
                                  totalRevenue > 0
                                    ? `${(p.revenue / totalRevenue) * 100}%`
                                    : "0%",
                              }}
                            ></div>
                          </div>
                          <small className="text-muted">{formatPercent(p.revenue || 0)}</small>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-3 alert alert-secondary d-flex justify-content-between align-items-center">
                <div>
                  <strong>Celkový obrat (všechny firmy):</strong> {totalRevenue} Kč
                </div>
                <span className="badge bg-secondary">
                  {includeHidden ? "⚠ Smazané kontakty ZAPNUTY" : "Jen aktivní kontakty"}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default PersonStatistics;