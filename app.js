const express = require("express");
const puppeteer = require("puppeteer");
const path = require("path");

const port = process.env.PORT || 8080; // Use dynamic port for deployment
const url =
  "https://www.amazon.in/gp/browse.html?node=4092115031&ref_=nav_em_sbc_tvelec_gaming_consoles_0_2_9_12";

const app = express();

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/api/products", async (req, res) => {
  console.log("Received request for products");

  try {
    // Launch Puppeteer with necessary options for Render
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto(url);

    const data = await page.evaluate(() => {
      let items = document.querySelectorAll(
        ".a-section.octopus-pc-card-content .a-list-item"
      );
      let itemsArray = [...items];
      return itemsArray.map((item) => {
        const title =
          item.querySelector(".octopus-pc-asin-title")?.innerText ||
          "No title available";
        const price =
          item.querySelector(".a-price .a-offscreen")?.innerText ||
          "Price not available";
        const imageUrl = item.querySelector("img")?.src || "";
        return { title, price, imageUrl };
      });
    });

    await browser.close();

    res.json(data);
  } catch (error) {
    console.error("Error during scraping:", error);
    res.status(500).json({ error: "Failed to scrape products." });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
