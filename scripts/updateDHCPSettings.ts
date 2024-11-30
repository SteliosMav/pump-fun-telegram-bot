import http from "http";

(async () => {
  //   // Usage Example
  //   const sessionId = "050B197B4030F7994780B1FB1C2DAD47"; // Replace with your session ID
  //   const dhcpFrom = 2;
  //   const dhcpTo = 254;
  //   const validTime = 4; // Validity time in hours
  //   updateDHCPSettings(sessionId, dhcpFrom, dhcpTo, validTime);
  //   try {
  //     const sessionId = await login(username, password);
  //     console.log("Retrieved Session ID:", sessionId);
  //   } catch (error) {
  //     console.error("Login failed:", error);
  //   }
})();

function updateDHCPSettings(
  sessionId: string,
  dhcpFrom: number,
  dhcpTo: number,
  validTime: number
) {
  // Sanitize session ID
  const cleanSessionId = sessionId.trim().replace(/[\r\n]/g, "");

  // Define the payload in x-www-form-urlencoded format
  const payload = `lan_use_dhcp=1&lan_dhcp_from_4=${dhcpFrom}&lan_dhcp_to_4=${dhcpTo}&lan_dhcp_validtime=${validTime}&sessionid=${cleanSessionId}`;

  // Define the request options
  const options = {
    hostname: "192.168.1.1",
    port: 80,
    path: "/data/LAN.json",
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(payload),
      Accept: "application/json, text/javascript, */*",
      "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      Origin: "http://192.168.1.1",
      Referer: "http://192.168.1.1/html/content/network/lan.html",
      Connection: "keep-alive",
      Cookie: `session_id=${cleanSessionId}`,
    },
  };

  // Create the request
  const req = http.request(options, (res) => {
    let data = "";

    console.log(`Status Code: ${res.statusCode}`);

    // Collect response data
    res.on("data", (chunk) => {
      data += chunk;
    });

    // Log the response once fully received
    res.on("end", () => {
      console.log("Response:", data);
    });
  });

  // Handle request errors
  req.on("error", (error) => {
    console.error("Error:", error);
  });

  // Write the payload and end the request
  req.write(payload);
  req.end();
}

function login(username: string, password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Define the payload in x-www-form-urlencoded format
    const payload = `username=${encodeURIComponent(
      username
    )}&password=${encodeURIComponent(password)}&showpw=0`;

    // Define the request options
    const options = {
      hostname: "192.168.1.1",
      port: 80,
      path: "/data/Login.json",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(payload),
        Accept: "application/json, text/javascript, */*",
        "Accept-Encoding": "gzip, deflate",
        "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Origin: "http://192.168.1.1",
        Referer: "http://192.168.1.1/html/login/index.html",
        Connection: "keep-alive",
        // Cookie: "session_id=/",
        Host: "192.168.1.1",
        "X-Requested-With": "XMLHttpRequest",
      },
    };

    // Create the request
    const req = http.request(options, (res) => {
      let data = "";

      console.log(`Status Code: ${res.statusCode}`);

      // Collect response data
      res.on("data", (chunk) => {
        data += chunk;
      });

      // Process the response once fully received
      res.on("end", () => {
        console.log("Raw Response:", data); // Debugging

        try {
          const responseJson = JSON.parse(data);
          if (responseJson && responseJson.sessionid) {
            resolve(responseJson.sessionid); // Resolve with session ID
          } else {
            reject(new Error(`Invalid response: ${data}`));
          }
        } catch (error) {
          reject(new Error("Error parsing response: " + error));
        }
      });
    });

    // Handle request errors
    req.on("error", (error) => {
      reject(new Error("Error during request: " + error.message));
    });

    // Write the payload and end the request
    req.write(payload);
    req.end();
  });
}
