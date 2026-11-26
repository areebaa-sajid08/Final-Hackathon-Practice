# Carewell Clinic Frontend

Responsive React frontend for the clinic appointment system, built with Vite and Tailwind CSS v4.

## Development

```sh
npm install
npm run dev
```

## Validation

```sh
npm run lint
npm run build
```

## Styling

Tailwind CSS v4 is integrated through `@tailwindcss/vite`. Global Tailwind setup is in `src/index.css`; component and page styling uses Tailwind utility classes. Interactive depth and transforms use CSS utilities and honor reduced-motion preferences for loading animation.

Set `VITE_API_BASE_URL` to the clinic API base URL when using a non-default backend. The default is `https://final-hackathon-practice.vercel.app/api`.
