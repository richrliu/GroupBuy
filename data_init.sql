DROP DATABASE IF EXISTS groupbuydb;
CREATE DATABASE palpaydb;

\c palpaydb;

CREATE TABLE Users (
  ID SERIAL NOT NULL PRIMARY KEY,
  Username VARCHAR(40) NOT NULL UNIQUE,
  PasswordEncrypted VARCHAR(256) NOT NULL
);

-- Group admin MUST be in Membership (must be member of that group)

-- FILL WITH DEFAULT VALUES

-- INSERT INTO Users VALUES(DEFAULT, 'richard', 'encrypted');