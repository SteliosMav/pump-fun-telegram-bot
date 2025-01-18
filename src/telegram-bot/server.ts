import http from "http";

/**
 * Initializes a basic http server for health checks. Some hosting platforms like
 * Digital-Ocean, can read health-checks only through http protocols and not polling
 * like telegram-bot. If a health-check is not provided for example DO, the build will fail.
 */
export class Server {
  // Health check endpoint
  private server = http.createServer((req, res) => {
    if (req.url === "/") {
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/plain");
      res.end("OK");
    } else {
      res.statusCode = 404;
      res.end("Not Found");
    }
  });

  init(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.server.listen(8080, () => {
          console.log("Health check server is running on port 8080");
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}
