import { Application } from "https://deno.land/x/abc@v1.3.3/mod.ts";
import { DB } from "https://deno.land/x/sqlite@v2.5.0/mod.ts";
import { abcCors } from "https://deno.land/x/cors/mod.ts";
import { Client } from "https://deno.land/x/postgres/mod.ts";

const app = new Application();
const db = new Client(
  "postgres://czreijar:TJ2StTuQIl2CoRoinQTwPxk8pBGfdf6t@kandula.db.elephantsql.com/czreijar"
);
await db.connect();
const usersDb = new DB("users.db");
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
  //   .get("/countries/:country/:indicator/info", getCountryIndicatorInfo)
  //   .get("/countries/:country/:indicator/:year/info", getCountryIndicatorYearInfo)
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

async function getCountries(server) {
  const query = `SELECT * FROM countries`;
  const countries = (await db.queryObject(query)).rows;
  const countryNames = countries.map((country) => {
    return country.shortname;
  });
  return server.json(countryNames, 200);
}

async function getIndicators(server) {
  const query = `SELECT DISTINCT IndicatorName FROM Indicators`;
  const indicatorInfo = (await db.queryObject(query)).rows;
  const indicators = indicatorInfo.map((indicator) => {
    return indicator.indicatorname;
  });
  return server.json(indicators, 200);
}

async function getCountryInfo(server) {
  const { country } = await server.params;
  const formattedCountry = formatParam(country);
  const query = `
  SELECT * 
  FROM Indicators 
  WHERE countryName = $1`;
  const allCountryInfo = (
    await db.queryObject({ text: query, args: [formattedCountry] })
  ).rows;
  const countryIndicators = allCountryInfo.map((country) => {
    return `INDICATOR: ${country.indicatorname} YEAR: ${country.year} VALUE: ${country.value}`;
  });
  return server.json(countryIndicators, 200);
}
