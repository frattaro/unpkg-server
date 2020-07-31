import semver from 'semver';

import { getVersionsAndTags } from '../utils/npm.js';
import asyncHandler from '../utils/asyncHandler.js';

function byVersion(a, b) {
  return semver.lt(a, b) ? -1 : semver.gt(a, b) ? 1 : 0;
}

async function getAvailableVersions(packageName, log) {
  const versionsAndTags = await getVersionsAndTags(packageName, log);
  return versionsAndTags ? versionsAndTags.versions.sort(byVersion) : [];
}

async function serveVersions(req, res, next) {
  if (req.query.versions != null) {
    const availableVersions = await getAvailableVersions(
      req.packageName,
      req.log
    );

    return res
      .set({
        'Cache-Control': 'public, s-maxage=600, max-age=60', // 10 mins on CDN, 1 min on clients
        'Cache-Tag': 'versions',
      })
      .send(availableVersions);
  }

  next();
}

export default asyncHandler(serveVersions);
