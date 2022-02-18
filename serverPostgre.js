import { Application } from "https://deno.land/x/abc@v1.3.3/mod.ts";
import { DB } from "https://deno.land/x/sqlite@v2.5.0/mod.ts";
import { abcCors } from "https://deno.land/x/cors/mod.ts";
import { Client } from "https://deno.land/x/postgres/mod.ts";
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";
import { v4 } from "https://deno.land/std/uuid/mod.ts";

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
  .get("/countries/:country/:indicator/info", getCountryIndicatorInfo)
  .get("/countries/:country/:indicator/:year/info", getCountryIndicatorYearInfo)
  .get(
    "/compare/:firstCountry/:secondCountry/:indicator/info",
    getTwoCountriesIndicatorInfo
  )
  .get(
    "/compare/:firstCountry/:secondCountry/:indicator/:year/info",
    getTwoCountriesIndicatorYearInfo
  )
  .post("/users", postSignup)
  .post("/sessions", postLogin)
  .start({ port: PORT });
console.log(`Server running on http://localhost:${PORT}`);

function allowCors() {
  return abcCors({
    origin: `http://localhost:3000`,
    headers: allowedHeaders,
    credentials: true,
  });
}

export function formatParam(param) {
  const formattedParam = param.replaceAll("%20", " ");
  return formattedParam;
}

function checkReturnedArrayLength(array) {
  return array.length > 0 ? true : false;
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
    WHERE CountryName = $1
  `;
  const allCountryInfo = (
    await db.queryObject({ text: query, args: [formattedCountry] })
  ).rows;
  if (checkReturnedArrayLength(allCountryInfo)) {
    const countryIndicators = allCountryInfo.map((country) => {
      return {
        Indicator: country.indicatorname,
        Year: country.year,
        Value: Number(country.value),
      };
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
    FROM Indicators
    WHERE CountryName = $1
    AND IndicatorName = $2
  `;
  const allCountryIndicatorInfo = (
    await db.queryObject({
      text: query,
      args: [formattedCountry, formattedIndicator],
    })
  ).rows;
  if (checkReturnedArrayLength(allCountryIndicatorInfo)) {
    const countryIndicatorInfo = allCountryIndicatorInfo.map((country) => {
      return {
        Year: country.year,
        Value: Number(country.value),
      };
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
    FROM Indicators  
    WHERE CountryName = $1
    AND IndicatorName = $2
    AND Year = $3
  `;
  const allCountryIndicatorYearInfo = (
    await db.queryObject({
      text: query,
      args: [formattedCountry, formattedIndicator, year],
    })
  ).rows;
  if (checkReturnedArrayLength(allCountryIndicatorYearInfo)) {
    const countryIndicatorYearInfo = allCountryIndicatorYearInfo.map(
      (country) => {
        return {
          Country: country.countryname,
          Indicator: country.indicatorname,
          Year: country.year,
          Value: Number(country.value),
        };
      }
    );
    return server.json(countryIndicatorYearInfo);
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
    FROM Indicators
    WHERE (CountryName = $1 OR CountryName = $2)
    AND IndicatorName = $3
  `;
  const allTwoCountriesIndicatorInfo = (
    await db.queryObject({
      text: query,
      args: [formattedFirstCountry, formattedSecondCountry, formattedIndicator],
    })
  ).rows;
  const twoCountriesIndicatorInfo = allTwoCountriesIndicatorInfo.map(
    (country) => {
      return {
        Country: country.countryname,
        Indicator: country.indicatorname,
        Year: country.year,
        Value: Number(country.value),
      };
    }
  );
  return server.json(twoCountriesIndicatorInfo);
}

async function getTwoCountriesIndicatorYearInfo(server) {
  const { firstCountry, secondCountry, indicator, year } = await server.params;
  const formattedFirstCountry = formatParam(firstCountry);
  const formattedSecondCountry = formatParam(secondCountry);
  const formattedIndicator = formatParam(indicator);
  const query = `
    SELECT *
    FROM Indicators 
    WHERE (CountryName = $1 OR CountryName = $2)
    AND IndicatorName = $3
    AND Year = $4
  `;
  const allTwoCountriesIndicatorYearInfo = (
    await db.queryObject({
      text: query,
      args: [
        formattedFirstCountry,
        formattedSecondCountry,
        formattedIndicator,
        year,
      ],
    })
  ).rows;
  const twoCountriesIndicatorYearInfo = allTwoCountriesIndicatorYearInfo.map(
    (country) => {
      return {
        Country: country.countryname,
        Indicator: country.indicatorname,
        Year: country.year,
        Value: country.value,
      };
    }
  );
  return server.json(twoCountriesIndicatorYearInfo);
}

async function postSignup(server) {
  const { email, password } = await server.body;
  const salt = await bcrypt.genSalt(8);
  const passwordEncrypted = await bcrypt.hash(password, salt);

  if (!validateEmail(email)) {
    return server.json({ error: "Enter valid email" }, 400);
  }

  const checkRepeatEmails = [
    ...usersDb.query("SELECT COUNT(*) FROM users WHERE email = ?", [email]),
  ];

  if (checkRepeatEmails[0][0]) {
    return server.json({ error: "Email already in use" }, 400);
  }

  usersDb.query(
    "INSERT INTO users (email, encrypted_password, created_at, updated_at, admin) VALUES (?, ?, datetime('now'), datetime('now'), 1)",
    [email, passwordEncrypted]
  );
  server.json({ success: true }, 200);
}

export function validateEmail(mail) {
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
    return true;
  }
  return false;
}

async function postLogin(server) {
  const { email, password } = await server.body;
  const authenticated = [
    ...usersDb
      .query("SELECT * FROM users WHERE email = ?", [email])
      .asObjects(),
  ];
  if (
    authenticated.length &&
    (await bcrypt.compare(password, authenticated[0].encrypted_password))
  ) {
    makeSession(authenticated[0].id, server);
    server.json({ success: true });
  } else {
    server.json({ success: false });
  }
}

async function makeSession(userID, server) {
  const sessionID = v4.generate();
  await usersDb.query(
    `INSERT INTO sessions (uuid, user_id, created_at) VALUES (?, ?, datetime('now'))`,
    [sessionID, userID]
  );
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 1);
  server.setCookie({
    name: "sessionId",
    value: sessionID,
    expires: expiryDate,
  });
}

async function getCurrentUser(sessionID) {
  const user = [
    ...usersDb
      .query(
        "SELECT users.* FROM users JOIN sessions ON id = user_id WHERE uuid = ?",
        [sessionID]
      )
      .asObjects(),
  ];
  return user[0];
}
