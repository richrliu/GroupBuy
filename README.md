# GroupBuy
## Duke CS 316 Final Project

#### Setup (Mac OSX)
[Install Node.js.](http://blog.teamtreehouse.com/install-node-js-npm-mac)

Download and install [Postgres App](http://postgresapp.com/).

Run `npm install`

Run `pqsl -f data_init.sql`

Run `npm start` and go to `http://localhost:3000`

#### Testing
Make sure that Postgres is running on port 5432.

To test endpoints, download and use [Postman](https://www.getpostman.com/). 

Look at database changes by running `psql groupbuydb`.