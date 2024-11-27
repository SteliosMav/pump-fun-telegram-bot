export function getCoinSlug(url: string) {
  const urlParts = url.split("/");
  return urlParts[urlParts.length - 1];
}

export function getPumpFunFee(amount: number) {
  return amount * 0.01;
}
