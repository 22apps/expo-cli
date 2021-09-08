import { ExpoConfig, ExpoUpdatesManifest, getConfig } from '@expo/config';
import { JSONObject } from '@expo/json-file';
import { getRuntimeVersionForSDKVersion } from '@expo/sdk-runtime-versions';
import express from 'express';
import http from 'http';
import { parse } from 'url';
import { v4 as uuidv4 } from 'uuid';

import { ApiV2Error } from '../ApiV2';
import {
  Analytics,
  ANONYMOUS_USERNAME,
  ApiV2,
  Config,
  ConnectionStatus,
  ProjectAssets,
  ProjectUtils,
  resolveEntryPoint,
  UrlUtils,
  UserManager,
  UserSettings,
} from '../internal';
import {
  getBundleUrlAsync,
  getExpoGoConfig,
  getPackagerOptionsAsync,
  stripPort,
} from './ManifestHandler';

function getPlatformFromRequest(req: express.Request | http.IncomingMessage): string {
  const url = req.url ? parse(req.url, /* parseQueryString */ true) : null;
  const platform = url?.query.platform || req.headers['expo-platform'];
  if (!platform) {
    throw new Error('Must specify expo-platform header or query parameter');
  }
  return String(platform);
}

async function shouldUseAnonymousManifestAsync(): Promise<boolean> {
  const currentSession = await UserManager.getSessionAsync();
  return !currentSession || ConnectionStatus.isOffline();
}

async function getScopeKeyAndProjectIdForExpoConfigAsync(
  expoConfig: ExpoConfig
): Promise<{
  scopeKey: string;
  projectId: string | null;
}> {
  const shouldUseAnonymousManifest = await shouldUseAnonymousManifestAsync();
  if (shouldUseAnonymousManifest) {
    const userAnonymousIdentifier = await UserSettings.getAnonymousIdentifierAsync();
    return {
      scopeKey: `@${ANONYMOUS_USERNAME}/${expoConfig.slug}-${userAnonymousIdentifier}`,
      projectId: null,
    };
  }

  const user = await UserManager.ensureLoggedInAsync();
  const username = await UserManager.getCurrentUsernameAsync();
  const accountName = expoConfig.owner ?? username;
  const projectName = expoConfig.slug;

  try {
    const projects = await ApiV2.clientForUser(user).getAsync('projects', {
      experienceName: `@${accountName}/${projectName}`,
    });
    const project = projects[0];
    return {
      scopeKey: project.scopeKey,
      projectId: project.id,
    };
  } catch (e) {
    if (!(e instanceof ApiV2Error)) {
      throw e;
    }

    if (e.code !== 'EXPERIENCE_NOT_FOUND') {
      throw e;
    }
  }

  const { id, scopeKey } = await ApiV2.clientForUser(user).postAsync('projects', {
    accountName,
    projectName,
    privacy: 'hidden',
  });

  return {
    scopeKey,
    projectId: id,
  };
}

async function signManifestAsync(manifest: ExpoUpdatesManifest): Promise<string> {
  const user = await UserManager.ensureLoggedInAsync();
  const { signature } = await ApiV2.clientForUser(user).postAsync('manifest/eas/sign', {
    manifest: (manifest as any) as JSONObject,
  });
  return signature;
}

export async function getManifestResponseAsync({
  projectRoot,
  platform,
  host,
  acceptSignature,
}: {
  projectRoot: string;
  platform: string;
  host?: string;
  acceptSignature: boolean;
}): Promise<{
  body: ExpoUpdatesManifest;
  headers: Map<string, number | string | readonly string[]>;
}> {
  const headers = new Map<string, any>();
  // set required headers for Expo Updates manifest specification
  headers.set('expo-protocol-version', 0);
  headers.set('expo-sfv-version', 0);
  headers.set('cache-control', 'private, max-age=0');
  headers.set('content-type', 'application/json');

  const hostname = stripPort(host);
  const [projectSettings, bundleUrlPackagerOpts] = await getPackagerOptionsAsync(projectRoot);
  const projectConfig = getConfig(projectRoot);
  const entryPoint = resolveEntryPoint(projectRoot, platform, projectConfig);
  const mainModuleName = UrlUtils.stripJSExtension(entryPoint);
  const expoConfig = projectConfig.exp;
  const expoGoConfig = await getExpoGoConfig({
    projectRoot,
    projectSettings,
    mainModuleName,
    hostname,
  });

  const hostUri = await UrlUtils.constructHostUriAsync(projectRoot, hostname);

  const runtimeVersion =
    expoConfig.runtimeVersion ??
    (expoConfig.sdkVersion ? getRuntimeVersionForSDKVersion(expoConfig.sdkVersion) : null);
  if (!runtimeVersion) {
    throw new Error('Must specify runtimeVersion or sdkVersion in app.json');
  }

  const bundleUrl = await getBundleUrlAsync({
    projectRoot,
    platform,
    projectSettings,
    bundleUrlPackagerOpts,
    mainModuleName,
    hostname,
  });

  // For each manifest asset (for example `icon`):
  // - set a field on the manifest containing a reference to the asset: iconAsset: { rawUrl?: string, assetKey?: string }
  // - gather the data needed to embed a reference to that asset in the expo-updates assets key
  const assets = await ProjectAssets.resolveAndCollectExpoUpdatesManifestAssets(
    projectRoot,
    expoConfig,
    path => bundleUrl!.match(/^https?:\/\/.*?\//)![0] + 'assets/' + path
  );

  const { scopeKey, projectId } = await getScopeKeyAndProjectIdForExpoConfigAsync(expoConfig);

  const expoUpdatesManifest = {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    runtimeVersion,
    launchAsset: {
      key: mainModuleName,
      contentType: 'application/javascript',
      url: bundleUrl,
      fileExtension: '.fake', // shouldn't need this but android crashes without it
    },
    assets,
    metadata: {}, // required for the client to detect that this is an expo-updates manifest
    extra: {
      eas: {
        projectId: projectId ?? undefined,
      },
      expoClient: {
        ...expoConfig,
        hostUri,
      },
      expoGo: expoGoConfig,
      scopeKey,
    },
  };

  if (acceptSignature) {
    const shouldUseAnonymousManifest = await shouldUseAnonymousManifestAsync();
    const manifestSignature = shouldUseAnonymousManifest
      ? 'UNSIGNED'
      : await signManifestAsync(expoUpdatesManifest);
    headers.set('expo-manifest-signature', manifestSignature);
  }

  return {
    body: expoUpdatesManifest,
    headers,
  };
}

export function getManifestHandler(projectRoot: string) {
  return async (
    req: express.Request | http.IncomingMessage,
    res: express.Response | http.ServerResponse,
    next: (err?: Error) => void
  ) => {
    if (!req.url || parse(req.url).pathname !== '/update-manifest-experimental') {
      next();
      return;
    }

    try {
      const { body, headers } = await getManifestResponseAsync({
        projectRoot,
        host: req.headers.host,
        platform: getPlatformFromRequest(req),
        acceptSignature: req.headers['expo-accept-signature'] !== undefined,
      });
      for (const [headerName, headerValue] of headers) {
        res.setHeader(headerName, headerValue);
      }
      res.end(JSON.stringify(body));

      Analytics.logEvent('Serve Expo Updates Manifest', {
        projectRoot,
        developerTool: Config.developerTool,
        runtimeVersion: (body as any).runtimeVersion,
      });
    } catch (e) {
      ProjectUtils.logError(projectRoot, 'expo', e.stack);
      res.statusCode = 520;
      res.end(
        JSON.stringify({
          error: e.toString(),
        })
      );
    }
  };
}
