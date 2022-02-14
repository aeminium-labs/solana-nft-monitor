import { readJSON, removeFile } from "https://deno.land/x/flat@0.0.14/mod.ts";
import {
  addScore,
  cleanCSV,
  CollectionItem,
  parseData,
  writeData,
} from "./utils.ts";

type Item = {
  id: number;
  // deno-lint-ignore camelcase
  token_add: string;
  price: number;
  name: string;
};

type RawData = {
  items: Array<Item>;
};

const filename = Deno.args[0];
const collection = filename.split("__")[0];
let data: RawData = await readJSON(filename);
const csvFilename = `${collection}.csv`;

// 1 - Clean old entries
const csvData = await cleanCSV({ fileName: csvFilename, market: "solanart" });

const allTokens = data.items || [];
const limit = 100;
let page = 1;

// 2 - Fetch all tokens
const collections: Array<CollectionItem> = await readJSON(
  `.github/collections.json`
);

while (data.items.length > 0) {
  const collectionId = collections.filter(
    (c) => c["moonrank"] === collection
  )[0]["solanart"];

  try {
    data = await fetch(
      `https://qzlsklfacc.medianetwork.cloud/get_nft?collection=${collectionId}&page=${page}&limit=${limit}&order=price-ASC&fits=any&trait=&search=&min=0&max=0&listed=true&ownedby=&attrib_count=&bid=all`
    ).then((res) => res.json());

    if (data.items) {
      allTokens.push(...data.items);
    }
  } catch (_) {
    data.items = [];
  }

  page += 1;
}

// 3 - Parse data
const parsedData = await parseData<Item>({
  collection,
  data: allTokens,
  getID: (item) => item.name,
  getPrice: (item) => item.price,
  getUrl: (item) => `https://solanart.io/search/?token=${item.token_add}`,
});

// 4 - Add scores
const dataWithScore = addScore({ data: parsedData, csvData });

// 5 - Save data and cleanup file
await writeData({
  fileName: csvFilename,
  data: dataWithScore,
});
await removeFile(filename);
