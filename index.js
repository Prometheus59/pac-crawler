const nodeFetch = require("node-fetch");
const fs = require("fs");

// Page 2 for search_url
//search_url =
// ("https://www.googleapis.com/customsearch/v1?key=AIzaSyBJFEqcGUuwrai9n0xedh3CTDaFQK53zUw&cx=009315961641472818372:kyqr5g9u5wc&q=pac-man&start=11");

const search_url_1 =
  "https://www.googleapis.com/customsearch/v1?key=AIzaSyA8xWMzI9lmgl3zc4JxB_kzPopuOa0O5ak&cx=009315961641472818372:kyqr5g9u5wc&q=pac-man";

const search_url_2 =
  "https://www.googleapis.com/customsearch/v1?key=AIzaSyA8xWMzI9lmgl3zc4JxB_kzPopuOa0O5ak&cx=009315961641472818372:kyqr5g9u5wc&q=bandai+namco";

const search_url_3 =
  "https://www.googleapis.com/customsearch/v1?key=AIzaSyA8xWMzI9lmgl3zc4JxB_kzPopuOa0O5ak&cx=009315961641472818372:kyqr5g9u5wc&q=videogames";

/**
 *
 * Returns True if at least 200 words
 */
function WordCount200(str) {
  if (str === undefined || str.length == 0) {
    return false;
  } else {
    return str.split(" ").length > 200;
  }
}

/**
 *
 * @param {*} url - Url to extract links from
 */
async function get_links(url) {
  try {
    let links = [];
    const response = await nodeFetch(url);
    const json = await response.json();
    //console.log(json);
    for (x = 0; x < 10; x++) {
      let item = {};
      item.title = json.items[x].title;
      item.link = json.items[x].link;
      console.log(json.items[x].title);
      console.log(json.items[x].link + "\n");
      // console.log(links[x]);

      //links.push(json.items[x].link);
      if (typeof item.title !== undefined) {
        links.push(item);
      }
    }
    //console.log(links);
    let dataset = [];
    let max = 10;
    for (i = 0; i < 10; i++) {
      let resp = {};
      resp.title = links[i].title;
      let result = await parse_site(links[i].link);

      resp.content = await result;
      if (WordCount200(resp.content)) {
        dataset.push(resp);
      } else {
        max++;
      }
    }
    return await dataset;
  } catch (error) {
    console.log(error);
  }
}

/**
 *  Parse site, return HTML
 * @param {url to parse} url
 */
async function parse_site(url) {
  try {
    //nodeFetch(url).then(res => res.text()).then(body=>console.log(body))
    let body = await nodeFetch(url).then((res) => res.text());
    return body;
    //console.log(response);
  } catch (error) {
    console.log(error);
    return "Error Here";
  }
}

/**
 * Driver Function
 */
async function main() {
  // Get Data Sets
  let dataset = await get_links(search_url_1);
  let dataset2 = await get_links(search_url_2);
  let dataset3 = await get_links(search_url_3);

  for (x = 0; x < 10; x++) {
    // Standardize article name
    let name_str1 = "./Dataset/Pacman/article" + x;

    // Write to files
    if (dataset[x] !== undefined) {
      fs.writeFile(name_str1, dataset[x].content, function (err) {
        if (err) throw err;
        console.log("File saved!");
      });
    }
  }

  for (x = 0; x < 10; x++) {
    let name_str2 = "./Dataset/BandaiNamco/article" + x;

    if (dataset2[x] !== undefined) {
      fs.writeFile(name_str2, dataset2[x].content, function (err) {
        if (err) throw err;
        console.log("File saved!");
      });
    }
  }

  for (x = 0; x < 10; x++) {
    let name_str3 = "./Dataset/VideoGames/article" + x;
    if (dataset3[x] !== undefined) {
      fs.writeFile(name_str3, dataset3[x].content, function (err) {
        if (err) throw err;
        console.log("File saved!");
      });
    }
  }

  // return await dataset;
  // console.log("Length of data is " + dataset.length);
}

/* Driver code */
// Make directories
fs.mkdir("/Dataset/Pacman", { recursive: true }, (err) => {
  if (err) throw err;
});
fs.mkdir("/Dataset/BandaiNamco", { recursive: true }, (err) => {
  if (err) throw err;
});
fs.mkdir("/Dataset/VideoGames", { recursive: true }, (err) => {
  if (err) throw err;
});
// Run Code
main();
