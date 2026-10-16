import fs from 'fs';
import path from 'path';

// 1. Load catalog
const catalogPath = path.resolve('scratch/nous_catalog.json');
if (!fs.existsSync(catalogPath)) {
  console.error('scratch/nous_catalog.json not found!');
  process.exit(1);
}
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
console.log(`Loaded ${catalog.length} items from nous.vn catalog.`);

// 2. Load our 330 realProducts
const realProductsPath = path.resolve('src/data/realProducts.ts');
let code = fs.readFileSync(realProductsPath, 'utf8');
code = code.replace(/import type.*?;/g, '');
code = code.replace(/export const REAL_PRODUCTS: ProductCatalogItem\[\] =/, 'return');
const realProducts = new Function(code)();
console.log(`Loaded ${realProducts.length} products from ${realProductsPath}`);

// 3. Ensure public/images/products directory exists
const imagesDir = path.resolve('public/images/products');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// 4. Keyword definitions with diacritics
const KEY_NOUNS = [
  'bodysuit', 'body chip', 'body suit', 'liền cộc', 'liền dài',
  'cài lệch', 'cài thẳng', 'cài vai', 'dài tay', 'cộc tay', 'ngắn tay', 'ba lỗ',
  'áo khoác', 'gile', 'gi lê', 'lông', 'chần bông',
  'chăn', 'chăn ủ', 'gối', 'lót đầu', 'thảm', 'chiếu',
  'yếm', 'khăn', 'khăn sữa', 'khăn voan', 'khẩu trang',
  'mũ', 'nón', 'tất', 'bao tay', 'bao chân', 'vớ',
  'váy', 'đầm', 'quần yếm', 'quần dài', 'quần cộc', 'quần đùi',
  'thú nhồi bông', 'gấu bông', 'bình sữa', 'ti ngậm', 'sticker', 'băng đô',
  'noel', 'giáng sinh', 'tết', 'trung thu', 'sơ sinh', 'newborn',
  'petit a petit', 'nu petit', 'warm cotton', 'modal', 'bamboo'
];

