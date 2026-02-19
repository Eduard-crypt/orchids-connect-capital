import type { Metadata } from "next";
import { ListingWizard } from "./_components/listing-wizard";

export const metadata: Metadata = {
  title: 'Create Listing - Connect Capitals',
  description: 'List your business for sale on Connect Capitals',
};

export default function CreateListingPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">List Your Business for Sale</h1>
          <p className="text-muted-foreground text-lg">
            Complete the 5-step wizard to create your listing. Your information will be reviewed by our team before going live.
          </p>
        </div>
        <ListingWizard />
      </div>
    </div>
  );
}