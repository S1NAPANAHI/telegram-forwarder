import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document'

class MyDocument extends Document {
  render() {
    const { locale } = this.props.__NEXT_DATA__.props.pageProps;
    const isRTL = locale === 'fa';
    const direction = isRTL ? 'rtl' : 'ltr';

    return (
      <Html lang={locale || 'en'} dir={direction}>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument
