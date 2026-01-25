const productsEl = document.getElementById("products");
const form = document.getElementById("productForm");

const productIdEl = document.getElementById("productId");
const nameEl = document.getElementById("name");
const priceEl = document.getElementById("price");
const categoryEl = document.getElementById("category");
const imageEl = document.getElementById("image");
const descriptionEl = document.getElementById("description");

const formTitleEl = document.getElementById("formTitle");
const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const statusEl = document.getElementById("status");

function setStatus(text, isError = false) {
  statusEl.textContent = text;
  statusEl.style.color = isError ? "crimson" : "inherit";
}

function resetFormToCreate() {
  productIdEl.value = "";
  formTitleEl.textContent = "Create product";
  submitBtn.textContent = "Create";
  cancelEditBtn.style.display = "none";
  form.reset();
}

async function loadProducts() {
  try {
    const res = await fetch("/api/products");
    const items = await res.json();

    productsEl.innerHTML = items
      .map(
        (p) => `
        <div class="product" data-id="${p._id}">
          <img src="${p.image || ""}" alt="${p.name || ""}" />
          <h3>${p.name || ""}</h3>
          <p>${p.price ?? ""} ₸</p>
          <p>${p.description || ""}</p>

          <div class="actions">
            <button type="button" class="editBtn">Update</button>
            <button type="button" class="deleteBtn">Delete</button>
          </div>
        </div>
      `
      )
      .join("");
  } catch (e) {
    setStatus("Failed to load products", true);
  }
}

productsEl.addEventListener("click", async (e) => {
  const card = e.target.closest(".product");
  if (!card) return;

  const id = card.getAttribute("data-id");

  // DELETE
  if (e.target.classList.contains("deleteBtn")) {
    if (!confirm("Delete this product?")) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Delete failed");
      }
      setStatus("Deleted");
      await loadProducts();
      resetFormToCreate();
    } catch (err) {
      setStatus(err.message, true);
    }
  }

  // UPDATE (prepare form)
  if (e.target.classList.contains("editBtn")) {
    try {
      const res = await fetch(`/api/products/${id}`);
      const item = await res.json();
      if (!res.ok) throw new Error(item.error || "Load failed");

      productIdEl.value = item._id;
      nameEl.value = item.name || "";
      priceEl.value = item.price ?? "";
      categoryEl.value = item.category || "";
      imageEl.value = item.image || "";
      descriptionEl.value = item.description || "";

      formTitleEl.textContent = "Update product";
      submitBtn.textContent = "Save";
      cancelEditBtn.style.display = "inline-block";
      setStatus("Editing mode");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setStatus(err.message, true);
    }
  }
});

cancelEditBtn.addEventListener("click", () => {
  resetFormToCreate();
  setStatus("Edit canceled");
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    name: nameEl.value.trim(),
    price: Number(priceEl.value),
    category: categoryEl.value,
    image: imageEl.value.trim(),
    description: descriptionEl.value.trim(),
  };

  const id = productIdEl.value;

  try {
    // UPDATE
    if (id) {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Update failed");

      setStatus("Updated");
      await loadProducts();
      resetFormToCreate();
      return;
    }

    // CREATE
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Create failed");

    setStatus("Created");
    await loadProducts();
    resetFormToCreate();
  } catch (err) {
    setStatus(err.message, true);
  }
});

resetFormToCreate();
loadProducts();