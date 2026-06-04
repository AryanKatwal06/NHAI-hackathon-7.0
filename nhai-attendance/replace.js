const fs = require('fs');
const path = require('path');

const files = [
  'src/services/BenchmarkService.ts',
  'src/ml/README.md',
  'src/ml/faceRecognition/faceAlignment.ts',
  'src/ml/faceRecognition/embeddingUtils.ts',
  'src/screens/SettingsScreen/SettingsScreen.tsx',
  'src/constants/face.constants.ts',
  'src/ml/faceRecognition/README.md',
  'src/assets/README.md',
  'src/assets/models/README.md',
];

for (const file of files) {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/MobileFaceNet/g, 'FaceNet');
    content = content.replace(/mobilefacenet/g, 'facenet');
    fs.writeFileSync(filePath, content);
    console.log('Updated ' + file);
  }
}
