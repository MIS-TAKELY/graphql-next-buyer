// import { MediaItem } from "@/components/review/types";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { useState } from "react";
// import { MediaUploader } from "./MediaUploader";
// import { StarRating } from "./StarRating";

// export const AddReviewForm = ({
//   onSubmit,
//   onCancel,
// }: {
//   onSubmit: (payload: {
//     rating: number;
//     comment: string;
//     media: MediaItem[]; // Changed to pass full media array
//   }) => Promise<void> | void;
//   onCancel: () => void;
// }) => {
//   const [rating, setRating] = useState(0);
//   const [comment, setComment] = useState("");
//   const [media, setMedia] = useState<MediaItem[]>([]);

//   const canSubmit = rating > 0 && comment.trim().length > 0;

//   const handleSubmit = async () => {
//     if (!canSubmit) return;

//     try {
//       await onSubmit({ rating, comment, media }); // Pass full media array
//       setRating(0);
//       setComment("");
//       setMedia([]);
//     } catch (error) {
//       console.error("Failed to submit review:", error);
//     } finally {
//     }
//   };

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Write Your Review</CardTitle>
//       </CardHeader>
//       <CardContent className="space-y-6">
//         <div>
//           <Label className="text-base font-medium">Rating *</Label>
//           <div className="mt-2">
//             <StarRating value={rating} onChange={setRating} />
//           </div>
//         </div>

//         <div>
//           <Label htmlFor="comment" className="text-base font-medium">
//             Your Review *
//           </Label>
//           <Textarea
//             id="comment"
//             placeholder="Share your experience with this product..."
//             value={comment}
//             onChange={(e) => setComment(e.target.value)}
//             className="mt-2 min-h-[120px]"
//           />
//         </div>

//         <div>
//           <Label className="text-base font-medium">
//             Add Photos or Videos (Optional)
//           </Label>
//           <MediaUploader value={media} onChange={setMedia} />
//         </div>

//         <div className="flex justify-end gap-3 pt-4">
//           <Button variant="outline" onClick={onCancel}>
//             Cancel
//           </Button>
//           <Button onClick={handleSubmit} disabled={!canSubmit}>
//             Submit Review
//           </Button>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };
