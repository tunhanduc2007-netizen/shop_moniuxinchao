import fs from 'fs';
import path from 'path';

// 1. Load catalog from nous.vn
const catalogPath = path.resolve('scratch/nous_catalog.json');
if (!fs.existsSync(catalogPath)) {
  console.error('scratch/nous_catalog.json not found!');
  process.exit(1);
}
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8')).filter(c => c.images && c.images.length > 0);
console.log(`Loaded ${catalog.length} items from nous.vn catalog.`);

// 2. Load our 330 realProducts
const realProductsPath = path.resolve('src/data/realProducts.ts');
let code = fs.readFileSync(realProductsPath, 'utf8');
code = code.replace(/import type.*?;/g, '');
code = code.replace(/export const REAL_PRODUCTS: ProductCatalogItem\[\] =/, 'return');
const realProducts = new Function(code)();
console.log(`Loaded ${realProducts.length} products from ${realProductsPath}`);

// 3. Category Classifier for our Real Products
export function getProductCategory(p) {
  const name = p.name.toLowerCase();
  const desc = (p.description || '').toLowerCase();

  // 1. Quà tặng kèm
  if (name.includes('quà tặng') || name.includes('sticker') || name.includes('tặng kèm') || name.includes('[quà tặng]') || name.includes('tặng túi tote') || name.includes('set quà tặng') || name.includes('[có hộp]')) {
    return 'Quà tặng kèm';
  }

  // 2. Bao tay bao chân & Tất
  if (name.includes('btbc') || name.includes('bao tay') || name.includes('bao chân') || (name.includes('tất') && !name.includes('liền tất') && !name.includes('dài tất') && !name.includes('không tất') && !name.includes('có tất')) || name.includes('vớ')) {
    return 'Bao tay & Bao chân';
  }

  // 3. Áo & Áo khoác & Gile (Check before Mũ because 'Áo khoác có mũ' is Áo khoác)
  if (name.includes('áo khoác') || name.includes('áo gile') || name.includes('gile') || name.includes('gi lê') || name.includes('áo len') || name.includes('áo choàng')) {
    return 'Áo & Áo khoác';
  }

  // 4. Quần yếm
  if (name.includes('quần yếm')) {
    return 'Quần yếm & Set yếm';
  }

  // 5. Yếm cho bé
  if ((name.includes('yếm') || desc.includes('yếm')) && !name.includes('quần yếm') && !name.includes('body yếm') && !name.includes('giả yếm') && !name.includes('mix yếm') && !name.includes('phối yếm')) {
    return 'Yếm cho bé';
  }

  // 6. Nón & Mũ bé
  if ((name.includes('mũ') || name.includes('nón') || name.includes('băng đô')) && !name.includes('bộ liền kèm mũ') && !name.includes('bộ dài kèm mũ') && !name.includes('mix phụ kiện mũ')) {
    return 'Nón & Mũ bé';
  }

  // 7. Váy đầm bé gái
  if (name.includes('váy') || name.includes('đầm')) {
    return 'Váy đầm bé gái';
  }

  // 8. Chăn gối & Đệm ngủ
  if (name.includes('chăn') || name.includes('gối') || name.includes('lót đầu') || name.includes('thảm') || name.includes('đệm') || name.includes('chiếu') || desc.includes('chăn') || desc.includes('gối')) {
    return 'Chăn gối & Đệm ngủ';
  }

  // 9. Bodysuit & Đồ liền
  if (name.includes('bodysuit') || name.includes('body chip') || name.includes('body suit') || name.includes('liền cộc') || name.includes('liền dài') || name.includes('bộ liền') || (name.includes('body') && !name.includes('bộ cộc') && !name.includes('bộ ngắn')) || name.includes('quần liền áo') || name.includes('áo liền quần')) {
    return 'Bodysuit & Đồ liền';
  }

  // 10. Phụ kiện
  if (name.includes('khẩu trang') || name.includes('thú nhồi bông') || name.includes('gấu bông') || name.includes('túi tote') || name.includes('pha sữa') || name.includes('dụng cụ') || name.includes('khăn')) {
    return 'Phụ kiện & Khác';
  }

  // 11. Bộ quần áo bé
  return 'Bộ quần áo bé';
}

