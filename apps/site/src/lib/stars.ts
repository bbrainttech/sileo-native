import { useEffect, useState } from 'react';

const API = 'https://api.github.com/repos/bbrainttech/sileo-native';

/*
 * The count at build time (`scripts/stars.mjs`), so the static HTML already
 * has it. Empty when that fetch failed or in the dev server.
 */
const raw = process.env.EXPO_PUBLIC_GITHUB_STARS;
const BUILT = raw && Number.isFinite(Number(raw)) ? Number(raw) : null;

/** the repo's GitHub stars: the build's count, then the live one */
export function useStars() {
  const [stars, setStars] = useState<number | null>(BUILT);

  useEffect(() => {
    const controller = new AbortController();
    fetch(API, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((repo) => {
        if (typeof repo?.stargazers_count === 'number') {
          setStars(repo.stargazers_count);
        }
      })
      // rate-limited or offline: keep the build's count
      .catch(() => {});
    return () => controller.abort();
  }, []);

  return stars;
}

const compact = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

/** 950, 1.2k, 12k */
export const formatStars = (stars: number) =>
  compact.format(stars).toLowerCase();
