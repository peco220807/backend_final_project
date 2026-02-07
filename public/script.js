const productsEl = document.getElementById("products")
const form = document.getElementById("productForm")

const productIdEl = document.getElementById("productId")
const nameEl = document.getElementById("name")
const priceEl = document.getElementById("price")
const categoryEl = document.getElementById("category")
const imageEl = document.getElementById("image")
const descriptionEl = document.getElementById("description")

const formTitleEl = document.getElementById("formTitle")
const submitBtn = document.getElementById("submitBtn")
const cancelEditBtn = document.getElementById("cancelEditBtn")
const statusEl = document.getElementById("status")

const authStatus = document.getElementById("authStatus")
const openLoginBtn = document.getElementById("openLoginBtn")
const logoutBtn = document.getElementById("logoutBtn")
const loginBox = document.getElementById("loginBox")
const closeLoginBtn = document.getElementById("closeLoginBtn")
const loginForm = document.getElementById("loginForm")
const loginEmail = document.getElementById("loginEmail")
const loginPassword = document.getElementById("loginPassword")
const loginMsg = document.getElementById("loginMsg")

let isAuthed = false

function setStatus(text, isError = false) {
  statusEl.textContent = text
  statusEl.style.color = isError ? "crimson" : "inherit"
}

function setLoginMsg(text, isError = false) {
  loginMsg.textContent = text
  loginMsg.style.color = isError ? "crimson" : "inherit"
}

function resetFormToCreate() {
  productIdEl.value = ""
  formTitleEl.textContent = "Create product"
  submitBtn.textContent = "Create"
  cancelEditBtn.style.display = "none"
  form.reset()
}

function setAuthUI() {
  authStatus.textContent = isAuthed ? "ADMIN: ON" : "ADMIN: OFF"
  openLoginBtn.style.display = isAuthed ? "none" : "inline-block"
  logoutBtn.style.display = isAuthed ? "inline-block" : "none"

  submitBtn.disabled = !isAuthed
  nameEl.disabled = !isAuthed
  priceEl.disabled = !isAuthed
  categoryEl.disabled = !isAuthed
  imageEl.disabled = !isAuthed
  descriptionEl.disabled = !isAuthed
  cancelEditBtn.disabled = !isAuthed

  if (!isAuthed) resetFormToCreate()
}

async function checkAuth() {
  const res = await fetch("/api/auth/me")
  const data = await res.json()
  isAuthed = !!data.authenticated
  setAuthUI()
}

async function loadProducts() {
  try {
    const res = await fetch("/api/products")
    const items = await res.json()

    productsEl.innerHTML = items
      .map(
        (p) => `
        <div class="product" data-id="${p._id}">
          <img src="${p.image || ""}" alt="${p.name || ""}" />
          <h3>${p.name || ""}</h3>
          <p>${p.price ?? ""} ₸</p>
          <p>${p.description || ""}</p>

          ${
            isAuthed
              ? `<div class="actions">
                  <button type="button" class="editBtn">Update</button>
                  <button type="button" class="deleteBtn">Delete</button>
                </div>`
              : ""
          }
        </div>
      `
      )
      .join("")
  } catch (e) {
    setStatus("Failed to load products", true)
  }
}

productsEl.addEventListener("click", async (e) => {
  if (!isAuthed) return

  const card = e.target.closest(".product")
  if (!card) return

  const id = card.getAttribute("data-id")

  if (e.target.classList.contains("deleteBtn")) {
    if (!confirm("Delete this product?")) return

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Delete failed")

      setStatus("Deleted")
      await loadProducts()
      resetFormToCreate()
    } catch (err) {
      setStatus(err.message, true)
    }
  }

  if (e.target.classList.contains("editBtn")) {
    try {
      const res = await fetch(`/api/products/${id}`)
      const item = await res.json()
      if (!res.ok) throw new Error(item.error || "Load failed")

      productIdEl.value = item._id
      nameEl.value = item.name || ""
      priceEl.value = item.price ?? ""
      categoryEl.value = item.category || ""
      imageEl.value = item.image || ""
      descriptionEl.value = item.description || ""

      formTitleEl.textContent = "Update product"
      submitBtn.textContent = "Save"
      cancelEditBtn.style.display = "inline-block"
      setStatus("Editing mode")
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (err) {
      setStatus(err.message, true)
    }
  }
})

cancelEditBtn.addEventListener("click", () => {
  resetFormToCreate()
  setStatus("Edit canceled")
})

form.addEventListener("submit", async (e) => {
  e.preventDefault()
  if (!isAuthed) {
    setStatus("Login required", true)
    return
  }

  const payload = {
    name: nameEl.value.trim(),
    price: Number(priceEl.value),
    category: categoryEl.value,
    image: imageEl.value.trim(),
    description: descriptionEl.value.trim(),
  }

  const id = productIdEl.value

  try {
    if (id) {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Update failed")

      setStatus("Updated")
      await loadProducts()
      resetFormToCreate()
      return
    }

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || "Create failed")

    setStatus("Created")
    await loadProducts()
    resetFormToCreate()
  } catch (err) {
    setStatus(err.message, true)
  }
})

openLoginBtn.addEventListener("click", () => {
  loginBox.style.display = "block"
  setLoginMsg("")
})

closeLoginBtn.addEventListener("click", () => {
  loginBox.style.display = "none"
  setLoginMsg("")
  loginForm.reset()
})

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault()
  setLoginMsg("")

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: loginEmail.value.trim(),
        password: loginPassword.value,
      }),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || "Login failed")

    isAuthed = true
    loginBox.style.display = "none"
    loginForm.reset()
    setAuthUI()
    await loadProducts()
    setStatus("Logged in")
  } catch (err) {
    setLoginMsg(err.message, true)
  }
})

logoutBtn.addEventListener("click", async () => {
  await fetch("/api/auth/logout", { method: "POST" })
  isAuthed = false
  setAuthUI()
  await loadProducts()
  setStatus("Logged out")
})

resetFormToCreate()
;(async () => {
  await checkAuth()
  await loadProducts()
})()