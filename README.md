# light-scraper 📷

An optical character recognition search tool for screenshots from prnt.sc

![screenshot](https://user-images.githubusercontent.com/29873078/73987010-c122a400-4947-11ea-928c-077ef7f8acad.png)

# Installation with NPM

```
$ npm i -g light-scraper
$ light-scraper
```

# Manual Installation

## 1. Install Tesseract

**For Debian/Ubuntu:**

```
$ apt-get install tesseract-ocr
```

**For Windows:**

 Download and install from here [https://github.com/UB-Mannheim/tesseract/wiki](https://github.com/UB-Mannheim/tesseract/wiki)

And make sure to add your installation folder to the Path enviroment variable

**Check if Tesseract is installed correctly**
```
$ tesseract -v
```

## 2. Clone light-scraper

**Clone**

```
$ git clone https://github.com/TasosY2K/light-scraper.git
```

Or

**Download manually and extract**

https://github.com/TasosY2K/light-scraper/archive/master.zip

## 3. Install npm dependencies

```
$ cd light-scraper
$ npm install
```

## 4. Done

You should be able to run light-scraper now

```
$ node bin/app.js
```

# Usage

Using light-scraper is pretty simple
You just enter the keywords you want and the tool automatically searches random screenshots from prnt.sc for them

If you want to use multiple keywords seperate them with commas
 e.g.

```
keyword1, keyword2, keyword3
```

Images containing these keywords are saved at `/photos`

Do not fiddle with the `/temp` directory
