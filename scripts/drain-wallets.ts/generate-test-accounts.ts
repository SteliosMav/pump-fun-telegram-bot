import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import fs from "fs";
import { sleep } from "./utils";

// Function to create a new test account
const createTestAccount = async () => {
  const keypair = Keypair.generate();
  const publicKey = keypair.publicKey.toBase58();
  const privateKey = bs58.encode(keypair.secretKey);

  return { publicKey, privateKey };
};

// Main function to generate multiple test accounts and export them to a JSON file
(async () => {
  try {
    console.log("Generating test accounts...");

    const accounts = [];

    // Generate 4 test accounts
    for (let i = 0; i < 4; i++) {
      const account = await createTestAccount();
      accounts.push(account);
      console.log(`Generated Account ${i + 1}:`, account);
      await sleep(500);
    }

    // Save accounts to a TypeScript file as an exported object
    const filePath = `${__dirname}/test-accounts.ts`;
    const tsContent = `export const testAccounts = ${JSON.stringify(
      accounts,
      null,
      2
    )};`;
    fs.writeFileSync(filePath, tsContent);
    console.log(`Accounts saved to ${filePath}`);
  } catch (error) {
    console.error("An error occurred while generating test accounts:", error);
  }
})();
