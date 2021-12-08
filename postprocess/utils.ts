import {
  readJSON,
  readCSV,
  writeCSV,
} from "https://deno.land/x/flat@0.0.13/mod.ts";

export type BaseData = {
  id: string;
  price: number;
  moonRank: number;
  "💎 score (%)"?: number;
  storeURL: string;
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
        "💎 score (%)": parseFloat(String(row["💎 score (%)"])),
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
}): Promise<Array<BaseData>> {
  const moonrank: Record<string, string> = await readJSON(
    `.github/moonrank/${collection}.json`
  );

  return data.map((item) => {
    let id = getID(item);
    if (id.includes("#")) {
      id = id.split("#")[1];
    }
    const storeURL = getUrl(item);
    const itemPrice = getPrice(item);

    return {
      id,
      price: itemPrice,
      moonRank: parseInt(moonrank[id] || ""),
      storeURL,
    };
  });
}

export function addScore({
  data,
  csvData,
}: {
  data: Array<BaseData>;
  csvData: Array<BaseData>;
}): Array<BaseData> {
  const items = [...csvData, ...data];

  // Calculate minPrice and maxRank for scoring
  let minPrice = Infinity;
  let maxRank = 0;

  items.forEach((item) => {
    if (item.price < minPrice) {
      minPrice = item.price;
    }

    if (item.moonRank > maxRank) {
      maxRank = item.moonRank;
    }
  });

  // Calculate scores and update data
  return items.map((item) => {
    const { id, price, moonRank, storeURL } = item;
    const priceScore = (price - minPrice) * 0.2;
    const rankScore = (moonRank / maxRank) * 0.8;
    const scorePercentage = (1 - (priceScore + rankScore) / 2) * 100;
    const roundedScore =
      Math.round((scorePercentage + Number.EPSILON) * 100) / 100;

    return {
      id,
      price,
      moonRank,
      "💎 score (%)": roundedScore > 0 ? roundedScore : 0,
      storeURL,
    };
  });
}

export async function writeData({
  fileName,
  data,
}: {
  fileName: string;
  data: Array<BaseData>;
}) {
  data.sort((a, b) => parseInt(a.id) - parseInt(b.id));

  console.log("Processed Items:", data.length);
  console.log("Total Items in CSV:", data.length);

  await writeCSV(fileName, data);
  console.log("Wrote data");
}
