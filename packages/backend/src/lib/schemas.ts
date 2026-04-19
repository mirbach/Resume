import { z } from 'zod';

const bilingualText = z.object({
  en: z.string(),
  de: z.string(),
});

const eliteCategory = z.enum([
  'experience', 'leadership', 'impact', 'transformation', 'excellence',
]).optional();

const achievement = z.object({
  id: z.string(),
  challenge: bilingualText,
  action: bilingualText,
  result: bilingualText,
  eliteCategory,
});

const personalInfo = z.object({
  name: z.string(),
  title: bilingualText,
  email: z.string().optional(),
  phone: z.string(),
  location: bilingualText,
  linkedin: z.string().optional(),
  github: z.string().optional(),
  website: z.string().optional(),
  photo: z.string().optional(),
});

const experienceEntry = z.object({
  id: z.string(),
  company: z.string(),
  role: bilingualText,
  description: bilingualText.optional(),
  period: bilingualText,
  location: bilingualText,
  achievements: z.array(achievement),
});

const educationEntry = z.object({
  id: z.string(),
  institution: z.string(),
  degree: bilingualText,
  period: bilingualText,
  details: bilingualText.optional(),
});

const skillCategory = z.object({
  id: z.string(),
  category: bilingualText,
  items: z.array(bilingualText),
});

const certificationEntry = z.object({
  id: z.string(),
  name: z.string(),
  issuer: z.string(),
  date: bilingualText,
  url: z.string().optional(),
});

const languageEntry = z.object({
  id: z.string(),
  language: bilingualText,
  level: bilingualText,
});

const projectEntry = z.object({
  id: z.string(),
  name: bilingualText,
  company: z.string().optional(),
  description: bilingualText,
  technologies: z.array(z.string()),
  link: z.string().optional(),
  period: bilingualText.optional(),
  achievements: z.array(achievement),
});

const productEntry = z.object({
  id: z.string(),
  name: z.string(),
  description: bilingualText,
  role: bilingualText,
  highlights: z.array(bilingualText),
  link: z.string().optional(),
});

const referenceEntry = z.object({
  id: z.string(),
  name: z.string(),
  title: bilingualText,
  company: z.string(),
  contact: z.string().optional(),
});

export const resumeDataSchema = z.object({
  personal: personalInfo,
  summary: bilingualText,
  experience: z.array(experienceEntry),
  education: z.array(educationEntry),
  skills: z.array(skillCategory),
  certifications: z.array(certificationEntry),
  languages: z.array(languageEntry),
  projects: z.array(projectEntry),
  products: z.array(productEntry),
  references: z.array(referenceEntry),
});
