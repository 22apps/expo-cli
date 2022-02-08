"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _cliTable() {
  const data = _interopRequireDefault(require("cli-table3"));

  _cliTable = function () {
    return data;
  };

  return data;
}

function _fsExtra() {
  const data = _interopRequireDefault(require("fs-extra"));

  _fsExtra = function () {
    return data;
  };

  return data;
}

function _chunk() {
  const data = _interopRequireDefault(require("lodash/chunk"));

  _chunk = function () {
    return data;
  };

  return data;
}

function _omit() {
  const data = _interopRequireDefault(require("lodash/omit"));

  _omit = function () {
    return data;
  };

  return data;
}

function _pick() {
  const data = _interopRequireDefault(require("lodash/pick"));

  _pick = function () {
    return data;
  };

  return data;
}

function _xdl() {
  const data = require("xdl");

  _xdl = function () {
    return data;
  };

  return data;
}

function _log() {
  const data = _interopRequireDefault(require("../../../../log"));

  _log = function () {
    return data;
  };

  return data;
}

function _projects() {
  const data = require("../../../../projects");

  _projects = function () {
    return data;
  };

  return data;
}

function _ora() {
  const data = require("../../../../utils/ora");

  _ora = function () {
    return data;
  };

  return data;
}

function _promise() {
  const data = require("../../../utils/promise");

  _promise = function () {
    return data;
  };

  return data;
}

function _SubmissionService() {
  const data = _interopRequireWildcard(require("../SubmissionService"));

  _SubmissionService = function () {
    return data;
  };

  return data;
}

function _SubmissionService2() {
  const data = require("../SubmissionService.types");

  _SubmissionService2 = function () {
    return data;
  };

  return data;
}

function _archiveSource() {
  const data = require("../archive-source");

  _archiveSource = function () {
    return data;
  };

  return data;
}

function _config() {
  const data = require("../utils/config");

  _config = function () {
    return data;
  };

  return data;
}

function _logs() {
  const data = require("../utils/logs");

  _logs = function () {
    return data;
  };

  return data;
}

function _AndroidPackageSource() {
  const data = require("./AndroidPackageSource");

  _AndroidPackageSource = function () {
    return data;
  };

  return data;
}

function _ServiceAccountSource() {
  const data = require("./ServiceAccountSource");

  _ServiceAccountSource = function () {
    return data;
  };

  return data;
}

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class AndroidSubmitter {
  constructor(ctx, options) {
    this.ctx = ctx;
    this.options = options;
  }

  async submitAsync() {
    var _this$ctx$commandOpti;

    const resolvedSourceOptions = await this.resolveSourceOptions();
    const user = await _xdl().UserManager.ensureLoggedInAsync();
    const exp = (0, _config().getExpoConfig)(this.ctx.projectDir);
    const projectId = await (0, _projects().ensureProjectExistsAsync)(user, {
      accountName: (0, _projects().getProjectOwner)(user, exp),
      projectName: exp.slug
    });
    const submissionConfig = await AndroidOnlineSubmitter.formatSubmissionConfigAndPrintSummary({ ...this.options,
      projectId
    }, resolvedSourceOptions);
    const onlineSubmitter = new AndroidOnlineSubmitter(submissionConfig, (_this$ctx$commandOpti = this.ctx.commandOptions.verbose) !== null && _this$ctx$commandOpti !== void 0 ? _this$ctx$commandOpti : false);
    await onlineSubmitter.submitAsync();
  }

  async resolveSourceOptions() {
    const androidPackage = await (0, _AndroidPackageSource().getAndroidPackageAsync)(this.options.androidPackageSource);
    const archive = await (0, _archiveSource().getArchiveAsync)(this.options.archiveSource);
    const serviceAccountPath = await (0, _ServiceAccountSource().getServiceAccountAsync)(this.options.serviceAccountSource);
    return {
      androidPackage,
      archive,
      serviceAccountPath
    };
  }

}

class AndroidOnlineSubmitter {
  static async formatSubmissionConfigAndPrintSummary(options, {
    archive,
    androidPackage,
    serviceAccountPath
  }) {
    const serviceAccount = await _fsExtra().default.readFile(serviceAccountPath, 'utf-8');
    const submissionConfig = {
      androidPackage,
      archiveUrl: archive.location,
      archiveType: archive.type,
      serviceAccount,
      ...(0, _pick().default)(options, 'track', 'releaseStatus', 'projectId')
    };
    printSummary({ ...(0, _omit().default)(submissionConfig, 'serviceAccount'),
      serviceAccountPath
    });
    return submissionConfig;
  }

