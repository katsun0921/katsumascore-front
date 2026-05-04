 
const admaxHtml = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      html,
      body {
        margin: 0;
        padding: 0;
        overflow: hidden;
      }
    </style>
  </head>
  <body>
    <script src="https://adm.shinobi.jp/s/907bbfd51ed847a8ad762bc34b8a57d4"></script>
  </body>
</html>
`;

export const Admax = () => (
  <iframe
    title="Admax"
    srcDoc={admaxHtml}
    width="300"
    height="250"
    loading="lazy"
    sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
    className="block max-w-full border-0"
  />
);
