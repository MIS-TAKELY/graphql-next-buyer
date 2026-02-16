export interface IProductsImages {
  id: string;
  altText?: string;
  url: string;
  type?: string;
  mediaType?: string;
  fileType?: string;
  sortOrder?: number;
}
export interface IProductsReview {
  id?: string;
  rating: number;
  comment?: string;
  createdAt?: string;
  user?: {
    id?: string;
    firstName?: string;
    lastName?: string;
  };
}
export interface IProductsVarient {
  id: string;
  price: string;
  mrp: string;
  sku?: string;
  productId?: string;
  stock?: string;
  isDefault?: boolean;
  attributes?: any;
  specifications?: {
    key: string;
    value: string;
  }[];
}
export interface ICategorySpecification {
  id: string;
  key: string;
  label: string;
  placeholder: string;
}
export interface ICategory {
  id?: string;
  name: string;
  slug: string;
  parent?: ICategory;
  children?: ICategory[];
  categorySpecification?: ICategorySpecification[];
}
export interface ISeller {
  id?: string;
  firstName: string;
  lastName: string;
  sellerProfile?: {
    shopName: string;
    slug: string;
    isActive: boolean;
    verificationStatus: string;
  };
}
export interface IBrand {
  id?: string;
  name: string;
}
export interface IOffer {
  description: string;
  endDate: string;
  isActive: boolean;
  startDate: string;
  title: string;
  type: string;
  value: string;
}
export interface IWarranty {
  id: string;
  type: 'MANUFACTURER' | 'SELLER' | 'NO_WARRANTY' | 'BRAND' | 'NONE';
  duration?: number;
  unit?: string;
  description?: string;
  createdAt?: string;
}
export interface IReturnPolicy {
  id: string;
  type: 'REPLACEMENT' | 'REFUND' | 'REPLACEMENT_OR_REFUND' | 'NO_RETURN';
  duration?: number;
  unit?: string;
  conditions?: string;
  createdAt?: string;
}
export interface IProductOffer {
  id: string;
  offer: IOffer;
}
export interface IDeliveryOption {
  description: string;
  title: string;
}
export interface IProducts {
  id: string;
  name: string;
  description: string;
  slug: string;
  status: string;
  images: IProductsImages[];
  reviews: IProductsReview[];
  variants: IProductsVarient[];
  returnPolicy?: IReturnPolicy[];
  warranty?: IWarranty[];
  category?: ICategory;
  productOffers?: IProductOffer[];
  specificationTable?: { key: string; value: string }[];
  specificationDisplayFormat?: 'table' | 'bullet' | 'custom_table';
  deliveryCharge?: number;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  createdAt: string;
}
export interface IProductVarient extends IProductsVarient {
  stock: string;
  isDefault: boolean;
}
export interface IRemainingProductDetails {
  category: ICategory;
  seller: ISeller;
  brand: IBrand;
  variants: IProductVarient[];
  warranty: IWarranty[];
  returnPolicy: IReturnPolicy[];
  specifications?: string;
  features?: string[];
  productOffers?: IProductOffer[];
  deliveryOptions?: IDeliveryOption[];
  createdAt?: string;
}
export type TProduct = IProducts & IRemainingProductDetails;