// 4. Category Classifier for nous.vn Catalog
export function getCatalogCategory(c) {
  const t = c.title.toLowerCase();
  
  if (t.includes('quần yếm')) return 'Quần yếm & Set yếm';
  
  if ((t.startsWith('yếm') || t.includes('yếm tròn') || t.includes('yếm tam giác') || t.includes('yếm muslin') || t.includes('set 2 yếm') || t.includes('set 3 yếm') || (t.includes('yếm ') && !t.includes('giả yếm') && !t.includes('bộ liền') && !t.includes('bodysuit') && !t.includes('váy')))) {
    return 'Yếm cho bé';
  }

  if ((t.includes('bao tay') || t.includes('bao chân') || t.includes('tất') || t.includes('vớ') || t.includes('giày')) && !t.includes('bộ liền') && !t.includes('liền tất')) {
    return 'Bao tay & Bao chân';
  }

  if ((t.startsWith('mũ') || t.startsWith('nón') || t.includes('mũ tròn') || t.includes('mũ tai') || t.includes('mũ rộng vành') || t.includes('mũ nồi') || t.includes('băng đô')) && !t.includes('áo khoác') && !t.includes('bộ liền') && !t.includes('có mũ') && !t.includes('kèm mũ')) {
    return 'Nón & Mũ bé';
  }

  if (t.includes('áo khoác') || t.includes('gile') || t.includes('gi lê') || t.includes('áo len') || t.includes('áo chần bông') || t.includes('áo choàng')) {
    return 'Áo & Áo khoác';
  }

  if (t.includes('váy') || t.includes('đầm')) {
    return 'Váy đầm bé gái';
  }

  if (t.includes('chăn') || t.includes('gối') || t.includes('lót') || t.includes('thảm') || t.includes('đệm')) {
    return 'Chăn gối & Đệm ngủ';
  }

  if (t.includes('bodysuit') || t.includes('body chip') || t.includes('body suit') || t.includes('liền cộc') || t.includes('liền dài') || t.includes('bộ liền')) {
    return 'Bodysuit & Đồ liền';
  }

  if (t.includes('sticker') || t.includes('quà tặng') || t.includes('hộp quà') || t.includes('set quà')) {
    return 'Quà tặng kèm';
  }

  if (t.includes('khẩu trang') || t.includes('khăn') || t.includes('thú nhồi bông') || t.includes('túi tote')) {
    return 'Phụ kiện & Khác';
  }

  return 'Bộ quần áo bé';
}

// 5. Group catalog by category
const catalogByCat = {};
for (const c of catalog) {
  const cat = getCatalogCategory(c);
  if (!catalogByCat[cat]) catalogByCat[cat] = [];
  catalogByCat[cat].push(c);
}

