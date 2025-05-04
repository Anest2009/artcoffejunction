export interface CustomizationOption {
  id: string;
  name: string;
  description?: string;
  price_adjustment: number;
  option_type: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  category_id?: string;
  is_available?: boolean;
  preparation_time_minutes?: number;
  customization_options?: CustomizationOption[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
  customizations?: CustomizationOption[] | {
    milk?: string;
    sugar?: number;
    ice?: string;
    flavor?: string[];
    temperature?: string;
  };
}

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}