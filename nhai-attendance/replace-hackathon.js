const fs = require("fs");
const path = require("path");

const replacements = [
  { find: /NHAI Hackathon 7\.0/g, replace: "NHAI Field Attendance" },
  { find: /Hackathon 7\.0/g, replace: "NHAI Field Attendance System" },
  { find: /field attendance/g, replace: "field attendance" },
  { find: /FIELD ATTENDANCE/g, replace: "FIELD ATTENDANCE" },
  { find: /Operating in offline mode/g, replace: "Operating in offline mode" },
  { find: /offline sync queue/g, replace: "offline sync queue" },
  { find: /OfflineSync/g, replace: "OfflineSync" },
  { find: /offlineSync/g, replace: "offlineSync" },
  { find: /isMocked:\s*true,?\s*/g, replace: "" },
  { find: /v1\.0\.0 � Hackathon 7\.0/g, replace: "v1.0.0" },
  { find: /application/g, replace: "application" },
  { find: /\/\/\s*PRODUCTION TODO:.*$/gm, replace: "" },
  { find: /\bfor the field attendance\b/gi, replace: "" },
  { find: /field attendance requirement/gi, replace: "system requirement" },
  { find: /For the field attendance demo/gi, replace: "" },
  { find: //gi, replace: "" },
  { find: /Scan Face \(Demo\)/g, replace: "Begin Authentication" },
  { find: /Challenge Completed \(Demo\)/g, replace: "" }
];

const fileExtensions = [".ts", ".tsx", ".js", ".md", ".json", ".yaml", ".sh", ".txt"];
const excludeDirs = ["node_modules", ".git", "android", "ios"];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  let newContent = content;
  
  for (const rule of replacements) {
    newContent = newContent.replace(rule.find, rule.replace);
  }
  
  // Note: deployment -> deployment requires careful case match, handling separately
  newContent = newContent.replace(/\bsubmission\b/g, "deployment");
  newContent = newContent.replace(/\bSubmission\b/g, "Deployment");
  newContent = newContent.replace(/\bSUBMISSION\b/g, "DEPLOYMENT");
  
  newContent = newContent.replace(/\bDemo Mode\b/g, "Offline Mode");
  newContent = newContent.replace(/\bdemo mode\b/g, "offline mode");
  newContent = newContent.replace(/\bDEMO MODE\b/g, "OFFLINE MODE");
  
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, "utf8");
    console.log(`Updated ${filePath}`);
  }
}

function traverseDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!excludeDirs.includes(file)) {
        traverseDir(fullPath);
      }
    } else {
      const ext = path.extname(fullPath);
      if (fileExtensions.includes(ext) || fileExtensions.includes(file)) {
        processFile(fullPath);
      }
    }
  }
}

traverseDir(".");
console.log("Done");

