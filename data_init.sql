DROP DATABASE IF EXISTS groupbuydb;
CREATE DATABASE groupbuydb;

\c groupbuydb;

CREATE TABLE Users (
  ID SERIAL NOT NULL PRIMARY KEY,
  Username VARCHAR(40) NOT NULL UNIQUE,
  PasswordEncrypted VARCHAR(256) NOT NULL
);

CREATE TABLE Groups (
	ID SERIAL NOT NULL PRIMARY KEY,
	Name VARCHAR(100) NOT NULL UNIQUE,
	Description VARCHAR(256),
	AdminID SERIAL NOT NULL REFERENCES Users(ID)
);

CREATE TABLE Membership (
	UserID SERIAL NOT NULL REFERENCES Users(ID),
	GroupID SERIAL NOT NULL REFERENCES Groups(ID)
);

-- Group admin MUST be in Membership (must be member of that group)

-- FILL WITH DEFAULT VALUES

-- INSERT INTO Users VALUES(DEFAULT, 'richard', 'encrypted');

-- INSERT INTO Groups VALUES(DEFAULT, 'richard', 'This is me.', 0);