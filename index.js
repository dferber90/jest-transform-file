const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const THIS_FILE = fs.readFileSync(__filename);

// copied this function from
// https://github.com/douzi8/base64-img/blob/master/base64-img.js
const base64 = (filename, data) => {
  let extname = path.extname(filename).substr(1);
  extname = extname || "png";

  if (extname === "svg") extname = "svg+xml";

  return "data:image/" + extname + ";base64," + data.toString("base64");
};

module.exports = {
  getCacheKey: (fileData, filename, configString, { instrument }) => {
    return crypto
      .createHash("md5")
      .update(THIS_FILE)
      .update("\0", "utf8")
      .update(fileData)
      .update("\0", "utf8")
      .update(filename)
      .update("\0", "utf8")
      .update(configString)
      .update("\0", "utf8")
      .update(instrument ? "instrument" : "")
      .digest("hex");
  },
  process: (src, filename, config, options) => {
    // We could avoid reading from disk if we could use "src" directly, but I
    // could not make it work. I would like to do:
    //   const data = base64(filename, Buffer.from(src));
    // But that  did not work, so we use read the file for now.
    // This is an easy optimization in case somebody can make it work!
    const data = base64(filename, fs.readFileSync(filename));
    return `module.exports = ${JSON.stringify(data)};`;
  }
};
