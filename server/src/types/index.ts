export interface GlobalSalesMaster {
  item_id: string;
  master_code: number;
  master_name: string;
  region: string;
  gmv: number;
  quantity: number;
  sale_month: string;
  platform: string;
}

export interface QueryFilters {
  region?: string;
  platform?: string;
  sale_month?: string;
  item_id?: string;
}
