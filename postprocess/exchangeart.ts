import { readJSON, removeFile } from "https://deno.land/x/flat@0.0.13/mod.ts";
import { cleanCSV, parseData, addScore, writeData } from "./utils.ts";

type Item = {
  mintKey: string;
  lastListedPrice: number;
  name: string;
};

type RawData = {
  tokens: Array<Item>;
};

const filename = Deno.args[0];
const collection = filename.split("__")[0];
const data: RawData = await readJSON(filename);
const csvFilename = `${collection}.csv`;

// 1 - Clean old entries
const csvData = await cleanCSV({
  fileName: csvFilename,
  market: "exchange.art",
});

// 2 - Parse data
const parsedData = await parseData<Item>({
  collection,
  data: data.tokens,
  getID: (item) => item.name || item.mintKey,
  getPrice: (item) => item.lastListedPrice / 1000000000,
  getUrl: (item) => `https://exchange.art/single/${item.mintKey}`,
});

// 4 - Add scores
const dataWithScore = addScore({ data: parsedData, csvData });

// 5 - Save data and cleanup file
await writeData({
  fileName: csvFilename,
  data: dataWithScore,
});
await removeFile(filename);
