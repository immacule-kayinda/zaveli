export type CategoryId = "habits" | "accessoires" | "chaussures";

export type SizeKind = "letter" | "shoe" | "unique";

export type ProductColor = {
  name: string;
  hex: string;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  category: CategoryId;
  description: string;
  colors: ProductColor[];
  sizes: string[];
  sizeKind: SizeKind;
  image: string;
  imageAlt: string;
  focal: string;
  isNew: boolean;
  /** Visible dans la boutique, mais impossible à commander. */
  soldOut?: boolean;
};

export type OrderLine = {
  name: string;
  size: string;
  color: string;
  sizeKind: SizeKind;
  quantity: number;
  unitPrice: number;
};

export type OrderDetails = {
  buyerName?: string;
  city?: string;
  phone?: string;
  /** Numéro de suivi, quand la commande a été enregistrée par le site. */
  orderId?: string;
};
