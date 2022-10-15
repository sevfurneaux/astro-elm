import { unlink } from "fs/promises";
import fs from "fs";

(async function (path) {
  try {
    await unlink(path);
    console.log(`successfully deleted ${path}`);
  } catch (error) {
    console.error("there was an error:", error.message);
  }
})(".vercel/output/functions/render.func/.vc-config.json");

fs.writeFile(
  ".vercel/output/functions/render.prerender-config.json",
  JSON.stringify({ expiration: 60 }),
  function (err) {
    if (err) throw err;
    console.log("File is created successfully.");
  }
);
