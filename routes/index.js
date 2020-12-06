// ===============
// ROUTE
// ===============
const express = require("express");
const SitemapGenerator = require("sitemap-generator");
const router = express.Router();

router.route("/").get((req, res, next) => {
  res.render("index");
});

router.route("/get-site-map").post((req, res, next) => {
  // create generator
  const { urlToGen, depth, socketId } = req.body;
  const filePath = `./public/sm/sitemap-${depth}-${Date.now()}.xml`;
  let counter = 0;

  const generator = SitemapGenerator(urlToGen, {
    maxDepth: depth,
    filepath: filePath,
    lastMod: true,
    stripQuerystring: false,
  });

  // register event listeners
  generator.on("done", () => {
    // sitemaps created
    generator.stop();

    req.app.io
      .to(socketId)
      .emit("new-url-added", {
        url: `<strong>${counter} URLs has been crawled</strong>`,
      });
    res.status(200).json({
      status: "success",
      downloadUrl: filePath.split("public")[1],
    });
  });

  generator.on("add", (url) => {
    counter++;
    req.app.io.to(socketId).emit("new-url-added", { url: url });
  });

  generator.on("error", (error) => {
    generator.stop();
    res.status(404).json({
      status: "fail",
      message: error.message,
    });
  });

  // start the crawler
  generator.start();
});

module.exports = router;
