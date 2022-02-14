import {
  readJSON,
  readCSV,
  writeCSV,
} from "https://deno.land/x/flat@0.0.14/mod.ts";

export type CollectionItem = {
  moonrank: string;
  // deno-lint-ignore camelcase
  magic_eden: string | null;
  solanart: string | null;
  // deno-lint-ignore camelcase
  alpha_art: string | null;
  // deno-lint-ignore camelcase
  exchange_art: string | null;
};

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
      const { id, price, moonRank, storeURL, ...rest } = row;
      const score = rest["💎 score (%)"];
      delete rest["💎 score (%)"];

      const attributes =
        Object.keys(rest).reduce<Record<string, string>>((acc, key) => {
          return {
            ...acc,
            [key]: String(rest[key]),
          };
        }, {}) || {};

      return {
        id: String(id),
        price: parseFloat(String(price)),
        moonRank: parseInt(String(moonRank)),
        "💎 score (%)": parseFloat(String(score)),
        storeURL: String(storeURL),
        ...attributes,
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
  const moonrank: Record<
    string,
    { rank: string; attributes: Record<string, string> }
  > = await readJSON(`.github/moonrank/${collection}.json`);

  return data
    .map((item) => {
      let id = getID(item);
      if (id.includes("#")) {
        id = id.split("#")[1];
      }
      const storeURL = getUrl(item);
      const itemPrice = getPrice(item);

      const attributes = moonrank[id]?.attributes || {};

      return {
        id,
        price: itemPrice,
        moonRank: parseInt(moonrank[id]?.rank || ""),
        storeURL,
        ...attributes,
      };
    })
    .filter((item) => item.price > 0);
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
    const { id, price, moonRank, storeURL, ...rest } = item;
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
      ...rest,
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

  if (data.length > 0) {
    await writeCSV(fileName, data);
  } else {
    // Handle cases where we get 0 results. writeCSV gets headers from dictionary
    // keys, so since there are no objects, we pass the headers directly
    await writeCSV(fileName, "id,price,moonRank,💎 score (%),storeURL");
  }

  console.log("Wrote data");
}
