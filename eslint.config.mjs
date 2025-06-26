import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Use 'next' as the recommended base config for Next.js projects.
  // For stricter rules, you can use 'next/core-web-vitals' instead.
  ...compat.extends("next"),
];

export default eslintConfig;
