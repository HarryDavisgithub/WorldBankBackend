# WorldBankBackend

## Introduction

The backend server repository for the team Delta website displaying The World Bank data in a visually accessible format.

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

### get - /compare/:firstCountry/:secondCountry/:indicator/info

For 2 given countries and an indicator, get all the indicator values for all the years available.

### get - /compare/:firstCountry/:secondCountry/:indicator/:year/info

For 2 given countries and an indicator, get the indicator value for a specific year.

### post - /users

Post an email and password to this endpoint in order to create an account. The password stored will be encrypted using bCrypt with salt in users.db. Emails must be unique and error will be given if trying to sign up with an existing email.

### post - /sessions

Post an email and password to this endpoint in order to login to an existing account. Will return true if login is successful and false otherwise. The login time and user will be logged in the sessions table in users.db. Cookies will also be set using a v4 generated unique ID.

## Team Delta:

Project manager: Engineer Oliver Case-Green<br>
Systems architect: Engineer Harry Davis<br>
Quality assurance: Engineer Tamoor Waheed<br>
