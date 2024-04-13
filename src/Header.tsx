import React from 'react';

import { Helmet } from 'react-helmet';

const Header: React.FC = () => (
  <Helmet>
    <title>GoBarber</title>
    <meta name="title" content="GoBarber" />
    <meta
      name="description"
      content="Appointments scheduler with your favorite hairdressers"
    />

    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://gobarber.danielynx.dev/" />
    <meta property="og:title" content="GoBarber" />
    <meta
      property="og:description"
      content="Appointments scheduler with your favorite hairdressers"
    />
    <meta
      property="og:image"
      content="https://gobarber.danielynx.dev/logo.png"
    />

    <meta property="twitter:card" content="photo" />
    <meta property="twitter:url" content="https://gobarber.danielynx.dev/" />
    <meta property="twitter:title" content="GoBarber" />
    <meta
      property="twitter:description"
      content="Appointments scheduler with your favorite hairdressers"
    />
    <meta
      property="twitter:image"
      content="https://gobarber.danielynx.dev/logo.png"
    />

    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    <link rel="manifest" href="/site.webmanifest" />
    <meta name="msapplication-TileColor" content="#da532c" />
    <meta name="theme-color" content="#ffffff" />
  </Helmet>
);

export default Header;
