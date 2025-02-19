import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from '@mantine/core';
import React from "react";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import '@mantine/core/styles.css';

export default function App() {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <link
          rel="icon"
          href="data:image/x-icon;base64,AA"
        />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <ColorSchemeScript />
        <Meta />
        <Links />
      </head>
      <body>
        <MantineProvider>
          <Outlet />
        </MantineProvider>
        <ScrollRestoration />

        <Scripts />
      </body>
    </html>
  );
}