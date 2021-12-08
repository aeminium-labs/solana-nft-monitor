import {
  readJSON,
  readCSV,
  writeCSV,
} from "https://deno.land/x/flat@0.0.13/mod.ts";

export type BaseData = {
  id: string;
  price: number;
  moonRank: number;
  score?: number;
  storeURL: string;
};

export type ParsedData = {
  items: Array<BaseData>;
  minPrice: number;
  maxRank: number;
};

export async function cleanCSV({
  fileName,
  market,
}: {
  fileName: string;
  market: "solanart" | "alpha.art" | "magiceden" | "exchange.art";
}): Promise<Array<BaseData>> {
  try {
    const rawData: Array<Record<string, unknown>> = await readCSV(fileName);

    const csvData = rawData.map((row) => {
      return {
        id: String(row.id),
        price: parseFloat(String(row.price)),
        moonRank: parseInt(String(row.moonRank)),
        score: parseFloat(String(row.score)),
        storeURL: String(row.storeURL),
      };
    });

    return csvData.filter((item) => {
      return !item.storeURL.includes(market);
    });
  } catch (_e) {
    return [];
  }
}

export async function parseData<T>({
  collection,
  data,
  getID,
  getUrl,
  getPrice,
}: {
  collection: string;
  data: Array<T>;
  getID: (item: T) => string;
  getUrl: (item: T) => string;
  getPrice: (item: T) => number;
}): Promise<ParsedData> {
  const moonrank: Record<string, string> = await readJSON(
    `.github/moonrank/${collection}.json`
  );
  let minPrice = Infinity;
  let maxRank = 0;

  const items: Array<BaseData> = data.map((item) => {
    let id = getID(item);
    if (id.includes("#")) {
      id = id.split("#")[1];
    }
    const storeURL = getUrl(item);
    const itemPrice = getPrice(item);

    if (itemPrice < minPrice) {
      minPrice = itemPrice;
    }

    const rank = parseInt(moonrank[id] || "");
    if (rank > maxRank) {
      maxRank = rank;
    }

    return {
      id,
      price: itemPrice,
      moonRank: rank,
      storeURL,
    };
  });

  return {
    items,
    minPrice,
    maxRank,
  };
}

export function addScore(data: ParsedData): Array<BaseData> {
  return data.items.map((item) => {
    const { id, price, moonRank, storeURL } = item;

    return {
      id,
      price,
      moonRank,
      score:
        ((price - data.minPrice) * 200 + (moonRank / data.maxRank) * 500) / 2,
      storeURL,
    };
  });
}

export async function writeData({
  fileName,
  csvData,
  data,
}: {
  fileName: string;
  csvData: Array<BaseData>;
  data: Array<BaseData>;
}) {
  csvData.push(...data);
  csvData.sort((a, b) => parseInt(a.id) - parseInt(b.id));

  console.log("Processed Items:", data.length);
  console.log("Total Items in CSV:", csvData.length);

  await writeCSV(fileName, csvData);
  console.log("Wrote data");
}
