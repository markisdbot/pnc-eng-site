// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  integrations: [
      react(),
      starlight({
          title: 'GOOSE Works',
          description: 'Digital Substation Consulting — Expert services for Protection & Control and Digital Substation implementations.',
          logo: {
            src: './public/goose-works-logo.png',
            alt: 'GOOSE Works Logo',
          },
          social: [
            { icon: 'github', label: 'GitHub', href: 'https://github.com/gooseworks' },
            { icon: 'email', label: 'Contact', href: 'mailto:info@gooseworks.com' },
          ],
          customCss: ['./src/styles/global.css'],
          sidebar: [
              {
                  label: 'Digital Substations',
                  autogenerate: { directory: 'digital-substation' },
              },
              {
                  label: 'Protection & Control',
                  autogenerate: { directory: 'protection' },
              },
              {
                  label: 'Controls',
                  autogenerate: { directory: 'controls' },
              },
              {
                  label: 'Tools & Downloads',
                  autogenerate: { directory: 'tools' },
              },
          ],
      }),
	],

  vite: {
    plugins: [tailwindcss()],
  },
});
