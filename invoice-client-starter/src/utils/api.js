
const API_URL = "http://localhost:8000";

const fetchData = (url, requestOptions) => {
  const apiUrl = `${API_URL}${url}`;

  return fetch(apiUrl, requestOptions)
    .then(async (response) => {
      let json = null;
      try {
        json = await response.json();   // pokus o parsování JSONu
      } catch (e) {
        // Tělo není JSON → nevadí
      }

      if (!response.ok) {
        // Vytvoříme chybu a přidáme data z backendu
        const err = new Error(
          json && typeof json === "object"
            ? "VALIDATION_ERROR"
            : `Network response was not ok: ${response.status} ${response.statusText}`
        );
        err.status = response.status;
        err.data = json;     // <- TADY JSOU POLE A CHYBY OD BACKENDU (např. {product: ["This field is required"]})
        throw err;
      }

      // DELETY nemají JSON tělo, takže ho nevracíme
      if (requestOptions.method !== "DELETE") {
        return json;
      }
    })
    .catch((error) => {
      throw error;
    });
};

export const apiGet = (url, params) => {
    const filteredParams = Object.fromEntries(
        Object.entries(params || {}).filter(([_, value]) => value != null)
    );

    const apiUrl = `${url}?${new URLSearchParams(filteredParams)}`;
    const requestOptions = {
        method: "GET",
    };

    return fetchData(apiUrl, requestOptions);
};

export const apiPost = (url, data) => {
    const requestOptions = {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data),
    };

    return fetchData(url, requestOptions);
};

export const apiPut = (url, data) => {
    const requestOptions = {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data),
    };

    return fetchData(url, requestOptions);
};

export const apiDelete = (url) => {
    const requestOptions = {
        method: "DELETE",
    };

    return fetchData(url, requestOptions);
};
