/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable no-template-curly-in-string */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable prefer-template */
/* eslint-disable @typescript-eslint/no-require-imports */
const { name } = require('./project.json');

const srcRoot = `packages/${name}`;

module.exports = {
  extends: 'release.config.base.js',
  pkgRoot: srcRoot,
  tagFormat: name + '-v${version}',
  commitPaths: [`${srcRoot}/*`],
  branches: ['main'],
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'conventionalcommits',
        releaseRules: [
          {
            type: 'docs',
            scope: 'README',
            release: 'patch',
          },
          {
            type: 'refactor',
            release: 'patch',
          },
          {
            type: 'style',
            release: 'patch',
          },
        ],
        parserOpts: {
          noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES'],
        },
      },
    ],
    '@semantic-release/release-notes-generator',
    [
      '@rpidanny/semantic-release-update-package.json',
      {
        packageJsonPath: `${srcRoot}/package.json`,
      },
    ],
    [
      '@semantic-release/changelog',
      {
        changelogFile: `${srcRoot}/CHANGELOG.md`,
      },
    ],
    [
      '@semantic-release/npm',
      {
        npmPublish: true,
        pkgRoot: `dist/${srcRoot}`,
      },
    ],
    [
      '@semantic-release/github',
      {
        assets: [],
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: [
          `${srcRoot}/package.json`,
          `${srcRoot}/package-lock.json`,
          `${srcRoot}/CHANGELOG.md`,
        ],
        message:
          `chore(${name}): ` +
          '${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
  ],
};