function cleanWords(str) {
  if (!str) return [];
  const norm = str.toLowerCase()
    .replace(/[^a-z0-9àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const stopWords = new Set(['cho', 'be', 'trai', 'gai', 'va', 'co', 'size', 'tu', 'den', 'thang', 'nam', 'mau', 'moi', 'cua', 'la', 'cac', 'kem', 'tang', 'sale', 'clearance', 'bán', 'mở', 'bản', 'chính', 'hãng', 'bst']);
  return norm.split(' ').filter(w => w.length > 1 && !stopWords.has(w));
}

// Track image usage for diversity
const imageUsageCount = new Map();

// 5. Match each product
const matchedResults = [];

realProducts.forEach((p, idx) => {
  const pWords = cleanWords(p.name);
  const pNameLower = p.name.toLowerCase();
  const pDescLower = (p.description || '').toLowerCase();
  const pCatLower = (p.category || '').toLowerCase();

  let bestProduct = null;
  let bestImgUrl = null;
  let bestScore = -999;

  for (const c of catalog) {
    if (!c.images || c.images.length === 0) continue;
    const cTitleLower = c.title.toLowerCase();
    const cWords = cleanWords(c.title);

    let score = 0;

    // Check key baby clothing nouns
    for (const noun of KEY_NOUNS) {
      const pHas = pNameLower.includes(noun) || pDescLower.includes(noun);
      const cHas = cTitleLower.includes(noun);
      if (pHas && cHas) {
        score += 25; // Large boost for matching category/style
      } else if (pHas && !cHas && (noun === 'chăn' || noun === 'áo khoác' || noun === 'yếm' || noun === 'bodysuit' || noun === 'khẩu trang' || noun === 'gối')) {
        score -= 15; // Penalty for wrong core item type
      }
    }

    // Category matching boost
    if (pCatLower && cTitleLower.includes(pCatLower)) {
      score += 15;
    }

    // Word token overlaps
    for (const w of pWords) {
      if (w.length > 2 && cWords.includes(w)) {
        score += 4;
      }
    }

    // Collection / Material matching
    if (pNameLower.includes('noel') && cTitleLower.includes('noel')) score += 30;
    if (pNameLower.includes('giáng sinh') && (cTitleLower.includes('giáng sinh') || cTitleLower.includes('noel'))) score += 30;
    if (pNameLower.includes('petit a petit') && cTitleLower.includes('petit')) score += 20;
    if (pNameLower.includes('pickle ball') && cTitleLower.includes('ba lỗ')) score += 15;

    // Diversity penalty: prefer images that haven't been reused too many times
    const candidateImg = c.images[0].src;
    const usage = imageUsageCount.get(candidateImg) || 0;
    score -= usage * 5;

    if (score > bestScore) {
      bestScore = score;
      bestProduct = c;
      bestImgUrl = candidateImg;
    }
  }

  // Fallback to first available image if none matched
  if (!bestImgUrl) {
    bestImgUrl = catalog[idx % catalog.length]?.images[0]?.src || '';
  }

  // Update usage count
  imageUsageCount.set(bestImgUrl, (imageUsageCount.get(bestImgUrl) || 0) + 1);

  matchedResults.push({
    code: p.code,
    name: p.name,
    imgUrl: bestImgUrl,
    matchedTitle: bestProduct ? bestProduct.title : 'Fallback'
  });
});

console.log(`Matched ${matchedResults.length} products with nous.vn images!`);
console.log(`Total unique nous.vn images selected: ${imageUsageCount.size}`);

// 6. Concurrently download images to public/images/products/
async function downloadImage(url, destPath) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        'Referer': 'https://www.nous.vn/'
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (buffer.length < 500) throw new Error('File too small');
    fs.writeFileSync(destPath, buffer);
    return true;
  } catch (err) {
    return false;
  }
}

async function runDownloads() {
  console.log('Downloading images into public/images/products/...');
  const concurrency = 12;
  let completed = 0;
  let successCount = 0;
  const updatedProducts = [...realProducts];

  async function worker(items) {
    for (const item of items) {
      const pIdx = updatedProducts.findIndex(p => p.code === item.code);
      const fileName = `${item.code.toLowerCase()}.jpg`;
      const localFilePath = path.join(imagesDir, fileName);
      const publicPath = `/images/products/${fileName}`;

      let ok = false;
      if (item.imgUrl) {
        ok = await downloadImage(item.imgUrl, localFilePath);
      }

      if (ok) {
        successCount++;
        updatedProducts[pIdx].image = publicPath;
      } else {
        // Fallback to online CDN URL if download failed
        updatedProducts[pIdx].image = item.imgUrl || updatedProducts[pIdx].image;
      }

      completed++;
      if (completed % 30 === 0 || completed === matchedResults.length) {
        console.log(`Progress: ${completed}/${matchedResults.length} (Saved locally: ${successCount})`);
      }
    }
  }

  // Chunk items for concurrency
  const chunks = Array.from({ length: concurrency }, () => []);
  matchedResults.forEach((item, index) => {
    chunks[index % concurrency].push(item);
  });

  await Promise.all(chunks.map(chunk => worker(chunk)));

  console.log(`\nFinished downloading! Successfully saved locally: ${successCount}/${matchedResults.length}`);

  // 7. Write updated REAL_PRODUCTS back to src/data/realProducts.ts
  const outputCode = `import type { ProductCatalogItem } from '../types';

export const REAL_PRODUCTS: ProductCatalogItem[] = ${JSON.stringify(updatedProducts, null, 2)};
`;

  fs.writeFileSync(realProductsPath, outputCode, 'utf8');
  console.log(`Updated ${realProductsPath} with real nous.vn image paths!`);
}

runDownloads();
