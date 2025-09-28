export type MediaItem = {
  id: string;
  type: "IMAGE" | "VIDEO";
  url: string;
  name?: string;
  size?: number;
};

export type Vote = { id: string; vote: boolean; userId: string };

export type User = { firstName: string; lastName: string };

export type Review = {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string;
  status: "APPROVED" | "PENDING" | "REJECTED";
  isFeatured: boolean;
  helpfulCount: number;
  verifiedPurchase: boolean;
  orderItemId?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  user: User;
  media: MediaItem[];
  votes: Vote[];
};
