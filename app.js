require("dotenv").config()
const express = require("express")
const path = require("path")
const fs = require("fs")
const session = require("express-session")
const bcrypt = require("bcrypt")

const { connectDB, client, getDB } = require("./database/mongo")
const productsRouter = require("./routes/products")
const authRouter = require("./routes/auth")


const app = express()
const PORT = process.env.PORT || 3000

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static(path.join(__dirname, "public")))

app.use(
  session({
    name: "dezire.sid",
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    },
  })
)

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`)
  next()
})

app.post("/login", (req, res) => {
  req.session.user = { role: "admin" }
  res.json({ message: "Logged in" })
})

app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("dezire.sid")
    res.json({ message: "Logged out" })
  })
})

app.use("/api/auth", authRouter)
app.use("/api/products", productsRouter)

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"))
})

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "about.html"))
})

app.get("/contact", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "contact.html"))
})

app.post("/contact", (req, res) => {
  const { name, message, email } = req.body || {}

  if (!name || !message) {
    return res.status(400).send("Missing required fields")
  }

  const payload = {
    name,
    email: email || null,
    message,
    date: new Date(),
  }

  let messages = []
  try {
    if (fs.existsSync("contacts.json")) {
      messages = JSON.parse(fs.readFileSync("contacts.json", "utf-8"))
    }
  } catch {
    messages = []
  }

  messages.push(payload)
  fs.writeFileSync("contacts.json", JSON.stringify(messages, null, 2))

  res.send(`<h2>Thanks, ${name}! Your message has been received.</h2>`)
})

app.use((req, res) => {
  res.status(404).send("<h1>404 Page Not Found</h1>")
})

async function ensureAdminUser() {
  const email = (process.env.ADMIN_EMAIL || "").toLowerCase().trim()
  const password = process.env.ADMIN_PASSWORD || ""
  if (!email || !password) return

  const db = getDB()
  const users = db.collection("users")

  const exists = await users.findOne({ email })
  if (exists) return

  const passwordHash = await bcrypt.hash(password, 10)
  await users.insertOne({ email, passwordHash, createdAt: new Date() })
}

;(async () => {
  await connectDB()
  await ensureAdminUser()

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })

  process.on("SIGINT", async () => {
    await client.close()
    process.exit(0)
  })
})()