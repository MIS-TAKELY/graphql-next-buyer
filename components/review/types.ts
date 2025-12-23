//  type MediaItem = {
//   id?: string;
//   type: "IMAGE" | "VIDEO";
//   url: string;
//   name?: string;
//   size?: number;
//   publicId?: string;
// };

// id: string;
//   url: string;
//   type: "IMAGE" | "VIDEO";
//   name: string;
//   size: number;
//   status?: "uploading" | "uploaded" | "error";
//   publicId?: string;

//  type Vote = { id: string; vote: boolean; userId: string };


// export type Review = {
//   id: string;
//   userId: string;
//   productId: string;
//   rating: number;
//   comment: string;
//   status: "APPROVED" | "PENDING" | "REJECTED";
//   isFeatured: boolean;
//   helpfulCount: number;
//   verifiedPurchase: boolean;
//   orderItemId?: string | null;
//   createdAt: string | Date;
//   updatedAt: string | Date;
//   user: User;
//   media: MediaItem[];
//   votes: Vote[];
//   isOptimistic: boolean;
// };

export interface ReviewUser {
  id: string;
  firstName?: string; // optional because second query uses "name"
  lastName?: string;
  name?: string;
}

export interface MediaItem {
  id?: string;
  type: "IMAGE" | "VIDEO";
  url: string;
  name?: string;
  size?: number;
  publicId?: string;
}

export interface ReviewMedia extends MediaItem {
  id: string; // required here
  status?: "uploading" | "uploaded" | "error";
}

export interface ReviewVote {
  id: string;
  vote: number; // or boolean if your schema uses true/false
  userId: string;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  status: string;
  isFeatured?: boolean;
  helpfulCount?: number;
  verifiedPurchase?: boolean;
  createdAt: string;
  updatedAt: string;
  user: ReviewUser;
  media: ReviewMedia[];
  votes?: ReviewVote[];
  isOptimistic: boolean;
}

export interface GetReviewsByProductSlugResponse {
  getReviewsByProductSlug: Review[];
}

export interface GetReviewsByProductSlugVars {
  slug: string;
}

export interface GetReviewResponse {
  getReview: Review;
}

export interface GetReviewVars {
  id: string;
}
