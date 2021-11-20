// Helper library written for useful postprocessing tasks with Flat Data
// Has helper functions for manipulating csv, txt, json, excel, zip, and image files
import {
  readJSON,
  writeCSV,
  readCSV,
  removeFile,
} from "https://deno.land/x/flat@0.0.13/mod.ts";

type RawData = {
  id: number;
  // deno-lint-ignore camelcase
  token_add: string;
  price: number;
  // deno-lint-ignore camelcase
  for_sale: number;
  // deno-lint-ignore camelcase
  link_img: string;
  name: string;
  escrowAdd: string;
  // deno-lint-ignore camelcase
  seller_address: string;
  attributes: string;
  skin: null;
  type: string;
  ranking: null;
  lastSoldPrice: null | number;
};

type ParsedData = {
  id: string;
  price: number;
  moonRank?: string;
  storeURL: string;
};

// Step 1: Read the downloaded_filename JSON
const filename = Deno.args[0];
const collection = filename.split("__")[0];
const data: Array<RawData> = await readJSON(filename);
const moonrank: Record<string, string> = await readJSON(
  `.github/moonrank/${collection}.json`
);

// Step 2: Read the existing CSV file, if it exists, and remove old solanart entries
let csvData: Array<ParsedData> = [];
const csvFilename = `${collection}.csv`;

try {
  const rawData: Array<Record<string, unknown>> = await readCSV(csvFilename);

  csvData = rawData.map((row) => {
    return {
      id: String(row.id),
      price: parseFloat(String(row.price)),
      moonRank: String(row.moonRank),
      storeURL: String(row.storeURL),
    }
  });

  csvData = csvData.filter((item) => { return !item.storeURL.includes("solanart"); });
} catch(NotFound) {};

// Step 3: Filter specific data we want to keep
const enhancedData: Array<ParsedData> = data
  .map((item) => {
    let id = item.name;
    if (id.includes("#")) {
      id = id.split("#")[1];
    }
    const storeURL = `https://solanart.io/search/?token=${item.token_add}`;

    return {
      id,
      price: item.price,
      moonRank: moonrank[id],
      storeURL,
    };
  })
  .filter(Boolean);

// Step 4: Update the original CSV with the new data
csvData.push(...enhancedData);
csvData.sort((a, b) => parseInt(a.id) - parseInt(b.id));

console.log("Processed Items:", enhancedData.length);
console.log("Total Items in CSV:", csvData.length);

await writeCSV(csvFilename, csvData);
console.log("Wrote data");

await removeFile(filename);
