require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");
const { connectDB, client } = require("./database/mongo");

const productsRouter = require("./routes/products");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// API
app.use("/api/products", productsRouter);

// Pages
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "about.html"));
});

app.get("/contact", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "contact.html"));
});

// Contact сохраняем как было
app.post("/contact", (req, res) => {
  const { name, message, email } = req.body || {};

  if (!name || !message) {
    return res.status(400).send("Missing required fields");
  }

  const payload = {
    name,
    email: email || null,
    message,
    date: new Date(),
  };

  let messages = [];
  try {
    if (fs.existsSync("contacts.json")) {
      messages = JSON.parse(fs.readFileSync("contacts.json", "utf-8"));
    }
  } catch {
    messages = [];
  }

  messages.push(payload);
  fs.writeFileSync("contacts.json", JSON.stringify(messages, null, 2));

  res.send(`<h2>Thanks, ${name}! Your message has been received.</h2>`);
});

app.use((req, res) => {
  res.status(404).send("<h1>404 Page Not Found</h1>");
});

(async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  process.on("SIGINT", async () => {
    await client.close();
    process.exit(0);
  });
})();