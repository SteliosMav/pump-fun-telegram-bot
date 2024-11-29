import http from "http";

(async () => {
  //   // Usage Example
  //   const sessionId = "6646B37213725E1B7D00EE8420359BAC"; // Replace with your session ID
  //   const dhcpFrom = 2;
  //   const dhcpTo = 254;
  //   const validTime = 4; // Validity time in hours

  //   updateDHCPSettings(sessionId, dhcpFrom, dhcpTo, validTime);

  // Usage Example
  const username = "admin"; // Replace with your username
  const password = "knx35ers"; // Replace with your password

  const res = await login(username, password);
  console.log("Response: ", res);
})();

function login(username: string, password: string) {
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
      "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      Origin: "http://192.168.1.1",
      Referer: "http://192.168.1.1/html/login/index.html",
      Connection: "keep-alive",
      // Removed the Cookie header as it's not needed during login
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
      try {
        const responseJson = JSON.parse(data);
        if (responseJson && responseJson.sessionid) {
          console.log("Session ID:", responseJson.sessionid);
        } else {
          console.error("Failed to retrieve session ID:", data);
        }
      } catch (error) {
        console.error("Error parsing response:", error);
      }
    });
  });

  // Handle request errors
  req.on("error", (error) => {
    console.error("Error:", error.message);
  });

  // Write the payload and end the request
  req.write(payload);
  req.end();
}

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
