export const getGeolocation = async (city) => {
  const query = encodeURIComponent(city.trim());
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=1&language=en&format=json`;
  const result = await fetch(url);
  if (!result.ok) {
    throw new Error(`Geocoding request failed (HTTP ${result.status})`);
  }
  const data = await result.json();
  if (!data.results || data.results.length === 0) {
    throw new Error(`Location "${city}" not found. Please try another city.`);
  }
  const place = data.results[0];
  const displayName = [place.name, place.admin1, place.country].filter(Boolean).join(", ");
  return {
    name: displayName || place.name,
    lat: place.latitude,
    lon: place.longitude,
  };
};