  constructor(submissionConfig, verbose = false) {
    this.submissionConfig = submissionConfig;
    this.verbose = verbose;
  }

  async submitAsync() {
    const scheduleSpinner = (0, _ora().ora)('Scheduling submission').start();
    let submissionId;

    try {
      submissionId = await _SubmissionService().default.startSubmissionAsync(_SubmissionService2().Platform.ANDROID, this.submissionConfig.projectId, this.submissionConfig);
      scheduleSpinner.succeed();
    } catch (err) {
      scheduleSpinner.fail('Failed to schedule submission');
      throw err;
    }

    let submissionCompleted = false;
    let submissionStatus = null;
    let submission = null;
    const submissionSpinner = (0, _ora().ora)('Submitting your app to Google Play Store').start();

    try {
      while (!submissionCompleted) {
        await (0, _promise().sleep)(_SubmissionService().DEFAULT_CHECK_INTERVAL_MS);
        submission = await _SubmissionService().default.getSubmissionAsync(this.submissionConfig.projectId, submissionId);
        submissionSpinner.text = AndroidOnlineSubmitter.getStatusText(submission.status);
        submissionStatus = submission.status;

        if (submissionStatus === _SubmissionService2().SubmissionStatus.ERRORED) {
          submissionCompleted = true;
          process.exitCode = 1;
          submissionSpinner.fail();
        } else if (submissionStatus === _SubmissionService2().SubmissionStatus.FINISHED) {
          submissionCompleted = true;
          submissionSpinner.succeed();
        }
      }
    } catch (err) {
      submissionSpinner.fail(AndroidOnlineSubmitter.getStatusText(_SubmissionService2().SubmissionStatus.ERRORED));
      throw err;
    }

    await (0, _logs().displayLogs)(submission, submissionStatus, this.verbose);
  }

  static getStatusText(status) {
    if (status === _SubmissionService2().SubmissionStatus.IN_QUEUE) {
      return 'Submitting your app to Google Play Store: waiting for an available submitter';
    } else if (status === _SubmissionService2().SubmissionStatus.IN_PROGRESS) {
      return 'Submitting your app to Google Play Store: submission in progress';
    } else if (status === _SubmissionService2().SubmissionStatus.FINISHED) {
      return 'Successfully submitted your app to Google Play Store!';
    } else if (status === _SubmissionService2().SubmissionStatus.ERRORED) {
      return 'Something went wrong when submitting your app to Google Play Store.';
    } else {
      throw new Error('This should never happen');
    }
  }

}

const SummaryHumanReadableKeys = {
  androidPackage: 'Android package',
  archivePath: 'Archive path',
  archiveUrl: 'Archive URL',
  archiveType: 'Archive type',
  serviceAccountPath: 'Google Service Account',
  track: 'Release track',
  releaseStatus: 'Release status',
  projectId: 'Project ID'
};
const SummaryHumanReadableValues = {
  archivePath: path => breakWord(path, 50),
  archiveUrl: url => breakWord(url, 50)
};

function breakWord(word, chars) {
  return (0, _chunk().default)(word, chars).map(arr => arr.join('')).join('\n');
}

function printSummary(summary) {
  const table = new (_cliTable().default)({
    colWidths: [25, 55],
    wordWrap: true
  });
  table.push([{
    colSpan: 2,
    content: _log().default.chalk.bold('Android Submission Summary'),
    hAlign: 'center'
  }]);

  for (const [key, value] of Object.entries(summary)) {
    var _SummaryHumanReadable, _SummaryHumanReadable2;

    const displayKey = SummaryHumanReadableKeys[key];
    const displayValue = (_SummaryHumanReadable = (_SummaryHumanReadable2 = SummaryHumanReadableValues[key]) === null || _SummaryHumanReadable2 === void 0 ? void 0 : _SummaryHumanReadable2.call(SummaryHumanReadableValues, value)) !== null && _SummaryHumanReadable !== void 0 ? _SummaryHumanReadable : value;
    table.push([displayKey, displayValue]);
  }

  _log().default.log(table.toString());
}

var _default = AndroidSubmitter;
exports.default = _default;
//# sourceMappingURL=AndroidSubmitter.js.map