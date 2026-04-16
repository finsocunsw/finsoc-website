import { sanityClient } from "sanity:client";
import { createImageUrlBuilder } from "@sanity/image-url";
import { defineQuery } from "groq";

const builder = createImageUrlBuilder(sanityClient);

export function urlFor(source: any) {
  return builder.image(source);
}

export interface TeamMember {
  _id: string;
  name: string;
  role: string;
  category: 'exec' | 'director';
  rank?: string;
  portfolio?: string;
  year: number;
  image: any;
  bio?: string;
  linkedin?: string;
  order?: number;
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

export async function getTeamMembers(year?: number) {
  const currentYear = year || new Date().getFullYear();
  const TEAM_QUERY = defineQuery(`*[_type == "teamMember" && year == $year] | order(order asc, name asc)`);
  return await sanityClient.fetch(TEAM_QUERY, { year: currentYear });
}

export async function getTeamYears() {
  const YEARS_QUERY = defineQuery(`*[_type == "teamMember"].year`);
  const years = await sanityClient.fetch(YEARS_QUERY);
  return [...new Set(years)].sort((a: any, b: any) => b - a);
}
