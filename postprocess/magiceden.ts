import { readJSON, removeFile } from "https://deno.land/x/flat@0.0.13/mod.ts";
import {
  cleanCSV,
  parseData,
  addScore,
  writeData,
  CollectionItem,
} from "./utils.ts";

type Item = {
  mintAddress: string;
  price: number;
  title: string;
};

type RawData = {
  results: Array<Item>;
};

const filename = Deno.args[0];
const collection = filename.split("__")[0];
let data: RawData = await readJSON(filename);

const csvFilename = `${collection}.csv`;

// 1 - Clean old entries
const csvData = await cleanCSV({ fileName: csvFilename, market: "magiceden" });

// 2 - Fetch all other result pages (Magic Eden paginates)
const allTokens = data.results || [];
const limit = 500;
let page = 2;

const collections: Array<CollectionItem> = await readJSON(
  `.github/collections.json`
);

while (data.results.length > 0) {
  const collectionId = collections.filter(
    (c) => c["moonrank"] === collection
  )[0]["magic_eden"];

  try {
    data = await fetch(
      `https://api-mainnet.magiceden.io/rpc/getListedNFTsByQuery?q=%7B%22%24match%22%3A%7B%22collectionSymbol%22%3A%22${collectionId}%22%7D%2C%22%24sort%22%3A%7B%22takerAmount%22%3A1%2C%22createdAt%22%3A-1%7D%2C%22%24skip%22%3A${
        (page - 1) * limit
      }%2C%22%24limit%22%3A${limit}%7D`
    ).then((res) => res.json());

    if (data.results) {
      allTokens.push(...data.results);
    }
  } catch (_) {
    data.results = [];
  }

  page += 1;
}

// 3 - Parse data
const parsedData = await parseData<Item>({
  collection,
  data: allTokens,
  getID: (item) => item.title || item.mintAddress,
  getPrice: (item) => item.price,
  getUrl: (item) => `https://magiceden.io/item-details/${item.mintAddress}`,
});

// 4 - Add scores
const dataWithScore = addScore({ data: parsedData, csvData });

// 5 - Save data and cleanup file
await writeData({
  fileName: csvFilename,
  data: dataWithScore,
});
await removeFile(filename);
