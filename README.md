# WorldBankBackend

## API endpoints

### get - /countries

This endpoint gives a list of all countries in the database as an array.

### get - /indicators

This endpoint gives a list of all indicators in the database as an array.

### get - /countries/:country/info

This endpoint gives the indicator and value for a given country for every year.

### get - /countries/:country/:indicator/info

For a given country and indicator, this will return the value for that indicator for every year.

### get - /countries/:country/:indicator/:year/info

For a given country, indicator and year, this will return the value for that indicator for that specific year.
