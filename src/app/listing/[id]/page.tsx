import type { Metadata } from "next";
import { ListingDetails } from "./_components/listing-details";

export const metadata: Metadata = {
  title: "Business Listing Details — OptiFirm",
  description: "View detailed information about this business opportunity",
};

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-background">
      <ListingDetails listingId={params.id} />
    </div>
  );
}