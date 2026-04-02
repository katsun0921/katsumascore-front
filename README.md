## Development

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Storybook

Run Storybook locally:

```bash
npm run storybook
```

Build the static Storybook:

```bash
npm run build-storybook
```

The static files are generated in `storybook-static/`.

## GitHub Pages

This repository includes a GitHub Actions workflow for Storybook deployment.

1. Push to the `release/v1` branch.
2. In GitHub, open `Settings > Pages`.
3. Set `Source` to `GitHub Actions`.

After that, each push to `release/v1` rebuilds and deploys Storybook automatically.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.
