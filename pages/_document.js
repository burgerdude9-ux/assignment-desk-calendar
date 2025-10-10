import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link rel="icon" href="/logo/logo.png" />
          <link rel="apple-touch-icon" href="/logo/logo.png" />
          <link href='https://cdn.jsdelivr.net/npm/@fullcalendar/core@6/main.css' rel='stylesheet' />
          <link href='https://cdn.jsdelivr.net/npm/@fullcalendar/daygrid@6/main.css' rel='stylesheet' />
          <link href='https://cdn.jsdelivr.net/npm/@fullcalendar/timegrid@6/main.css' rel='stylesheet' />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument