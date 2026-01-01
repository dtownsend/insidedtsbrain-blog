import { Metadata } from 'next';
import { getArtworks } from '@/lib/contentful';
import ArtworkGrid from '@/components/art/ArtworkGrid';
import NewsletterForm from '@/components/shared/NewsletterForm';

export const metadata: Metadata = {
  title: 'Art Gallery',
  description: 'Browse my collection of 2D sketches, renderings, and visual artwork.',
};

export default async function ArtPage() {
  let artworks: Awaited<ReturnType<typeof getArtworks>> = [];

  try {
    artworks = await getArtworks();
  } catch (error) {
    console.error('Failed to fetch artworks:', error);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        Art Gallery
      </h1>
      <p className="text-gray-600 mb-8">
        A collection of 2D sketches, renderings, and visual explorations.
      </p>

      {artworks.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Gallery coming soon
          </h2>
          <p className="text-gray-600 mb-6">
            Subscribe to get notified when new artwork is added.
          </p>
          <div className="max-w-md mx-auto">
            <NewsletterForm />
          </div>
        </div>
      ) : (
        <ArtworkGrid artworks={artworks} />
      )}
    </div>
  );
}
