import { readJSON, removeFile } from "https://deno.land/x/flat@0.0.13/mod.ts";
import { addScore, cleanCSV, parseData, writeData } from "./utils.ts";

type RawData = {
  id: number;
  // deno-lint-ignore camelcase
  token_add: string;
  price: number;
  name: string;
};

const filename = Deno.args[0];
const collection = filename.split("__")[0];
const data: Array<RawData> = await readJSON(filename);
const csvFilename = `${collection}.csv`;

// 1 - Clean old entries
const csvData = await cleanCSV({ fileName: csvFilename, market: "solanart" });

// 2 - Parse data
const parsedData = await parseData<RawData>({
  collection,
  data,
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
