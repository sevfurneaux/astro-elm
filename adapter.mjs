import fs from "fs";

fs.writeFile(
  ".vercel/output/functions/render.prerender-config.json",
  JSON.stringify({
    expiration: 5,
    group: 1,
    bypassToken: "2ec9172003a647b296f324848dd3d407",
    fallback: {
      type: "FileFsRef",
      mode: 33188,
      fsPath: "render.prerender-fallback.html",
    },
  }),
  function (err) {
    if (err) throw err;
    console.log("File is created successfully.");
  }
);

fs.writeFile(
  ".vercel/output/functions/render.prerender-fallback.html",
  "Hello",
  function (err) {
    if (err) throw err;
    console.log("File is created successfully.");
  }
);
