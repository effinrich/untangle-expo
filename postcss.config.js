module.exports = {
  plugins: {
    // Flatten CSS nesting here: Metro re-nests it as `& {}`, which cannot match ::placeholder.
    "@tailwindcss/postcss": { optimize: { minify: false } },
  },
}
