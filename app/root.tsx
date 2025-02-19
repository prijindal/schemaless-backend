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