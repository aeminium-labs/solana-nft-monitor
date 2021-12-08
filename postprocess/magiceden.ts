import { readJSON, removeFile } from "https://deno.land/x/flat@0.0.13/mod.ts";
import { cleanCSV, parseData, addScore, writeData } from "./utils.ts";

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
const data: RawData = await readJSON(filename);

const csvFilename = `${collection}.csv`;

// 1 - Clean old entries
const csvData = await cleanCSV({ fileName: csvFilename, market: "magiceden" });

// 2 - Parse data
const parsedData = await parseData<Item>({
  collection,
  data: data.results,
  getID: (item) => item.title || item.mintAddress,
  getPrice: (item) => item.price,
  getUrl: (item) => `https://magiceden.io/item-details/${item.mintAddress}`,
});

// 4 - Add scores
const dataWithScore = addScore(parsedData);

// 5 - Save data and cleanup file
await writeData({ fileName: csvFilename, csvData, data: dataWithScore });
await removeFile(filename);
