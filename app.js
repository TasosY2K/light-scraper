const fs = require("fs");
const exec = require("child_process").exec;
const readline = require("readline");
const rp = require("request-promise");
const http = require("http");
const cheerio = require("cheerio");
const chalk = require("chalk");
const figlet = require("figlet");
const clear = require("clear");
const download = require("image-downloader");
const tesseract = require("node-tesseract-ocr");
const rimraf = require("rimraf");
const unique = require("array-unique");
const moment = require("moment");
const ON_DEATH = require("death")({uncaughtException: true});

ON_DEATH((signal, err) => {
  let minutes = Math.floor(process.uptime() / 60);
  console.log("\nHits: " + hitcount + "\nRuntime: " + minutes + " minutes\n" + keywordlist + "\n");
  rimraf(__dirname + "/temp/*", async () => {
    await process.exit();
  });
})

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
  console.log(chalk.blue("[*] ") + moment().format("YYYY-MM-DD HH:mm:ss -") + " Selected random URL: " + url);
  let rpOptions = {
    url: url,
    headers: {
      "User-Agent": "Request-Promise"
    },
    json: true
  }

  rp(rpOptions).then(async data => {
    let $ = cheerio.load(data);
    let src_url = $(".screenshot-image").attr("src");
    if (src_url.startsWith("//st")) {
      src_url = "https:" + src_url;
    }
    console.log(chalk.blue("[*] ") + moment().format("YYYY-MM-DD HH:mm:ss - ") + id + " - Found source URL: " + src_url);
    let downloadOptions = {
      url: src_url,
      dest: __dirname + "/temp/" + id + ".jpg"
    }

    await download.image(downloadOptions).then(async () => {
      console.log(chalk.blue("[*] ") + moment().format("YYYY-MM-DD HH:mm:ss - ") + id + " - Temporarily saved image at " + downloadOptions.dest);
      await tesseract.recognize(downloadOptions.dest, {
        lang: "eng",
        oem: 1,
        psm: 3
      }).then(async text => {
        let imgString = text.trim();
        await keywords.forEach((item, i) => {
          if (imgString.includes(keywords[i])) {
            console.log(chalk.green("[+] ") + moment().format("YYYY-MM-DD HH:mm:ss - ") + id + " - Successfully found keyword: " + item);
            hitcount++;
            fs.copyFileSync(downloadOptions.dest, __dirname + "/photos/" + id + ".jpg");
            console.log(chalk.blue("[*] ") + moment().format("YYYY-MM-DD HH:mm:ss - ") + id + " - Image copied at " + __dirname + "/photos/" + id + ".jpg");
          }
        });
      }).catch((err) => console.log(chalk.red("[-] ") + moment().format("YYYY-MM-DD HH:mm:ss - ") + err));
    }).catch((err) => getImage());
    fs.unlinkSync(downloadOptions.dest);
    console.log(chalk.blue("[*] ") + moment().format("YYYY-MM-DD HH:mm:ss - ") + id + " - Deleted file from " + downloadOptions.dest);
  }).catch((err) => getImage());
}

if (!fs.existsSync(__dirname + "/photos")) fs.mkdirSync(__dirname + "/photos");
if (!fs.existsSync(__dirname + "/temp")) fs.mkdirSync(__dirname + "/temp");
rimraf(__dirname + "/temp/*", () => {});

let hitcount = 0;
let keywordlist = "";

let prompt = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

clear();

exec("tesseract -v", (err, stdout, stderr) => {
  if (!err) {
    console.log(chalk.green("[+] ") + moment().format("YYYY-MM-DD HH:mm:ss -") + " Tesseract is installed");
    http.get("http://example.com/category", async () => {
      console.log(chalk.green("[+] ") + moment().format("YYYY-MM-DD HH:mm:ss -") + " https://prnt.sc is reachable");
      await figlet("Light-Scraper", (err, data) => {
        console.log(data);
        console.log("\nVersion 1.0.1");
        console.log("Coded by leandev");
        console.log("https://discord.gg/chBXtHs");
        console.log("https://github.com/TasosY2K/light-scraper\n");

        prompt.question("Please enter search keywords (seperate with commas): ", (input) => {
          let answer = "Selected keywords";
          input = input.trim();
          let keywords = unique(input.split(",")).filter((entry) => {
            return /\S/.test(entry)
          });
          keywords.forEach((item, i) => {
            answer = answer + " - " + item.trim()
          });

          keywordlist = answer;

          console.log(answer + "\n");
          prompt.close();
          setInterval(async () => {
            await getImage(keywords)
          }, 5000);
        });
      });
    }).on("error", async () => {
      console.log(chalk.red("[-] ") + moment().format("YYYY-MM-DD HH:mm:ss -") + " Can't reach https://prnt.sc");
      await process.exit();
    });
  } else {
    console.log(chalk.red("[-] ") + moment().format("YYYY-MM-DD HH:mm:ss -") + " Tesseract is not installed");
    process.exit();
  }
});
