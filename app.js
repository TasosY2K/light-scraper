const fs = require("fs");
const readline = require("readline");
const rp = require("request-promise");
const cheerio = require("cheerio");
const chalk = require("chalk");
const figlet = require("figlet");
const clear = require("clear");
const download = require("image-downloader");
const tesseract = require("node-tesseract-ocr");

function generateID() {
  let result = "";
  let characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

function getImage(keywords) {
  let id = generateID();
  let url = "https://prnt.sc/" + id;
  console.log(chalk.blue("[*]") + " URL selected: " + url);
  let rpOptions = {
    url: url,
    headers: {
      "User-Agent": "Request-Promise"
    },
    json: true
  }

  rp(rpOptions).then(async (data) => {
    let $ = cheerio.load(data);
    let src_url = $(".screenshot-image").attr("src");
    if (src_url.startsWith("//st")) {
      src_url = "https:" + src_url;
    }
    console.log(chalk.blue("[*]") + " Found source URL for id: " + id + " => " + src_url);
    let downloadOptions = {
      url: src_url,
      dest: __dirname + "/temp/" + id + ".jpg"
    }

    await download.image(downloadOptions).then(async () => {
      console.log(chalk.blue("[*]") + " Temporarily saved at " + downloadOptions.dest);
      await tesseract.recognize(downloadOptions.dest, {
        lang: "eng",
        oem: 1,
        psm: 3
      }).then(text => {
        let imgString = text.trim();
        keywords.forEach((item, i) => {
          if (imgString.includes(keywords[i])) {
            console.log(chalk.green("[+]") + " Successfully found keyword: " + item);
            fs.copyFileSync(downloadOptions.dest, __dirname + "/photos/" + id + ".jpg");
            console.log(chalk.blue("[*]") + " Image copied at " + __dirname + "/photos/" + id + ".jpg");
          }
        });
      }).catch((err) => console.log(chalk.red("[-] ") + err));
    }).catch((err) => getImage());
    fs.unlinkSync(downloadOptions.dest);
    console.log(chalk.blue("[*]") + " Deleted file from " + downloadOptions.dest);
  }).catch((err) => getImage());
}

if (!fs.existsSync(__dirname + "/photos")) fs.mkdirSync(__dirname + "/photos");
if (!fs.existsSync(__dirname + "/temp")) fs.mkdirSync(__dirname + "/temp");

let prompt = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

clear();

figlet('Light-Scraper', (err, data) => {
  console.log(data);
  console.log("\nVersion 1.0.0");
  console.log("Coded by leandev\n");
  prompt.question("Please enter search keywords(seperate with commas): ", (input) => {
    input = input.trim();
    let keywords = input.split(",");
    let answer = "Selected keywords";
    keywords.forEach((item, i) => {
      answer = answer + " | " + item.trim()
    });
    console.log(answer);
    prompt.close();
    setInterval(() => {getImage(keywords)}, 5000);
  });
});
