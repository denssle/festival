# Cool Webapplication for planing private Events

## Installation

- add `.env` File for Connection to a Maria DB. Should look like this:
- database name same as user name
- the db should run on `localhost:3306`

```
MARIA_DB_USER="***"
MARIA_DB_PASSWORD="***"
MARIA_DB_NAME="dev"
```

- run `npm install`
- run `npm run dev`
- Application starts on http://localhost:5173

## Deployment (Production)

On the production server (e.g. Uberspace), the application should be started with:

```bash
npm run start-server
```

This command ensures that dependencies are installed and the server is reachable under the configured host.
