import { Children } from "react";
import Document, { Html, Head, Main, NextScript } from "next/document";
import createEmotionServer from "@emotion/server/create-instance";
import { createEmotionCache } from "../utils/create-emotion-cache";

class CustomDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <meta
            name="description"
            content="Esox Biologics utilises their extensive knowledge of the aquatic microbiome to provide disease prevention solutions that help improve livestock health and welfare."
          />
          <meta property="og:title" content="Esox Biologics" />
          <meta
            property="og:description"
            content="Esox Biologics utilises their extensive knowledge of the aquatic microbiome to provide disease prevention solutions that help improve livestock health and welfare."
          />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://www.esoxbiologics.com" />
          <meta
            property="og:image"
            content="https://www.esoxbiologics.com/static/esoxbiologics-logo.png"
          />

          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link
            href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
            rel="stylesheet"
          />
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/apple-touch-icon.png"
          />
          <link rel="icon" href="/favicon.ico" />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicon-16x16.png"
          />
          <meta name="theme-color" content="#111827" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

CustomDocument.getInitialProps = async (ctx) => {
  const originalRenderPage = ctx.renderPage;
  const cache = createEmotionCache();
  const { extractCriticalToChunks } = createEmotionServer(cache);

  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: (App) => (props) =>
        (
          <App
            // @ts-ignore
            emotionCache={cache}
            {...props}
          />
        ),
    });

  const initialProps = await Document.getInitialProps(ctx);
  const emotionStyles = extractCriticalToChunks(initialProps.html);
  const emotionStyleTags = emotionStyles.styles.map((style) => (
    <style
      data-emotion={`${style.key} ${style.ids.join(" ")}`}
      key={style.key}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: style.css }}
    />
  ));

  return {
    ...initialProps,
    styles: [...Children.toArray(initialProps.styles), ...emotionStyleTags],
  };
};

export default CustomDocument;
