export interface IProductsImages {
  id: string;
  altText?: string;
  url: string;
}

export interface IProductsReview {
  rating: number;
}

export interface IProductsVarient {
  id: string;
  price: string;
}

export interface ICategory {
  name: string;
}

export interface ISeller {
  firstName: string;
  lastName: string;
}

export interface IBrand {
  name: string;
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
  warranty: string;
  specifications: string;
  features: string;
}

export type TProduct = IProducts & IRemainingProductDetails;
