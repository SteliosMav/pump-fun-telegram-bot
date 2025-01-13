export interface JitoResponse {
  jsonrpc: string; // '2.0'
  result: string; // signature
  id: number;
}

export type BundleStatus = {
  jsonrpc: string;
  result: {
    context: {
      slot: number;
    };
    value: {
      bundle_id: string;
      transactions: string[];
      slot: number;
      confirmation_status: string;
      err: any;
    }[];
  };
  id: number;
};
