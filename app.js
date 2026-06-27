const STORAGE_KEY = "minecraft-places";
const form = document.getElementById("place-form");
const placeList = document.getElementById("place-list");
const emptyState = document.getElementById("empty-state");
const clearAllButton = document.getElementById("clear-all");

let places = loadPlaces();

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const place = {
    id: crypto.randomUUID(),
    name: document.getElementById("name").value.trim(),
    coordinates: document.getElementById("coordinates").value.trim(),
    notes: document.getElementById("notes").value.trim(),
    type: document.getElementById("type").value,
  };

  if (!place.name || !place.coordinates) {
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
});

placeList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-id]");
  if (!button) return;

  const id = button.dataset.id;
  places = places.filter((place) => place.id !== id);
  savePlaces();
  renderPlaces();
});

renderPlaces();

function loadPlaces() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
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
          <p class="place-meta">Coordinates: ${escapeHtml(place.coordinates)}</p>
          <p class="place-notes">${escapeHtml(place.notes || "No notes added.")}</p>
          <button class="delete-btn" data-id="${place.id}" type="button">Delete</button>
        </li>
      `
    )
    .join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
