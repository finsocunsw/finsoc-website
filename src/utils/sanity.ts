import { sanityClient } from "sanity:client";
import { createImageUrlBuilder } from "@sanity/image-url";
import { defineQuery } from "groq";

const builder = createImageUrlBuilder(sanityClient);

export function urlFor(source: any) {
  return builder.image(source);
}

export async function getPosts() {
  const POSTS_QUERY = defineQuery(`*[_type == "post" && defined(slug.current)] | order(publishedAt desc)`);
  return await sanityClient.fetch(POSTS_QUERY);
}

export async function getPost(slug: string) {
  const POST_QUERY = defineQuery(`*[_type == "post" && slug.current == $slug][0]`);
  return await sanityClient.fetch(POST_QUERY, { slug });
}

export async function getSponsors() {
  const SPONSORS_QUERY = defineQuery(`*[_type == "sponsor"] | order(sponsorTier asc, name asc)`);
  return await sanityClient.fetch(SPONSORS_QUERY);
}

export async function getEvents() {
  const EVENTS_QUERY = defineQuery(`*[_type == "event"] | order(dateOfEvent desc)`);
  return await sanityClient.fetch(EVENTS_QUERY);
}
