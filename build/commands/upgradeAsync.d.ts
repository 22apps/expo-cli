import { Versions } from 'xdl';
declare type DependencyList = Record<string, string>;
declare type Options = {
    npm?: boolean;
    yarn?: boolean;
};
export declare type ExpoWorkflow = 'managed' | 'bare';
export declare type TargetSDKVersion = Pick<Versions.SDKVersion, 'expoReactNativeTag' | 'facebookReactVersion' | 'facebookReactNativeVersion' | 'relatedPackages' | 'iosClientVersion' | 'iosClientUrl' | 'androidClientVersion' | 'androidClientUrl' | 'beta'>;
export declare function actionAsync(requestedSdkVersion: string | null, options: Options): Promise<void>;
export declare function maybeFormatSdkVersion(sdkVersionString: string | null): string | null;
/**
 * Produce a list of dependencies used by the project that need to be updated
 */
export declare function getUpdatedDependenciesAsync(projectRoot: string, workflow: ExpoWorkflow, targetSdkVersion: TargetSDKVersion | null, targetSdkVersionString: string): Promise<{
    dependencies: DependencyList;
    removed: string[];
}>;
export declare type UpgradeDependenciesOptions = {
    projectDependencies: DependencyList;
    bundledNativeModules: DependencyList;
    sdkVersion?: string;
    workflow: ExpoWorkflow;
    targetSdkVersion: TargetSDKVersion | null;
};
export declare function getDependenciesFromBundledNativeModules({ projectDependencies, bundledNativeModules, sdkVersion, workflow, targetSdkVersion, }: UpgradeDependenciesOptions): DependencyList;
export declare function upgradeAsync({ requestedSdkVersion, projectRoot, workflow, }: {
    requestedSdkVersion: string | null;
    projectRoot: string;
    workflow: ExpoWorkflow;
}, options: Options): Promise<void>;
export {};
