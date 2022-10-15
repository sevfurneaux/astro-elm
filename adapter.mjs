import fs from "fs";

fs.writeFile(
  ".vercel/output/functions/render.prerender-config.json",
  JSON.stringify({ expiration: 60 }),
  function (err) {
    if (err) throw err;
    console.log("File is created successfully.");
  }
);