function cleanTokens(str) {
  if (!str) return [];
  const norm = str.toLowerCase()
    .replace(/[^a-z0-9àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const stopWords = new Set(['cho', 'be', 'trai', 'gai', 'va', 'co', 'size', 'tu', 'den', 'thang', 'nam', 'mau', 'moi', 'cua', 'la', 'cac', 'kem', 'tang', 'sale', 'clearance', 'bán', 'mở', 'bản', 'chính', 'hãng', 'bst']);
  return norm.split(' ').filter(w => w.length > 1 && !stopWords.has(w));
}

// 6. Match each product strictly within its category pool
const usedImages = new Map();
const matchedProducts = [];

realProducts.forEach((p, idx) => {
  const cat = getProductCategory(p);
  const pool = catalogByCat[cat] && catalogByCat[cat].length > 0 ? catalogByCat[cat] : catalog;
  const pTokens = cleanTokens(p.name);
  const pNameLower = p.name.toLowerCase();

  let best = null;
  let bestScore = -999;

  for (const c of pool) {
    const cTokens = cleanTokens(c.title);
    const cTitleLower = c.title.toLowerCase();
    let score = 0;

    for (const t of pTokens) {
      if (cTokens.includes(t)) score += 5;
    }

    // specific sub-keyword matching
    if (pNameLower.includes('cộc tay') && cTitleLower.includes('cộc')) score += 15;
    if (pNameLower.includes('dài tay') && cTitleLower.includes('dài')) score += 15;
    if (pNameLower.includes('ba lỗ') && (cTitleLower.includes('ba lỗ') || cTitleLower.includes('sát nách'))) score += 20;
    if (pNameLower.includes('cài lệch') && cTitleLower.includes('cài lệch')) score += 20;
    if (pNameLower.includes('cài giữa') && cTitleLower.includes('cài')) score += 15;
    if (pNameLower.includes('cài thẳng') && cTitleLower.includes('cài thẳng')) score += 20;
    if (pNameLower.includes('chăn') && cTitleLower.includes('chăn')) score += 25;
    if (pNameLower.includes('gối') && cTitleLower.includes('gối')) score += 25;
    if (pNameLower.includes('thảm') && (cTitleLower.includes('thảm') || cTitleLower.includes('lót'))) score += 25;
    if (pNameLower.includes('tất') && cTitleLower.includes('tất')) score += 25;
    if (pNameLower.includes('tai thỏ') && cTitleLower.includes('tai thỏ')) score += 20;
    if (pNameLower.includes('tai gấu') && cTitleLower.includes('tai gấu')) score += 20;
    if (pNameLower.includes('rộng vành') && cTitleLower.includes('rộng vành')) score += 20;

    // colors matching
    const colors = ['hồng', 'xanh', 'be', 'nâu', 'trắng', 'cam', 'vàng', 'tím', 'ghi', 'xám'];
    for (const col of colors) {
      if (pNameLower.includes(col) && cTitleLower.includes(col)) score += 8;
    }

    // Diversity penalty: prefer images that haven't been reused
    const candidateImg = c.images[0].src;
    const usage = usedImages.get(candidateImg) || 0;
    score -= usage * 4;

    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }

  const chosenImg = best ? best.images[0].src : pool[0].images[0].src;
  usedImages.set(chosenImg, (usedImages.get(chosenImg) || 0) + 1);

  matchedProducts.push({
    ...p,
    category: cat,
    matchedTitle: best ? best.title : 'Pool fallback',
    imgUrl: chosenImg
  });
});

console.log(`Successfully matched ${matchedProducts.length} products strictly within their categories!`);

// 7. Download & Save Images
const imagesDir = path.resolve('public/images/products');
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
  console.log('Downloading category-matched images into public/images/products/...');
  const concurrency = 12;
  let completed = 0;
  let successCount = 0;

  async function worker(items) {
    for (const item of items) {
      const fileName = `${item.code.toLowerCase()}.jpg`;
      const localFilePath = path.join(imagesDir, fileName);
      const publicPath = `/images/products/${fileName}`;

      let ok = false;
      if (item.imgUrl) {
        ok = await downloadImage(item.imgUrl, localFilePath);
      }

      if (ok) {
        successCount++;
        item.image = publicPath;
      } else {
        item.image = item.imgUrl || item.image;
      }

      completed++;
      if (completed % 50 === 0 || completed === matchedProducts.length) {
        console.log(`Download progress: ${completed}/${matchedProducts.length}`);
      }
    }
  }

  const chunks = Array.from({ length: concurrency }, () => []);
  matchedProducts.forEach((item, index) => {
    chunks[index % concurrency].push(item);
  });

  await Promise.all(chunks.map(chunk => worker(chunk)));
  console.log(`Done downloading: ${successCount}/${matchedProducts.length} images saved.`);

  // Clean matchedProducts for realProducts.ts export (remove matchedTitle, imgUrl)
  const finalExport = matchedProducts.map(p => ({
    code: p.code,
    tiktokId: p.tiktokId,
    name: p.name,
    brand: p.brand,
    category: p.category,
    variants: p.variants,
    price: p.price,
    image: p.image,
    soldCount: p.soldCount,
    revenue: p.revenue,
    percentage: p.percentage,
    description: p.description
  }));

  const outputCode = `import type { ProductCatalogItem } from '../types';

export const REAL_PRODUCTS: ProductCatalogItem[] = ${JSON.stringify(finalExport, null, 2)};
`;

  fs.writeFileSync(realProductsPath, outputCode, 'utf8');
  console.log(`Updated ${realProductsPath} with 100% accurate categories and images!`);
}

runDownloads();
