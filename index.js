const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");

(async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });
  const page = await browser.newPage();
  await page.goto(
    "https://in.indeed.com/jobs?q=software+developer+fresher&l=NCR%2C+Delhi&from=searchOnDesktopSerp&vjk=c611adddc7411b25",
    {
      waitUntil: "load",
    }
  );

  let items = [];
  // let isBtnDisabled = false;

  //   while (!isBtnDisabled) {
  //   await page.waitForSelector('[data-cel-widget="search_result_0"]', {
  //     timeout: 10000,
  //   });

  const productHandles = await page.$$("#mosaic-provider-jobcards > ul > li");
  //   console.log(productHandles);
  await page.waitForSelector("#mosaic-provider-jobcards > ul > li");

  for (const productHandle of productHandles) {
    let title = "NULL";
    let company = "NULL";
    let location = "NULL";

    try {
      title = await page.evaluate(
        (el) =>
          el.querySelector(
            " div > div > div > div > div > table > tbody > tr > td.resultContent.css-1qwrrf0.eu4oa1w0 > div.css-dekpa.e37uo190 > h2 > a > span"
          )?.textContent || "NULL",
        productHandle
      );
    } catch (error) {
      console.error("Error getting title:", error);
    }
    // }

    try {
      company = await page.evaluate(
        (el) =>
          el.querySelector(
            "div > div > div > div > div > table > tbody > tr > td.resultContent.css-1qwrrf0.eu4oa1w0 > div.company_location.css-17fky0v.e37uo190 > div > div.css-1qv0295.e37uo190 > span"
          )?.textContent || "NULL",
        productHandle
      );
    } catch (error) {
      console.error("Error getting price:", error);
    }

    try {
      location = await page.evaluate(
        (el) =>
          el.querySelector(
            " div > div > div > div > div > table > tbody > tr > td.resultContent.css-1qwrrf0.eu4oa1w0 > div.company_location.css-17fky0v.e37uo190 > div > div.css-1p0sjhy.eu4oa1w0"
          )?.textContent || "NULL",
        productHandle
      );
    } catch (error) {
      console.error("Error getting image:", error);
    }

    if (title !== "NULL") {
      items.push({ title, company, location });
      // console.log(title, company, location);
    }
  }

  const workbook = xlsx.utils.book_new();
  const worksheet = xlsx.utils.json_to_sheet(items);

  // Add the worksheet to the workbook
  xlsx.utils.book_append_sheet(workbook, worksheet, "Jobs");

  // Write the workbook to a file
  xlsx.writeFile(workbook, path.join(__dirname, "jobs.xlsx"));

  // try {
  //   await page.waitForSelector(".css-akkh0a .e8ju0x50", {
  //     visible: true,
  //     timeout: 5000,
  //   });
  //   const is_disabled = (await page.$(".css-akkh0a .e8ju0x50")) !== null;
  //   isBtnDisabled = is_disabled;

  //   if (!isBtnDisabled) {
  //     await Promise.all([
  //       page.click(".s-pagination-next"),
  //       page.waitForNavigation({ waitUntil: "networkidle2" }),
  //     ]);
  //   }
  // } catch (error) {
  //   console.error("Error with pagination:", error);
  //   isBtnDisabled = true;
  // }
  //   }

  // console.log(items);
  //   console.log(items.length);

  fs.writeFileSync(
    path.join(__dirname, "job.json"),
    JSON.stringify(items, null, 2),
    "utf8"
  );
  await browser.close();
})();
