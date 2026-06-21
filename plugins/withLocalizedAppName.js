const { withDangerousMod, withInfoPlist } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

/**
 * Expo Config Plugin: withLocalizedAppName
 *
 * Injects localized app name files for iOS and Android at prebuild/build time.
 *
 * - iOS:  Creates ar.lproj/InfoPlist.strings with Arabic "ريوماكس"
 * - Android: Creates values-ar/strings.xml with Arabic "ريوماكس"
 *            and ensures values/strings.xml has English "Riomax"
 */

// ─── iOS ──────────────────────────────────────────────────────────────────────

function withLocalizedAppNameIOS(config) {
  // Step 1: Set the default English display name via InfoPlist
  config = withInfoPlist(config, (config) => {
    config.modResults.CFBundleDisplayName = "Riomax";
    config.modResults.CFBundleName = "Riomax";
    return config;
  });

  // Step 2: Create ar.lproj/InfoPlist.strings for Arabic localization
  config = withDangerousMod(config, [
    "ios",
    async (config) => {
      const projectRoot = config.modRequest.platformProjectRoot;

      // Find the .xcodeproj-relative app directory
      // In Expo managed projects, it's typically the project name directory
      const appName = config.name || "Riomax";
      const possiblePaths = [
        path.join(projectRoot, appName),
        path.join(projectRoot, config.slug || "riomax-app"),
        projectRoot,
      ];

      let targetDir = projectRoot;
      for (const p of possiblePaths) {
        if (fs.existsSync(p) && fs.statSync(p).isDirectory()) {
          targetDir = p;
          break;
        }
      }

      // --- English (Base) ---
      const enDir = path.join(targetDir, "en.lproj");
      if (!fs.existsSync(enDir)) {
        fs.mkdirSync(enDir, { recursive: true });
      }
      const enStrings = `/* English localization */
"CFBundleDisplayName" = "Riomax";
"CFBundleName" = "Riomax";
`;
      fs.writeFileSync(path.join(enDir, "InfoPlist.strings"), enStrings, "utf8");

      // --- Arabic ---
      const arDir = path.join(targetDir, "ar.lproj");
      if (!fs.existsSync(arDir)) {
        fs.mkdirSync(arDir, { recursive: true });
      }
      const arStrings = `/* Arabic localization */
"CFBundleDisplayName" = "ريوماكس";
"CFBundleName" = "ريوماكس";
`;
      fs.writeFileSync(path.join(arDir, "InfoPlist.strings"), arStrings, "utf8");

      console.log("✅ iOS: Created en.lproj/InfoPlist.strings (Riomax)");
      console.log("✅ iOS: Created ar.lproj/InfoPlist.strings (ريوماكس)");

      return config;
    },
  ]);

  return config;
}

// ─── Android ──────────────────────────────────────────────────────────────────

function withLocalizedAppNameAndroid(config) {
  config = withDangerousMod(config, [
    "android",
    async (config) => {
      const resDir = path.join(
        config.modRequest.platformProjectRoot,
        "app",
        "src",
        "main",
        "res"
      );

      // --- English (default values) ---
      const valuesDir = path.join(resDir, "values");
      if (!fs.existsSync(valuesDir)) {
        fs.mkdirSync(valuesDir, { recursive: true });
      }

      // Read existing strings.xml to preserve other entries
      const defaultStringsPath = path.join(valuesDir, "strings.xml");
      let defaultContent;

      if (fs.existsSync(defaultStringsPath)) {
        // Read and update app_name in existing file
        defaultContent = fs.readFileSync(defaultStringsPath, "utf8");
        if (defaultContent.includes('name="app_name"')) {
          defaultContent = defaultContent.replace(
            /<string name="app_name">[^<]*<\/string>/,
            '<string name="app_name">Riomax</string>'
          );
        } else {
          // Add app_name before closing </resources>
          defaultContent = defaultContent.replace(
            "</resources>",
            '    <string name="app_name">Riomax</string>\n</resources>'
          );
        }
      } else {
        defaultContent = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Riomax</string>
</resources>
`;
      }
      fs.writeFileSync(defaultStringsPath, defaultContent, "utf8");

      // --- Arabic (values-ar) ---
      const arDir = path.join(resDir, "values-ar");
      if (!fs.existsSync(arDir)) {
        fs.mkdirSync(arDir, { recursive: true });
      }
      const arStrings = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">ريوماكس</string>
</resources>
`;
      fs.writeFileSync(path.join(arDir, "strings.xml"), arStrings, "utf8");

      console.log("✅ Android: Set values/strings.xml app_name = Riomax");
      console.log("✅ Android: Created values-ar/strings.xml app_name = ريوماكس");

      return config;
    },
  ]);

  return config;
}

// ─── Main Plugin ──────────────────────────────────────────────────────────────

function withLocalizedAppName(config) {
  config = withLocalizedAppNameIOS(config);
  config = withLocalizedAppNameAndroid(config);
  return config;
}

module.exports = withLocalizedAppName;
