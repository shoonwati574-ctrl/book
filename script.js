const form = document.querySelector("#search-form");
const input = document.querySelector("#query");
const grid = document.querySelector("#books-grid");
const title = document.querySelector("#results-title");
const count = document.querySelector("#result-count");

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function showStatus(message, isError = false) {
  grid.innerHTML = `<p class="status${isError ? " error" : ""}">${escapeHtml(message)}</p>`;
  count.textContent = "";
}

function renderBooks(books) {
  if (!books.length) {
    showStatus("No books found. Try another title or author.");
    return;
  }
  count.textContent = `${books.length} books`;
  grid.innerHTML = books.map((book) => {
    const titleText = escapeHtml(book.title || "Untitled");
    const authors = escapeHtml((book.author_name || []).slice(0, 2).join(", ") || "Author unknown");
    const year = escapeHtml(book.first_publish_year || "Publication year unavailable");
    const key = String(book.key || "").replace(/[^a-zA-Z0-9/_-]/g, "");
    const cover = book.cover_i
      ? `<img class="cover" src="https://covers.openlibrary.org/b/id/${Number(book.cover_i)}-M.jpg" alt="Cover of ${titleText}" loading="lazy">`
      : `<div class="cover cover-placeholder" aria-label="No cover available">G</div>`;
    return `<article class="book-card">${cover}<div class="book-info"><h3>${titleText}</h3><p class="author">${authors}</p><p class="year">${year}</p>${key ? `<a href="https://openlibrary.org${key}" target="_blank" rel="noreferrer">View book ↗</a>` : ""}</div></article>`;
  }).join("");
}

async function searchBooks(term) {
  const query = term.trim();
  if (!query) return;
  input.value = query;
  title.textContent = `Results for “${query}”`;
  showStatus("Looking through the shelves…");
  try {
    const url = new URL("https://openlibrary.org/search.json");
    url.searchParams.set("q", query);
    url.searchParams.set("limit", "12");
    url.searchParams.set("fields", "key,title,author_name,first_publish_year,cover_i");
    const response = await fetch(url);
    if (!response.ok) throw new Error("Search is temporarily unavailable.");
    const data = await response.json();
    renderBooks(data.docs || []);
    document.querySelector("#results-section").scrollIntoView({ behavior: "smooth", block: "start" });
  } catch {
    showStatus("Couldn’t load books right now. Check your connection and try again.", true);
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  searchBooks(input.value);
});

document.querySelectorAll("[data-search]").forEach((button) => {
  button.addEventListener("click", () => searchBooks(button.dataset.search));
});
