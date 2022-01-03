import { readJSON, removeFile } from "https://deno.land/x/flat@0.0.13/mod.ts";
import { addScore, cleanCSV, parseData, writeData } from "./utils.ts";

type Item = {
  mintId: string;
  title: string;
  price: string;
};

type RawData = {
  tokens: Array<Item>;
  nextPage: string | undefined;
};

const filename = Deno.args[0];
const collection = filename.split("__")[0];
let data: RawData = await readJSON(filename);
const csvFilename = `${collection}.csv`;

// 1 - Clean old entries
const csvData = await cleanCSV({ fileName: csvFilename, market: "alpha.art" });

// 2 - Fetch all other result pages (Alpha Art paginates)
const allTokens = data.tokens || [];

while (data.nextPage) {
  try {
    data = await fetch("https://apis.alpha.art/api/v1/collection", {
      method: "POST",
      body: JSON.stringify({ token: data.nextPage }),
    }).then((res) => res.json());

    if (data.tokens) {
      allTokens.push(...data.tokens);
    }
  } catch (_) {
    data.nextPage = undefined;
  }
}

// 3 - Parse data
const parsedData = await parseData<Item>({
  collection,
  data: allTokens,
  getID: (item) => item.title,
  getPrice: (item) => parseInt(item.price) / 1000000000,
  getUrl: (item) => `https://alpha.art/t/${item.mintId}`,
});

// 4 - Add scores
const dataWithScore = addScore({ data: parsedData, csvData });

// 5 - Save data and cleanup file
await writeData({
  fileName: csvFilename,
  data: dataWithScore,
});
await removeFile(filename);
