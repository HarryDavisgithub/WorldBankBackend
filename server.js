import { Application } from "https://deno.land/x/abc@v1.3.3/mod.ts";
import { DB } from "https://deno.land/x/sqlite@v2.5.0/mod.ts";
import { abcCors } from "https://deno.land/x/cors/mod.ts";

const app = new Application();
const db = new DB("../world-development-indicators/database.sqlite");
const PORT = 8080;
const allowedHeaders = [
  "Authorization",
  "Content-Type",
  "Accept",
  "Origin",
  "User-Agent",
];

app
  .use(allowCors())
  .get("/countries", getCountries)
  .get("/indicators", getIndicators)
  .get("/countries/:country/info", getCountryInfo)
  .get("/countries/:country/:indicator/info", getCountryIndicatorInfo)
  .get("/countries/:country/:indicator/:year/info", getCountryIndicatorYearInfo)
  // Create endpoint for two years
  .get(
    "/compare/:firstCountry/:secondCountry/:indicator",
    getTwoCountriesIndicatorInfo
  )
  .start({ port: PORT });
console.log(`Server running on http://localhost:${PORT}`);

function allowCors() {
  return abcCors({
    origin: `http://localhost:3000`,
    headers: allowedHeaders,
    credentials: true,
  });
}

function formatParam(param) {
  const formattedParam = param.replaceAll("%20", " ");
  return formattedParam;
}

function checkReturnedArrayLength(array) {
  return array.length > 0 ? true : false;
}

async function getCountries(server) {
  const query = `SELECT * FROM Country`;
  const countries = [...(await db.query(query)).asObjects()];
  const countryNames = countries.map((country) => {
    return country.ShortName;
  });
  return server.json(countryNames, 200);
}

async function getIndicators(server) {
  const query = `SELECT DISTINCT IndicatorName FROM Indicators`;
  const indicatorInfo = [...(await db.query(query).asObjects())];
  const indicators = indicatorInfo.map((indicator) => {
    return indicator.IndicatorName;
  });
  return server.json(indicators, 200);
}

async function getCountryInfo(server) {
  const { country } = await server.params;
  const formattedCountry = formatParam(country);
  const query = `
    SELECT * 
    FROM Country 
    JOIN Indicators ON Indicators.CountryName = Country.ShortName 
    WHERE ShortName = ?
  `;
  const allCountryInfo = [
    ...(await db.query(query, [formattedCountry])).asObjects(),
  ];
  if (checkReturnedArrayLength(allCountryInfo)) {
    const countryIndicators = allCountryInfo.map((country) => {
      return `INDICATOR: ${country.IndicatorName} YEAR: ${country.Year} VALUE: ${country.Value}`;
    });
    return server.json(countryIndicators, 200);
  } else {
    return server.json({ response: "No information returned" });
  }
}

async function getCountryIndicatorInfo(server) {
  const { country, indicator } = await server.params;
  const formattedCountry = formatParam(country);
  const formattedIndicator = formatParam(indicator);
  const query = `
    SELECT * 
    FROM Country JOIN Indicators 
    ON Indicators.CountryName = Country.ShortName 
    WHERE ShortName = ?
    AND IndicatorName = ?
  `;
  const allCountryIndicatorInfo = [
    ...(
      await db.query(query, [formattedCountry, formattedIndicator])
    ).asObjects(),
  ];
  if (checkReturnedArrayLength(allCountryIndicatorInfo.length)) {
    const countryIndicatorInfo = allCountryIndicatorInfo.map((country) => {
      return `YEAR: ${country.Year} VALUE: ${country.Value}`;
    });
    return server.json(countryIndicatorInfo, 200);
  } else {
    return server.json({ response: "No information returned" });
  }
}

async function getCountryIndicatorYearInfo(server) {
  const { country, indicator, year } = await server.params;
  const formattedCountry = formatParam(country);
  const formattedIndicator = formatParam(indicator);
  const query = `
    SELECT * 
    FROM Country JOIN Indicators 
    ON Indicators.CountryName = Country.ShortName 
    WHERE ShortName = ?
    AND IndicatorName = ?
    AND Year = ?
  `;
  const allCountryIndicatorYearInfo = [
    ...(await db
      .query(query, [formattedCountry, formattedIndicator, year])
      .asObjects()),
  ];
  console.log(allCountryIndicatorYearInfo);
  if (checkReturnedArrayLength(allCountryIndicatorYearInfo)) {
    const countryIndicatorYearInfo = allCountryIndicatorYearInfo.map(
      (country) => {
        return `COUNTRY: ${country.ShortName}\nINDICATOR: ${country.IndicatorName}\nYEAR: ${country.Year}\nVALUE: ${country.Value}`;
      }
    );
    return server.json(countryIndicatorYearInfo[0], 200);
  } else {
    return server.json({ response: "No information returned" });
  }
}

async function getTwoCountriesIndicatorInfo(server) {
  const { firstCountry, secondCountry, indicator } = await server.params;
  const formattedFirstCountry = formatParam(firstCountry);
  const formattedSecondCountry = formatParam(secondCountry);
  const formattedIndicator = formatParam(indicator);
  const query = `
    SELECT *
    FROM Country
    JOIN Indicators 
    ON Indicators.CountryName = Country.ShortName
    WHERE (ShortName = ? OR ShortName = ?)
    AND IndicatorName = ?
  `;
  const allTwoCountriesIndicatorInfo = [
    ...(await db
      .query(query, [
        formattedFirstCountry,
        formattedSecondCountry,
        formattedIndicator,
      ])
      .asObjects()),
  ];
  const twoCountriesIndicatorInfo = allTwoCountriesIndicatorInfo.map(
    (country) => {
      return `COUNTRY: ${country.ShortName} INDICATOR: ${country.IndicatorName} YEAR: ${country.Year} VALUE: ${country.Value}`;
    }
  );
  return server.json(twoCountriesIndicatorInfo, 200);
}

// Test indicator: Access to electricity (% of population)
