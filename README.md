# PalPay

### Setup (Mac OSX)

Download and run [Postgres App](http://www.postgresapp.com) (run on port 5432).

Run `sh setup.sh` in Terminal.

This should install Gulp and other required node dependencies. It also creates a database called `palpaydb` and a user `root`. To access the database, use `psql -d palpaydb -U root`.

To run the server, run `gulp` in Terminal. 

To migrate the database, run `node_modules/.bin/sequelize db:migrate`.

### Development 

To create a module using sequelize-cli, run `node_modules/.bin/sequelize model:create --name [ModelName] --attributes "[Attr1]:[DataType1], [Attr2]:[DataType2]"`.

To add constraints to the above model, go to `/server/models/` and find the corresponding file, and add [associations](http://docs.sequelizejs.com/en/latest/docs/associations/).

If you add models, run `node_modules/.bin/sequelize db:migrate`.

If you make changes to any models, run `node_modules/.bin/sequelize db:migrate:undo:all` and then `node_modules/.bin/sequelize db:migrate`, which will overwrite your existing database.