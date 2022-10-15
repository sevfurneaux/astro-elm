import fs from "fs";

fs.writeFile(
  ".vercel/output/functions/render.prerender-config.json",
  JSON.stringify({
    expiration: 60,
    bypassToken: "VeryLongAndVerySecretBypassToken",
    allowQuery: undefined, // "If undefined each unique query value is cached independently"
  }),
  function (err) {
    if (err) throw err;
    console.log("File is created successfully.");
  }
);
