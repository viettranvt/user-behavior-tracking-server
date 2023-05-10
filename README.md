![logo](https://nodejs.org/static/images/logo.svg)

# User Behavior Tracking

![license](https://img.shields.io/badge/license-MIT-blue.svg)

## Quick start:

- please make sure you have installed the `environment for nodejs`. If you install it, install `nvm`, it helps us to manage multiple node versions and easily switch node versions.
- Make sure you have `nodemon` installed if not then use the command `npm install -g nodemon`.
- Install dependencies: `npm install` or `yarn`.
- Create `.env` file at `root/web-server` directory to setup environment variables:

```
DB_HOST = mongodb+srv://<username>:<password>@<host>/<db_name>?retryWrites=true&w=majority
APP_PORT = 3500
```

- Start the server: `cd ./web-server nodemon app.js`.

- View locally on: `localhost:3500` || `localhost:3000`.
