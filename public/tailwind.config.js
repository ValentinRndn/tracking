/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./**/*.html",  // Tous les fichiers HTML dans tous les sous-dossiers
    "./assets/**/*.{js,jsx,ts,tsx}",  // Tous les fichiers JS dans assets
    "./*.{js,jsx,ts,tsx}", // Fichiers JS à la racine
  ],
  theme: {
    extend: {
      zIndex: {
        '100': '100',
        '999': '999',
        '9999': '9999',
      },
      height: {
        'screen-navbar': 'calc(100vh - 80px)',
      },
    },
  },
  plugins: [],
};