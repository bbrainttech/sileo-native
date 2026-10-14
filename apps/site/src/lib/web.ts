/*
 * The site borrows rayanstudio's shapes and textures — squircle corners,
 * superellipse pills, gradient text, dot grids — which React Native styles
 * cannot express. Views carry `data-*` attributes instead, and the CSS in
 * `app/+html.tsx` draws them. Off the web the attributes do nothing.
 */
export type Squircle = 'lg' | 'xl' | '2xl' | '3xl';

export const data = (attrs: Record<string, string>) =>
  ({ dataSet: attrs }) as object;

/** `rounded-*` at rayanstudio's scale, the fallback where `corner-shape` is missing */
const RADIUS = 11.2;
export const radius: Record<Squircle, number> = {
  'lg': RADIUS,
  'xl': RADIUS * 1.4,
  '2xl': RADIUS * 1.8,
  '3xl': RADIUS * 2.2,
};
