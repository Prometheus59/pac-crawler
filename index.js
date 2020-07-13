const nodeFetch = require("node-fetch");
const fs = require("fs");

const key = "AIzaSyBJFEqcGUuwrai9n0xedh3CTDaFQK53zUw";
const alt_key = "AIzaSyA8xWMzI9lmgl3zc4JxB_kzPopuOa0O5ak";
const pacman_urls = [
  `https://www.googleapis.com/customsearch/v1?key=${key}&cx=009315961641472818372:kyqr5g9u5wc&q=pac-man`,
  `https://www.googleapis.com/customsearch/v1?key=${key}&cx=009315961641472818372:kyqr5g9u5wc&q=pac-man&start=11`,
  `https://www.googleapis.com/customsearch/v1?key=${key}&cx=009315961641472818372:kyqr5g9u5wc&q=pac-man&start=21`,
];

const bn_urls = [
  `https://www.googleapis.com/customsearch/v1?key=${key}&cx=009315961641472818372:kyqr5g9u5wc&q=bandai+namco`,
  `https://www.googleapis.com/customsearch/v1?key=${key}&cx=009315961641472818372:kyqr5g9u5wc&q=bandai+namco&start=11`,
  `https://www.googleapis.com/customsearch/v1?key=${key}&cx=009315961641472818372:kyqr5g9u5wc&q=bandai+namco&start=21`,
];

const videogames_urls = [
  `https://www.googleapis.com/customsearch/v1?key=${key}&cx=009315961641472818372:kyqr5g9u5wc&q=videogames`,
  `https://www.googleapis.com/customsearch/v1?key=${key}&cx=009315961641472818372:kyqr5g9u5wc&q=videogames&start=31`,
  `https://www.googleapis.com/customsearch/v1?key=${key}&cx=009315961641472818372:kyqr5g9u5wc&q=videogames&start=21`,
];

/**
 * Returns True if at least 200 words
 * @param {String} str - string to check
 */
function WordCount200(str) {
  if (str === undefined || str.length == 0) {
    return false;
  } else {
    return str.split(" ").length > 200;
  }
}

/**
 * Filters out undesirable sites
 * @param {string} url - link to be filtered
 */
async function url_valid(url) {
  const invalid_urls = [
    "youtube",
    "apps.apple",
    "play.google",
    "login.bandainamco",
  ];
  var valid = true;
  for (let x = 0; x < invalid_urls.length; x++) {
    if (url.includes(invalid_urls[x])) {
      valid = false;
    }
  }
  return valid;
}

/**
 *
 * @param {string} url - Url to extract links from
 */
async function get_links(url) {
  console.log("searching for links");
  try {
    let links = [];
    let linkcount = 10;

    // Get data
    const response = await nodeFetch(url);
    const json = await response.json();
    // Push data items to list
    for (let x = 0; x < 10; x++) {
      let item = {};
      item.title = json.items[x].title;
      item.link = json.items[x].link;
      // console.log(json.items[x].title);
      // console.log(json.items[x].link);

      //Add valid items to list
      const valid = await url_valid(item.link);
      if (typeof item.title !== undefined && valid) {
        // console.log(`${item.link} pushed \n`);
        links.push(item);
      } else {
        // console.log(`${item.link} not pushed, linkcount reduced \n`);
        linkcount--;
      }
    }
    //console.log(`${linkcount} valid links collected`);

    let dataset = [];
    // Push list items to dataset
    for (let i = 0; i < linkcount; i++) {
      let resp = {};
      resp.title = links[i].title;
      resp.content = await parse_site(links[i].link);
      if (WordCount200(resp.content)) {
        dataset.push(resp);
      }
    }
    return dataset;
  } catch (error) {
    console.log(error);
  }
}

/**
 *  Parse site, return HTML
 * @param {string} url - url to parse
 */
async function parse_site(url) {
  try {
    let body = await nodeFetch(url).then((res) => res.text());
    return body;
  } catch (error) {
    console.log(error);
    return "Error parsing site";
  }
}

async function crawl(url_arr, name) {
  console.log(`Crawling ${name} Google Search Results ...`);
  let dataset = [];
  let max_length = url_arr.length * 10;
  let file_count = 0;
  for (let i = 0; i < url_arr.length; i++) {
    let new_data = await get_links(url_arr[i]);
    dataset = dataset.concat(new_data);
  }

  console.log(`${dataset.length} valid "${name}" sites`);

  for (let x = 0; x < max_length; x++) {
    let name_str = "./Dataset/" + name + "/article" + x;

    if (dataset[x] !== undefined) {
      try {
        fs.writeFile(name_str, dataset[x].content, function (err) {
          if (err) throw err;
          // console.log(`File 'article${x}' saved successfully!`);
        });
        file_count++;
      } catch (err) {
        console.log(err);
      }
    }
  }
  return file_count;
}

/**
 * Driver Function
 */
async function main() {
  // Crawl Sites

  crawl(pacman_urls, "Pacman").then((count) => {
    console.log(`${count} links saved!`);
  });
  crawl(bn_urls, "BandaiNamco").then((count) => {
    console.log(`${count} links saved!`);
  });
  crawl(videogames_urls, "VideoGames").then((count) => {
    console.log(`${count} links saved!`);
  });
}

// Run Code
fs.mkdir("/Dataset/Pacman", { recursive: true }, (err) => {
  if (err) throw err;
});
fs.mkdir("/Dataset/BandaiNamco", { recursive: true }, (err) => {
  if (err) throw err;
});
fs.mkdir("/Dataset/VideoGames", { recursive: true }, (err) => {
  if (err) throw err;
});
main();
