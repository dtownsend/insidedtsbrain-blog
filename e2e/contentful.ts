import fs from 'node:fs';
import path from 'node:path';

// The roadmap tests write to a live Contentful entry through the management
// token, which lives only in .env.local (next dev loads it; the test runner
// does not). CI carries no Contentful credentials on purpose, so those tests
// skip there and run for real locally. See README, "Testing".
const envFile = path.resolve(__dirname, '..', '.env.local');
export const hasContentfulCredentials =
  fs.existsSync(envFile) && /^CONTENTFUL_MANAGEMENT_TOKEN=.+/m.test(fs.readFileSync(envFile, 'utf8'));
export const NO_CONTENTFUL = 'no Contentful credentials in .env.local; CI runs without them by design';
