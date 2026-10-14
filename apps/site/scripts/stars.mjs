/*
 * Prints the repo's GitHub stars for the build to inline as
 * EXPO_PUBLIC_GITHUB_STARS. Prints nothing when GitHub does not answer in
 * time, so a failed fetch never fails the build: the page fetches the count
 * itself instead.
 */
const API = 'https://api.github.com/repos/bbrainttech/sileo-native';

try {
  const response = await fetch(API, {
    headers: process.env.GITHUB_TOKEN
      ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
      : {},
    signal: AbortSignal.timeout(10_000),
  });
  const repo = response.ok ? await response.json() : null;
  if (typeof repo?.stargazers_count === 'number') {
    process.stdout.write(String(repo.stargazers_count));
  }
} catch {}
