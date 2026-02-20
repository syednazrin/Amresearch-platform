/** Industry options for research reports (admin upload/edit and public filter). */
export const INDUSTRIES = [
  'Technology',
  'Real Estate',
  'REITs',
  'Banking',
  'Consumer',
  'Healthcare',
  'Industrial',
  'Oil & Gas',
  'Property',
  'Other',
] as const;

export type Industry = (typeof INDUSTRIES)[number];
