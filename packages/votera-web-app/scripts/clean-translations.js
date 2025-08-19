const fs = require('fs');
const path = require('path');
const glob = require('glob');

// 번역 파일 경로
const TRANSLATIONS_DIR = path.join(__dirname, '../src/locales');
const SOURCE_DIR = path.join(__dirname, '../src');

// 사용되는 번역 키를 저장할 Set
const usedKeys = new Set();

// t() 함수 호출에서 번역 키 추출
function extractTranslationKeys(content) {
  // 1. 기본 t() 함수 호출 패턴
  const patterns = [
    // 기본 t() 함수 호출
    /t\(['"]([^'"]+)['"]\)/g,
    // 중첩된 객체 접근
    /t\(['"]([^'"]+\.[^'"]+)['"]\)/g,
    // 템플릿 리터럴 사용
    /t\(`([^`]+)`\)/g,
    // 변수와 함께 사용되는 경우
    /t\(['"]([^'"]+)['"],\s*{[^}]+}\)/g,
    // 중첩된 객체와 변수 사용
    /t\(['"]([^'"]+\.[^'"]+)['"],\s*{[^}]+}\)/g,
    // JSX 내부에서 사용
    /{t\(['"]([^'"]+)['"]\)}/g,
    // JSX 내부에서 중첩 사용
    /{t\(['"]([^'"]+\.[^'"]+)['"]\)}/g,
    // 객체 속성으로 사용
    /['"]label['"]:\s*t\(['"]([^'"]+)['"]\)/g,
    /['"]title['"]:\s*t\(['"]([^'"]+)['"]\)/g,
    /['"]description['"]:\s*t\(['"]([^'"]+)['"]\)/g,
    /['"]helpText['"]:\s*t\(['"]([^'"]+)['"]\)/g,
    /['"]placeholder['"]:\s*t\(['"]([^'"]+)['"]\)/g,
    // 객체 속성에서 중첩 사용
    /['"]label['"]:\s*t\(['"]([^'"]+\.[^'"]+)['"]\)/g,
    /['"]title['"]:\s*t\(['"]([^'"]+\.[^'"]+)['"]\)/g,
    /['"]description['"]:\s*t\(['"]([^'"]+\.[^'"]+)['"]\)/g,
    /['"]helpText['"]:\s*t\(['"]([^'"]+\.[^'"]+)['"]\)/g,
    /['"]placeholder['"]:\s*t\(['"]([^'"]+\.[^'"]+)['"]\)/g,
  ];

  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      usedKeys.add(match[1]);
    }
  });

  // 2. 동적으로 생성되는 키 패턴 검색
  const dynamicPatterns = [
    // t(key) 형태
    /t\(([a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*)*)\)/g,
    // t(`${key}`) 형태
    /t\(`\${([^}`]+)}`\)/g,
  ];

  dynamicPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      // 동적 키를 발견하면 해당 파일의 모든 번역 키를 보존
      const fileKeys = collectAllKeys(
        JSON.parse(
          fs.readFileSync(path.join(TRANSLATIONS_DIR, 'en/common.json'), 'utf8')
        )
      );
      fileKeys.forEach(key => usedKeys.add(key));
      return; // 한 번 발견되면 더 이상 검색할 필요 없음
    }
  });
}

// 소스 코드에서 번역 키 추출
function extractKeysFromSource() {
  const files = glob.sync('**/*.{ts,tsx}', {cwd: SOURCE_DIR});
  files.forEach(file => {
    const content = fs.readFileSync(path.join(SOURCE_DIR, file), 'utf8');
    extractTranslationKeys(content);
  });
}

// 객체의 모든 키 경로를 수집
function collectAllKeys(obj, prefix = '') {
  const keys = new Set();

  function traverse(current, currentPrefix) {
    for (const [key, value] of Object.entries(current)) {
      const fullKey = currentPrefix ? `${currentPrefix}.${key}` : key;
      keys.add(fullKey);

      if (typeof value === 'object' && value !== null) {
        traverse(value, fullKey);
      }
    }
  }

  traverse(obj, prefix);
  return keys;
}

// 번역 파일에서 사용되지 않는 키 제거
function cleanTranslationFile(filePath) {
  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  // 모든 가능한 키 경로 수집
  const allPossibleKeys = collectAllKeys(content);

  // 사용되는 키와 그 상위 경로 모두 수집
  const usedKeyPaths = new Set();
  usedKeys.forEach(key => {
    const parts = key.split('.');
    let currentPath = '';
    parts.forEach(part => {
      currentPath = currentPath ? `${currentPath}.${part}` : part;
      usedKeyPaths.add(currentPath);
    });
  });

  // 사용되지 않는 키 제거
  function cleanObject(obj, currentPath = '') {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = currentPath ? `${currentPath}.${key}` : key;

      if (typeof value === 'object' && value !== null) {
        const cleaned = cleanObject(value, fullKey);
        if (Object.keys(cleaned).length > 0) {
          result[key] = cleaned;
        }
      } else if (usedKeyPaths.has(fullKey)) {
        result[key] = value;
      }
    }
    return result;
  }

  const cleaned = cleanObject(content);

  // 변경사항 로깅
  const originalKeys = collectAllKeys(content);
  const cleanedKeys = collectAllKeys(cleaned);
  const removedKeys = [...originalKeys].filter(key => !cleanedKeys.has(key));

  console.log(`\nRemoved keys from ${path.basename(filePath)}:`);
  removedKeys.forEach(key => console.log(`- ${key}`));

  fs.writeFileSync(filePath, JSON.stringify(cleaned, null, 2));
}

// 메인 실행 함수
function main() {
  // 소스 코드에서 번역 키 추출
  extractKeysFromSource();

  console.log('Found used translation keys:');
  [...usedKeys].sort().forEach(key => console.log(`- ${key}`));

  // 각 언어별 번역 파일 정리
  const locales = fs.readdirSync(TRANSLATIONS_DIR);
  locales.forEach(locale => {
    const commonPath = path.join(TRANSLATIONS_DIR, locale, 'common.json');
    if (fs.existsSync(commonPath)) {
      console.log(`\nCleaning translations for ${locale}...`);
      cleanTranslationFile(commonPath);
    }
  });

  console.log('\nTranslation cleanup completed!');
}

main();
