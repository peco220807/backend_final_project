const express = require("express")
const bcrypt = require("bcrypt")
const { getDB } = require("../database/mongo")

const router = express.Router()

router.get("/me", (req, res) => {
  if (!req.session.userId) {
    return res.json({ authenticated: false })
  }
  res.json({ authenticated: true, email: req.session.email })
})

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" })
  }

  const db = getDB()
  const user = await db.collection("users").findOne({ email: String(email).toLowerCase().trim() })

  if (!user) return res.status(401).json({ error: "Invalid credentials" })

  const ok = await bcrypt.compare(String(password), user.passwordHash)
  if (!ok) return res.status(401).json({ error: "Invalid credentials" })

  req.session.userId = String(user._id)
  req.session.email = user.email

  res.json({ message: "Logged in", email: user.email })
})

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid")
    res.json({ message: "Logged out" })
  })
})

module.exports = router