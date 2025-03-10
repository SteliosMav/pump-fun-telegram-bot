export function extractMintFromUrl(url: string) {
  const urlParts = url.split("/");
  return urlParts[urlParts.length - 1];
}

export function calculatePumpFunFee(amount: number) {
  return amount * 0.01;
}
