# KeystoneJS (v6) Template

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **node.js**: Visit the [node.js official website](https://nodejs.org/) and download the installer for your operating system. This will also install `npm` automatically, as it comes bundled with Node.js.
- **npm** (Node Package Manager): If you need to update npm after installing Node.js, you can do so by running `npm install -g npm` in your terminal.
- **pnpm**: After installing Node.js and npm, you can install pnpm by running `npm install -g pnpm` in your terminal. pnpm is a fast and disk space efficient package manager.

## Development

### CLI
```
pnpm i && pnpm dev
```

### VSCode
Press F5 to start debugging with defaults. Or press Ctrl + Shift + D and select a browser (Edge/Chrome) to debug with.

## Deployment

### CLI
```
pnpm i && pnpm start
```

## Configuration

### Database

By default the installation process with create an [SQLite database](https://keystonejs.com/docs/apis/config#sqlite) for ease-of-use. If you're wanting to use PostgreSQL, you can!

Just change the `db` property on line 19 of the Keystone file [./keystone.ts](./keystone.ts) to

```typescript
db: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL || 'DATABASE_URL_TO_REPLACE',
}
```

And provide your database url from PostgreSQL.

For more on database configuration, check out or [DB API Docs](https://keystonejs.com/docs/apis/config#db)

### Auth

We've put auth into its own file to make this humble starter easier to navigate. To explore it without auth turned on, comment out the `isAccessAllowed` on line 21 of the Keystone file [./keystone.ts](./keystone.ts).

For more on auth, check out our [Authentication API Docs](https://keystonejs.com/docs/apis/auth#authentication-api)
