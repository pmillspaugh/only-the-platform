import http from "http";
import fs from "fs";
import path from "path";
import url from "url";

// `__filename` and `__dirname` not available in ES Modules
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.port || 3000;

let server;

function startServer() {
  server = http.createServer((req, res) => {
    console.log("req.url: ", req.url);

    try {
      let filePath = path.join(__dirname, req.url);
      if (filePath === path.join(__dirname, "/")) {
        filePath = path.join(__dirname, "index.html");
      } else if (!path.extname(filePath)) {
        // If no file extension, assume it's an HTML file
        filePath = path.join(__dirname, `./html${req.url}.html`);
      }

      try {
        fs.accessSync(filePath, fs.constants.F_OK);
      } catch (error) {
        // TODO: send 404 html page
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("File not found");
        return;
      }

      let contentType = "text/html";
      switch (path.extname(filePath)) {
        case ".js":
          contentType = "application/javascript";
          break;
        case ".css":
          contentType = "text/css";
          break;
        case ".png":
          contentType = "image/png";
          break;
      }

      const data = fs.readFileSync(filePath);
      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    } catch (error) {
      console.error(error);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end(error);
    }
  });

  server.listen(PORT, () => console.log(`Server listening on port ${PORT}...`));
}

startServer();

// TODO:
// This is broken
fs.watch(
  path.join(__dirname, "../"),
  { recursive: true },
  (eventType, filename) => {
    if (eventType === "change") {
      console.log(`Updated ${filename}`);
    }
    server.close(() => {
      console.log("\u{26A1} Restarting server...");
      startServer();
    });
  }
);
