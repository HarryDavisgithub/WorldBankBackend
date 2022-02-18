import Network from "../WorldBankFrontend/world-bank-app/src/Network.js";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

const network = new Network();

Deno.test("Check all countries list", async () => {
  const countryList = await network.getCountries();
  assertEquals(countryList.includes("United Kingdom"), true);
  assertEquals(countryList.includes("France"), true);
  assertEquals(countryList.includes("Ger"), false);
  assertEquals(countryList.includes("Mongolia"), true);
});

Deno.test("Check all indicators for country", async () => {
  const indicatorList = await network.getIndicators();
  assertEquals(indicatorList.includes("Urban population"), true);
  assertEquals(
    indicatorList.includes("Population, ages 0-14 (% of total)"),
    true
  );
  assertEquals(
    indicatorList.includes("Livestock production index (2004-2006 = 100)"),
    true
  );
  assertEquals(
    indicatorList.includes("Life expectancy at birth, male (years)"),
    true
  );
});

Deno.test("Invalid country gives error message", async () => {
  const indicatorInfo = await network.getCountryInfo("Invalid");

  assertEquals(indicatorInfo.response === "No information returned", true);
});

Deno.test("Check country indicator for specific year", async () => {
  const indicatorInfo = await network.getCountryIndicatorYearInfo(
    "Germany",
    "Population, ages 0-14 (% of total)",
    "2005"
  );

  assertEquals(indicatorInfo[0].Country, "Germany");
  assertEquals(
    indicatorInfo[0].Indicator,
    "Population, ages 0-14 (% of total)"
  );
  assertEquals(indicatorInfo[0].Year, 2005);
});

Deno.test("Check country indicator for unavailable year", async () => {
  const indicatorInfo = await network.getCountryIndicatorYearInfo(
    "Germany",
    "Population, ages 0-14 (% of total)",
    "2020"
  );

  assertEquals(indicatorInfo.response, "No information returned");
});

function formatParam(param) {
  const formattedParam = param.replaceAll("%20", " ");
  return formattedParam;
}

// Deno.test("Check country indicator for 2 countries for all years", async () => {
//   const indicatorInfo = await network.getCountryIndicatorYearInfo(
//     "France",
//     "Germany",
//     "Life expectancy at birth, male (years)"
//   );
//   console.log(indicatorInfo);
//   assertEquals(indicatorInfo[0].Country, "Germany");
//   assertEquals(
//     indicatorInfo[0].Indicator,
//     "Life expectancy at birth, male (years)"
//   );
//   assertEquals(indicatorInfo[0].Year, 2005);
// });

Deno.test("Wrong login info returns false", async () => {
  const response = await network.postLogin("example@gmail.com", "hello123");
  const json = await response.json();
  assertEquals(json.success, false);
});

Deno.test("Wrong login info returns false", async () => {
  const response = await network.postSignup("username", "hello123");
  const json = await response.json();
  assertEquals(json.error, "Enter valid email");
});

Deno.test("Wrong login info returns false", async () => {
  const response = await network.postSignup(
    "username@gmail.com",
    "password123"
  );
  const json = await response.json();
  assertEquals(json.error, "Email already in use");
});

Deno.test("%20 are removed correctly", async () => {
  const formatted = formatParam("%20hell%20o%20%20wo%20rld");
  assertEquals(formatted, " hell o  wo rld");
});

Deno.test("Country list contains all countries", async () => {
  const countryList = await network.getCountries();
  assertEquals(countryList.length, 247);
});

Deno.test("Indicator list contains all indicators", async () => {
  const indicatorList = await network.getIndicators();
  assertEquals(indicatorList.length, 1344);
});

//run using deno test server.test.js --allow-net --allow-read --allow-write
