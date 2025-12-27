import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const secret = request.headers.get('x-revalidate-secret');
    
    // Verify the webhook secret
    if (secret !== process.env.CONTENTFUL_REVALIDATE_SECRET) {
      return NextResponse.json(
        { error: 'Invalid secret' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const contentType = body.sys?.contentType?.sys?.id;
    const slug = body.fields?.slug?.['en-US'];

    // Revalidate based on content type
    switch (contentType) {
      case 'post':
        revalidatePath('/blog');
        revalidatePath('/');
        if (slug) {
          revalidatePath(`/blog/${slug}`);
        }
        // Revalidate tag pages
        const tags = body.fields?.tags?.['en-US'];
        if (tags && Array.isArray(tags)) {
          tags.forEach((tag: string) => {
            revalidatePath(`/blog/tag/${tag}`);
          });
        }
        break;

      case 'artwork':
        revalidatePath('/art');
        revalidatePath('/');
        break;

      case 'resumeItem':
      case 'skill':
        revalidatePath('/resume');
        break;

      case 'page':
        if (slug) {
          revalidatePath(`/${slug}`);
        }
        break;

      default:
        // Revalidate everything as a fallback
        revalidatePath('/', 'layout');
    }

    return NextResponse.json({ 
      revalidated: true,
      contentType,
      slug,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { error: 'Revalidation failed' },
      { status: 500 }
    );
  }
}
