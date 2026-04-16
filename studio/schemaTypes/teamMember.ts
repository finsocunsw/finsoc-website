import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'teamMember',
  title: 'Team Member',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      description: 'e.g., Co-President, Marketing Director',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Executive', value: 'exec' },
          { title: 'Director', value: 'director' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'rank',
      title: 'Executive Rank',
      type: 'string',
      hidden: ({ document }) => document?.category !== 'exec',
      options: {
        list: [
          { title: 'President', value: '1_president' },
          { title: 'Vice President', value: '2_vp' },
          { title: 'Executive Officer', value: '3_officer' },
        ],
      },
    }),
    defineField({
      name: 'portfolio',
      title: 'Director Portfolio',
      type: 'string',
      hidden: ({ document }) => document?.category !== 'director',
      options: {
        list: [
          { title: 'Marketing', value: 'Marketing' },
          { title: 'Multimedia', value: 'Multimedia' },
          { title: 'Events', value: 'Events' },
          { title: 'Sponsorships', value: 'Sponsorships' },
          { title: 'Socials', value: 'Socials' },
          { title: 'Human Resources', value: 'Human Resources' },
        ],
      },
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'number',
      initialValue: new Date().getFullYear(),
      validation: (Rule) => Rule.required().min(2000).max(2100),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'text',
    }),
    defineField({
      name: 'linkedin',
      title: 'LinkedIn URL',
      type: 'url',
    }),
    defineField({
      name: 'order',
      title: 'Internal Order',
      type: 'number',
      description: 'Optional: manual ordering within a group',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'role',
      media: 'image',
    },
  },
})
