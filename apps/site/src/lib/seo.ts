/*
 * What search engines and link previews read. The JSON-LD names the people
 * and pages behind the library with the ids rayanstudio.dev gives them, so
 * both sites describe one person, one studio and one project.
 */

export const SITE_URL = 'https://sileo.rayanstudio.dev';
export const SITE_NAME = 'sileo-native';
export const GITHUB = 'https://github.com/bbrainttech/sileo-native';
export const NPM = 'https://www.npmjs.com/package/sileo-native';
export const STUDIO = 'https://rayanstudio.dev';
export const CASE_STUDY = `${STUDIO}/projects/sileo-native`;
export const SILEO = 'https://github.com/hiaaryan/sileo';

export const HOME_TITLE =
  'sileo-native — physics-based toasts for React Native and Expo';
export const DESCRIPTION =
  "sileo-native is a physics-based toast library for React Native and Expo: sileo's pill that melts into a card, drawn with Skia, with Liquid Glass on iOS 26.";

export const OG_IMAGE = {
  url: `${SITE_URL}/og.jpg`,
  width: 1200,
  height: 630,
  alt: 'The sileo-native wordmark above three toasts: a Changes Saved pill, an Unsaved Changes card with Save and Discard buttons, and an Upload Failed pill',
};

export const TWITTER = '@ChiatiahRayan';

/** the canonical address of a route: no trailing slash, except the root */
export const pageUrl = (pathname: string) =>
  pathname === '/' ? `${SITE_URL}/` : `${SITE_URL}${pathname}`;

const WEBSITE_ID = `${SITE_URL}/#website`;
const SOFTWARE_ID = `${SITE_URL}/#software`;

/* rayanstudio.dev's own ids, with a name and url so each reads alone */
const PERSON = {
  '@type': 'Person',
  '@id': `${STUDIO}/#person`,
  'name': 'Chiatiah Rayan Nguea',
  'url': STUDIO,
};
const STUDIO_ORG = {
  '@type': 'Organization',
  '@id': `${STUDIO}/#organization`,
  'name': 'Rayan Studio',
  'url': STUDIO,
  'logo': `${STUDIO}/icon.png`,
};

/** the site and the library, on every page */
export const siteJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      'url': `${SITE_URL}/`,
      'name': SITE_NAME,
      'description': DESCRIPTION,
      'inLanguage': 'en',
      'about': { '@id': SOFTWARE_ID },
      'author': PERSON,
      'publisher': STUDIO_ORG,
    },
    {
      '@type': 'SoftwareSourceCode',
      '@id': SOFTWARE_ID,
      'name': SITE_NAME,
      'description': DESCRIPTION,
      'url': `${SITE_URL}/`,
      'image': OG_IMAGE.url,
      'codeRepository': GITHUB,
      'programmingLanguage': 'TypeScript',
      'runtimePlatform': ['React Native', 'Expo'],
      'license': 'https://opensource.org/licenses/MIT',
      'isBasedOn': {
        '@type': 'SoftwareSourceCode',
        'name': 'sileo',
        'url': SILEO,
      },
      'sameAs': [GITHUB, NPM],
      'subjectOf': { '@id': `${CASE_STUDY}#project`, 'url': CASE_STUDY },
      'author': PERSON,
      'creator': PERSON,
      'publisher': STUDIO_ORG,
      'keywords':
        'React Native toast, Expo toast, toast notifications, Skia, Reanimated, Liquid Glass, sileo',
    },
  ],
};

/** a docs page: a TechArticle about the library, under Docs */
export function pageJsonLd({
  pathname,
  title,
  description,
}: {
  pathname: string;
  title: string;
  description: string;
}) {
  const url = pageUrl(pathname);
  const crumbs = [
    { name: SITE_NAME, url: pageUrl('/') },
    ...(pathname.startsWith('/docs/')
      ? [{ name: 'Docs', url: pageUrl('/docs') }]
      : []),
    { name: title, url },
  ];
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': pathname.startsWith('/docs') ? 'TechArticle' : 'WebPage',
        '@id': `${url}#page`,
        url,
        'headline': title,
        description,
        'inLanguage': 'en',
        'isPartOf': { '@id': WEBSITE_ID },
        'about': { '@id': SOFTWARE_ID },
        'author': PERSON,
        'publisher': STUDIO_ORG,
        'image': OG_IMAGE.url,
      },
      {
        '@type': 'BreadcrumbList',
        'itemListElement': crumbs.map((crumb, index) => ({
          '@type': 'ListItem',
          'position': index + 1,
          'name': crumb.name,
          'item': crumb.url,
        })),
      },
    ],
  };
}

/** JSON for a script tag, with `<` escaped so the data cannot close it */
export const serializeJsonLd = (data: object) =>
  JSON.stringify(data).replace(/</g, '\\u003c');
