export function extractMintFromUrl(url: string) {
  const urlParts = url.split("/");
  return urlParts[urlParts.length - 1];
}

export function calculatePumpFunFee(amount: number) {
  return amount * 0.01;
}

export function generateUsername(): string {
  function generateCustomID(alphabet: string, length: number): string {
    let result = "";
    const characters = alphabet.split("");
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters[Math.floor(Math.random() * charactersLength)];
    }
    return result;
  }

  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const id = generateCustomID(alphabet, 3);

  const randomNumber = Math.floor(Math.random() * 10);

  return `EzPump${randomNumber}${id}`; // The whole username must be max 10 characters
}
