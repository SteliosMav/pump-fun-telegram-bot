export interface CoinData {
  mint: string;
  name: string;
  symbol: string;
  description: string;
  image_uri: string;
  video_uri: string | null;
  metadata_uri: string;
  twitter: string;
  telegram: string;
  bonding_curve: string;
  associated_bonding_curve: string;
  creator: string;
  created_timestamp: number; // Use number for timestamp (milliseconds since epoch)
  raydium_pool: string | null;
  complete: boolean;
  virtual_sol_reserves: number; // Assuming these are large numbers
  virtual_token_reserves: number;
  total_supply: number;
  website: string;
  show_name: boolean;
  king_of_the_hill_timestamp: number; // Use number for timestamp (milliseconds since epoch)
  market_cap: number;
  reply_count: number;
  last_reply: number; // Use number for timestamp (milliseconds since epoch)
  nsfw: boolean;
  market_id: string | null;
  inverted: string | null;
  is_currently_live: boolean;
  username: string;
  profile_image: string;
  usd_market_cap: number;
}
