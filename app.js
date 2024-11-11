const express = require("express");
const puppeteer = require("puppeteer");
const path = require("path");

const port = 10000;
const url =
  "https://www.amazon.in/gp/browse.html?node=4092115031&ref_=nav_em_sbc_tvelec_gaming_consoles_0_2_9_12";

const app = express();

// files from the "public"
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/api/products", async (req, res) => {
  console.log("Got the request");
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  const data = await page.evaluate(() => {
    let items = document.querySelectorAll(
      ".a-section.octopus-pc-card-content .a-list-item"
    );
    let itemsArray = [...items];
    return itemsArray.map((item) => {
      const title = item.querySelector(".octopus-pc-asin-title").innerText;
      const price = item.querySelector(".a-price .a-offscreen").innerText;
      const imageUrl = item.querySelector("img").src;
      return { title, price, imageUrl };
    });
  });

  await browser.close();

  res.json(data);
});

app.listen(port, () => {
  console.log(`Server starting at port ${port}`);
});
