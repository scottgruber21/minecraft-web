const STORAGE_KEY = "minecraft-places";
const form = document.getElementById("place-form");
const placeList = document.getElementById("place-list");
const emptyState = document.getElementById("empty-state");
const clearAllButton = document.getElementById("clear-all");
const searchButton = document.getElementById("search-btn");
const searchResults = document.getElementById("search-results");

let places = loadPlaces();

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const place = {
    id: crypto.randomUUID(),
    name: document.getElementById("name").value.trim(),
    x: parseFloat(document.getElementById("x").value),
    y: parseFloat(document.getElementById("y").value),
    z: parseFloat(document.getElementById("z").value),
    notes: document.getElementById("notes").value.trim(),
    type: document.getElementById("type").value,
  };

  if (!place.name || Number.isNaN(place.x) || Number.isNaN(place.y) || Number.isNaN(place.z)) {
    return;
  }

  places = [place, ...places];
  savePlaces();
  renderPlaces();
  form.reset();
});

clearAllButton.addEventListener("click", () => {
  if (!places.length) return;

  const confirmed = window.confirm("Clear all saved places?");
  if (!confirmed) return;

  places = [];
  savePlaces();
  renderPlaces();
  searchResults.innerHTML = "";
});

placeList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-id]");
  if (!button) return;

  const id = button.dataset.id;
  places = places.filter((place) => place.id !== id);
  savePlaces();
  renderPlaces();
});

searchButton.addEventListener("click", () => {
  const currentX = parseFloat(document.getElementById("search-x").value);
  const currentY = parseFloat(document.getElementById("search-y").value);
  const currentZ = parseFloat(document.getElementById("search-z").value);

  if (Number.isNaN(currentX) || Number.isNaN(currentY) || Number.isNaN(currentZ)) {
    searchResults.innerHTML = '<p class="empty-state">Enter your current X, Y, and Z coordinates to search.</p>';
    return;
  }

  const rankedPlaces = places
    .map((place) => ({
      ...place,
      deltaX: Math.abs(currentX - place.x),
      deltaY: Math.abs(currentY - place.y),
      deltaZ: Math.abs(currentZ - place.z),
      distance: Math.hypot(currentX - place.x, currentY - place.y, currentZ - place.z),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 10);

  if (!rankedPlaces.length) {
    searchResults.innerHTML = '<p class="empty-state">No saved places yet.</p>';
    return;
  }

  searchResults.innerHTML = `
    <ul>
      ${rankedPlaces
        .map(
          (place) => `
            <li>
              <strong>${escapeHtml(place.name)}</strong>
              <div>Distance: ${place.distance.toFixed(1)} blocks</div>
              <div>ΔX: ${place.deltaX.toFixed(0)} · ΔY: ${place.deltaY.toFixed(0)} · ΔZ: ${place.deltaZ.toFixed(0)}</div>
            </li>
          `
        )
        .join("")}
    </ul>
  `;
});

renderPlaces();

function loadPlaces() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return parsed.map(normalizePlace);
  } catch (error) {
    console.error("Unable to load places", error);
    return [];
  }
}

function savePlaces() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(places));
}

function renderPlaces() {
  if (!places.length) {
    emptyState.hidden = false;
    placeList.innerHTML = "";
    return;
  }

  emptyState.hidden = true;
  placeList.innerHTML = places
    .map(
      (place) => `
        <li class="place-item">
          <header>
            <span class="place-title">${escapeHtml(place.name)}</span>
            <span class="type-badge">${escapeHtml(place.type)}</span>
          </header>
          <p class="place-meta">Coordinates: X ${escapeHtml(formatCoordinate(place.x))}, Y ${escapeHtml(formatCoordinate(place.y))}, Z ${escapeHtml(formatCoordinate(place.z))}</p>
          <p class="place-notes">${escapeHtml(place.notes || "No notes added.")}</p>
          <button class="delete-btn" data-id="${place.id}" type="button">Delete</button>
        </li>
      `
    )
    .join("");
}

function normalizePlace(place) {
  if (typeof place.x === "number" && typeof place.y === "number" && typeof place.z === "number") {
    return place;
  }

  const coordinates = String(place.coordinates || "0, 0, 0");
  const parsed = coordinates.split(",").map((value) => Number.parseFloat(value.trim()));
  const [x = 0, y = 0, z = 0] = parsed;

  return {
    ...place,
    x,
    y,
    z,
  };
}

function formatCoordinate(value) {
  return Number.isFinite(value) ? value.toFixed(0) : "0";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
