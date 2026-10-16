import vnUnitsData from '../data/vn-address/vn_units.json';

export interface AddressSuggestion {
  fullAddress: string;
  street?: string;
  ward?: string;
  district?: string;
  province: string;
  postalCode?: string;
}

/**
 * Bỏ dấu tiếng Việt và chuẩn hóa để tìm kiếm không dấu
 */
export function removeVietnameseAccents(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

/**
 * Danh sách các tuyến đường và quận/huyện phổ biến tại các đô thị lớn của Việt Nam
 * Kết hợp cùng bộ dữ liệu đơn vị hành chính thanglequoc/vietnamese-provinces-database
 */
export const POPULAR_VIETNAM_STREETS: Array<{
  street: string;
  ward: string;
  district: string;
  province: string;
}> = [
  // --- HÀ NỘI ---
  { street: 'Đường Nguyễn Trãi', ward: 'Phường Thượng Đình', district: 'Quận Thanh Xuân', province: 'Thành phố Hà Nội' },
  { street: 'Đường Nguyễn Trãi', ward: 'Phường Văn Quán', district: 'Quận Hà Đông', province: 'Thành phố Hà Nội' },
  { street: 'Đường Cầu Giấy', ward: 'Phường Dịch Vọng', district: 'Quận Cầu Giấy', province: 'Thành phố Hà Nội' },
  { street: 'Đường Cầu Giấy', ward: 'Phường Quan Hoa', district: 'Quận Cầu Giấy', province: 'Thành phố Hà Nội' },
  { street: 'Đường Xuân Thủy', ward: 'Phường Dịch Vọng Hậu', district: 'Quận Cầu Giấy', province: 'Thành phố Hà Nội' },
  { street: 'Đường Duy Tân', ward: 'Phường Dịch Vọng Hậu', district: 'Quận Cầu Giấy', province: 'Thành phố Hà Nội' },
  { street: 'Đường Trần Duy Hưng', ward: 'Phường Trung Hòa', district: 'Quận Cầu Giấy', province: 'Thành phố Hà Nội' },
  { street: 'Đường Hoàng Đạo Thúy', ward: 'Phường Nhân Chính', district: 'Quận Thanh Xuân', province: 'Thành phố Hà Nội' },
  { street: 'Đường Lê Văn Lương', ward: 'Phường Nhân Chính', district: 'Quận Thanh Xuân', province: 'Thành phố Hà Nội' },
  { street: 'Đường Khuất Duy Tiến', ward: 'Phường Thanh Xuân Bắc', district: 'Quận Thanh Xuân', province: 'Thành phố Hà Nội' },
  { street: 'Đường Kim Mã', ward: 'Phường Kim Mã', district: 'Quận Ba Đình', province: 'Thành phố Hà Nội' },
  { street: 'Đường Liễu Giai', ward: 'Phường Liễu Giai', district: 'Quận Ba Đình', province: 'Thành phố Hà Nội' },
  { street: 'Đường Đội Cấn', ward: 'Phường Đội Cấn', district: 'Quận Ba Đình', province: 'Thành phố Hà Nội' },
  { street: 'Đường Hoàng Hoa Thám', ward: 'Phường Thụy Khuê', district: 'Quận Tây Hồ', province: 'Thành phố Hà Nội' },
  { street: 'Đường Lạc Long Quân', ward: 'Phường Nhật Tân', district: 'Quận Tây Hồ', province: 'Thành phố Hà Nội' },
  { street: 'Đường Thụy Khuê', ward: 'Phường Bưởi', district: 'Quận Tây Hồ', province: 'Thành phố Hà Nội' },
  { street: 'Phố Tràng Tiền', ward: 'Phường Tràng Tiền', district: 'Quận Hoàn Kiếm', province: 'Thành phố Hà Nội' },
  { street: 'Phố Hàng Gai', ward: 'Phường Hàng Gai', district: 'Quận Hoàn Kiếm', province: 'Thành phố Hà Nội' },
  { street: 'Phố Hàng Buồm', ward: 'Phường Hàng Buồm', district: 'Quận Hoàn Kiếm', province: 'Thành phố Hà Nội' },
  { street: 'Phố Bà Triệu', ward: 'Phường Hàng Bài', district: 'Quận Hoàn Kiếm', province: 'Thành phố Hà Nội' },
  { street: 'Phố Huế', ward: 'Phường Phố Huế', district: 'Quận Hai Bà Trưng', province: 'Thành phố Hà Nội' },
  { street: 'Đường Bạch Mai', ward: 'Phường Bạch Mai', district: 'Quận Hai Bà Trưng', province: 'Thành phố Hà Nội' },
  { street: 'Đường Đại Cồ Việt', ward: 'Phường Lê Đại Hành', district: 'Quận Hai Bà Trưng', province: 'Thành phố Hà Nội' },
  { street: 'Đường Minh Khai', ward: 'Phường Vĩnh Tuy', district: 'Quận Hai Bà Trưng', province: 'Thành phố Hà Nội' },
  { street: 'Đường Giải Phóng', ward: 'Phường Giáp Bát', district: 'Quận Hoàng Mai', province: 'Thành phố Hà Nội' },
  { street: 'Đường Tam Trinh', ward: 'Phường Mai Động', district: 'Quận Hoàng Mai', province: 'Thành phố Hà Nội' },
  { street: 'Đường Lĩnh Nam', ward: 'Phường Lĩnh Nam', district: 'Quận Hoàng Mai', province: 'Thành phố Hà Nội' },
  { street: 'Đường Tây Sơn', ward: 'Phường Quang Trung', district: 'Quận Đống Đa', province: 'Thành phố Hà Nội' },
  { street: 'Đường Chùa Bộc', ward: 'Phường Quang Trung', district: 'Quận Đống Đa', province: 'Thành phố Hà Nội' },
  { street: 'Đường Thái Hà', ward: 'Phường Trung Liệt', district: 'Quận Đống Đa', province: 'Thành phố Hà Nội' },
  { street: 'Đường Xã Đàn', ward: 'Phường Nam Đồng', district: 'Quận Đống Đa', province: 'Thành phố Hà Nội' },
  { street: 'Đường Tôn Đức Thắng', ward: 'Phường Hàng Bột', district: 'Quận Đống Đa', province: 'Thành phố Hà Nội' },
  { street: 'Đường Phạm Hùng', ward: 'Phường Mễ Trì', district: 'Quận Nam Từ Liêm', province: 'Thành phố Hà Nội' },
  { street: 'Đường Hồ Tùng Mậu', ward: 'Phường Mai Dịch', district: 'Quận Cầu Giấy', province: 'Thành phố Hà Nội' },
  { street: 'Đường Nguyễn Hoàng', ward: 'Phường Mỹ Đình 2', district: 'Quận Nam Từ Liêm', province: 'Thành phố Hà Nội' },
  { street: 'Đường Lê Đức Thọ', ward: 'Phường Mỹ Đình 1', district: 'Quận Nam Từ Liêm', province: 'Thành phố Hà Nội' },
  { street: 'Đường Quang Trung', ward: 'Phường Quang Trung', district: 'Quận Hà Đông', province: 'Thành phố Hà Nội' },
  { street: 'Đường Tố Hữu', ward: 'Phường Vạn Phúc', district: 'Quận Hà Đông', province: 'Thành phố Hà Nội' },
  { street: 'Đường Nguyễn Văn Cừ', ward: 'Phường Bồ Đề', district: 'Quận Long Biên', province: 'Thành phố Hà Nội' },
  { street: 'Đường Ngô Gia Tự', ward: 'Phường Đức Giang', district: 'Quận Long Biên', province: 'Thành phố Hà Nội' },

  // --- TP. HỒ CHÍ MINH ---
  { street: 'Đường Nguyễn Huệ', ward: 'Phường Bến Nghé', district: 'Quận 1', province: 'Thành phố Hồ Chí Minh' },
  { street: 'Đường Đồng Khởi', ward: 'Phường Bến Nghé', district: 'Quận 1', province: 'Thành phố Hồ Chí Minh' },
  { street: 'Đường Lê Lợi', ward: 'Phường Bến Thành', district: 'Quận 1', province: 'Thành phố Hồ Chí Minh' },
  { street: 'Đường Nguyễn Trãi', ward: 'Phường Bến Thành', district: 'Quận 1', province: 'Thành phố Hồ Chí Minh' },
  { street: 'Đường Nguyễn Trãi', ward: 'Phường 3', district: 'Quận 5', province: 'Thành phố Hồ Chí Minh' },
  { street: 'Đường Trần Hưng Đạo', ward: 'Phường Cầu Ông Lãnh', district: 'Quận 1', province: 'Thành phố Hồ Chí Minh' },
  { street: 'Đường Trần Hưng Đạo', ward: 'Phường 7', district: 'Quận 5', province: 'Thành phố Hồ Chí Minh' },
  { street: 'Đường Nguyễn Thị Minh Khai', ward: 'Phường Đa Kao', district: 'Quận 1', province: 'Thành phố Hồ Chí Minh' },
  { street: 'Đường Nguyễn Thị Minh Khai', ward: 'Phường 5', district: 'Quận 3', province: 'Thành phố Hồ Chí Minh' },
  { street: 'Đường Điện Biên Phủ', ward: 'Phường 15', district: 'Quận Bình Thạnh', province: 'Thành phố Hồ Chí Minh' },
  { street: 'Đường Điện Biên Phủ', ward: 'Phường 3', district: 'Quận 3', province: 'Thành phố Hồ Chí Minh' },
  { street: 'Đường Võ Thị Sáu', ward: 'Phường Võ Thị Sáu', district: 'Quận 3', province: 'Thành phố Hồ Chí Minh' },
  { street: 'Đường Cách Mạng Tháng 8', ward: 'Phường Bến Thành', district: 'Quận 1', province: 'Thành phố Hồ Chí Minh' },
  { street: 'Đường Cách Mạng Tháng 8', ward: 'Phường 11', district: 'Quận 3', province: 'Thành phố Hồ Chí Minh' },
  { street: 'Đường Cách Mạng Tháng 8', ward: 'Phường 7', district: 'Quận Tân Bình', province: 'Thành phố Hồ Chí Minh' },
  { street: 'Đường Ba Tháng Hai', ward: 'Phường 11', district: 'Quận 10', province: 'Thành phố Hồ Chí Minh' },
  { street: 'Đường Ba Tháng Hai', ward: 'Phường 16', district: 'Quận 11', province: 'Thành phố Hồ Chí Minh' },
  { street: 'Đường Lý Thường Kiệt', ward: 'Phường 14', district: 'Quận 10', province: 'Thành phố Hồ Chí Minh' },
  { street: 'Đường Sư Vạn Hạnh', ward: 'Phường 12', district: 'Quận 10', province: 'Thành phố Hồ Chí Minh' },
  { street: 'Đường Lê Văn Sỹ', ward: 'Phường 13', district: 'Quận 3', province: 'Thành phố Hồ Chí Minh' },
  { street: 'Đường Lê Văn Sỹ', ward: 'Phường 1', district: 'Quận Tân Bình', province: 'Thành phố Hồ Chí Minh' },
  { street: 'Đường Cộng Hòa', ward: 'Phường 13', district: 'Quận Tân Bình', province: 'Thành phố Hồ Chí Minh' },
  { street: 'Đường Trường Chinh', ward: 'Phường 14', district: 'Quận Tân Bình', province: 'Thành phố Hồ Chí Minh' },
  { street: 'Đường Quang Trung', ward: 'Phường 10', district: 'Quận Gò Vấp', province: 'Thành phố Hồ Chí Minh' },
  { street: 'Đường Phan Văn Trị', ward: 'Phường 7', district: 'Quận Gò Vấp', province: 'Thành phố Hồ Chí Minh' },
  { street: 'Đường Nguyễn Oanh', ward: 'Phường 17', district: 'Quận Gò Vấp', province: 'Thành phố Hồ Chí Minh' },
  { street: 'Đường Phan Xích Long', ward: 'Phường 2', district: 'Quận Phú Nhuận', province: 'Thành phố Hồ Chí Minh' },
  { street: 'Đường Phan Đăng Lưu', ward: 'Phường 1', district: 'Quận Phú Nhuận', province: 'Thành phố Hồ Chí Minh' },
  { street: 'Đường Xô Viết Nghệ Tĩnh', ward: 'Phường 21', district: 'Quận Bình Thạnh', province: 'Thành phố Hồ Chí Minh' },
  { street: 'Đường Bạch Đằng', ward: 'Phường 24', district: 'Quận Bình Thạnh', province: 'Thành phố Hồ Chí Minh' },
  { street: 'Đường Nguyễn Hữu Cảnh', ward: 'Phường 22', district: 'Quận Bình Thạnh', province: 'Thành phố Hồ Chí Minh' },
  { street: 'Đường Phạm Văn Đồng', ward: 'Phường Hiệp Bình Chánh', district: 'TP. Thủ Đức', province: 'Thành phố Hồ Chí Minh' },
  { street: 'Đường Võ Văn Ngân', ward: 'Phường Linh Chiểu', district: 'TP. Thủ Đức', province: 'Thành phố Hồ Chí Minh' },
  { street: 'Đường Đỗ Xuân Hợp', ward: 'Phường Phước Long B', district: 'TP. Thủ Đức', province: 'Thành phố Hồ Chí Minh' },
  { street: 'Đường Nguyễn Thị Thập', ward: 'Phường Tân Phú', district: 'Quận 7', province: 'Thành phố Hồ Chí Minh' },
  { street: 'Đường Huỳnh Tấn Phát', ward: 'Phường Tân Thuận Đông', district: 'Quận 7', province: 'Thành phố Hồ Chí Minh' },
  { street: 'Đường Nguyễn Văn Linh', ward: 'Phường Tân Phong', district: 'Quận 7', province: 'Thành phố Hồ Chí Minh' },
  { street: 'Đường Tên Lửa', ward: 'Phường Bình Trị Đông B', district: 'Quận Bình Tân', province: 'Thành phố Hồ Chí Minh' },
  { street: 'Đường Kinh Dương Vương', ward: 'Phường An Lạc', district: 'Quận Bình Tân', province: 'Thành phố Hồ Chí Minh' },

  // --- ĐÀ NẴNG ---
  { street: 'Đường Bạch Đằng', ward: 'Phường Hải Châu 1', district: 'Quận Hải Châu', province: 'Thành phố Đà Nẵng' },
  { street: 'Đường Trần Phú', ward: 'Phường Hải Châu 1', district: 'Quận Hải Châu', province: 'Thành phố Đà Nẵng' },
  { street: 'Đường Lê Duẩn', ward: 'Phường Thạch Thang', district: 'Quận Hải Châu', province: 'Thành phố Đà Nẵng' },
  { street: 'Đường Nguyễn Văn Linh', ward: 'Phường Nam Dương', district: 'Quận Hải Châu', province: 'Thành phố Đà Nẵng' },
  { street: 'Đường Hùng Vương', ward: 'Phường Vĩnh Trung', district: 'Quận Thanh Khê', province: 'Thành phố Đà Nẵng' },
  { street: 'Đường Võ Nguyên Giáp', ward: 'Phường Phước Mỹ', district: 'Quận Sơn Trà', province: 'Thành phố Đà Nẵng' },
  { street: 'Đường Ngô Quyền', ward: 'Phường An Hải Bắc', district: 'Quận Sơn Trà', province: 'Thành phố Đà Nẵng' },

  // --- HẢI PHÒNG ---
  { street: 'Đường Lạch Tray', ward: 'Phường Lạch Tray', district: 'Quận Ngô Quyền', province: 'Thành phố Hải Phòng' },
  { street: 'Đường Lê Hồng Phong', ward: 'Phường Đông Khê', district: 'Quận Ngô Quyền', province: 'Thành phố Hải Phòng' },
  { street: 'Đường Cầu Đất', ward: 'Phường Cầu Đất', district: 'Quận Ngô Quyền', province: 'Thành phố Hải Phòng' },
  { street: 'Đường Tô Hiệu', ward: 'Phường Trại Cau', district: 'Quận Lê Chân', province: 'Thành phố Hải Phòng' },

  // --- CẦN THƠ ---
  { street: 'Đường 30 Tháng 4', ward: 'Phường Xuân Khánh', district: 'Quận Ninh Kiều', province: 'Thành phố Cần Thơ' },
  { street: 'Đường Đại Lộ Hòa Bình', ward: 'Phường Tân An', district: 'Quận Ninh Kiều', province: 'Thành phố Cần Thơ' },
  { street: 'Đường Nguyễn Văn Cừ', ward: 'Phường An Khánh', district: 'Quận Ninh Kiều', province: 'Thành phố Cần Thơ' },
  { street: 'Đường Mậu Thân', ward: 'Phường An Hòa', district: 'Quận Ninh Kiều', province: 'Thành phố Cần Thơ' },

  // --- BÌNH DƯƠNG ---
  { street: 'Đường Đại Lộ Bình Dương', ward: 'Phường Phú Hòa', district: 'TP. Thủ Dầu Một', province: 'Tỉnh Bình Dương' },
  { street: 'Đường Yersin', ward: 'Phường Hiệp Thành', district: 'TP. Thủ Dầu Một', province: 'Tỉnh Bình Dương' },
  { street: 'Đường Cách Mạng Tháng 8', ward: 'Phường Lái Thiêu', district: 'TP. Thuận An', province: 'Tỉnh Bình Dương' },
  { street: 'Đường ĐT743', ward: 'Phường An Phú', district: 'TP. Thuận An', province: 'Tỉnh Bình Dương' },

  // --- ĐỒNG NAI ---
  { street: 'Đường Phạm Văn Thuận', ward: 'Phường Tam Hiệp', district: 'TP. Biên Hòa', province: 'Thành phố Đồng Nai' },
  { street: 'Đường Nguyễn Ái Quốc', ward: 'Phường Hố Nai', district: 'TP. Biên Hòa', province: 'Thành phố Đồng Nai' },
  { street: 'Đường Đồng Khởi', ward: 'Phường Trảng Dài', district: 'TP. Biên Hòa', province: 'Thành phố Đồng Nai' },
];

/**
 * Danh sách Tỉnh / Thành phố rút gọn từ vietnamese-provinces-database
 */
export const POPULAR_PROVINCES = [
  'Hà Nội',
  'TP. Hồ Chí Minh',
  'Đà Nẵng',
  'Hải Phòng',
  'Cần Thơ',
  'Bình Dương',
  'Đồng Nai',
  'Quảng Ninh',
  'Bắc Ninh',
  'Nghệ An',
  'Thanh Hóa',
  'Khánh Hòa',
  'Lâm Đồng',
  'Huế',
  'An Giang',
];

/**
 * Trích xuất số nhà / ngõ ngách đầu chuỗi (ví dụ: "Số 12", "12A", "Ngõ 45 nhà 3")
 */
function extractHouseNumber(input: string): { houseNumber: string; searchKeywords: string } {
  const trimmed = input.trim();
  // Regex tìm tiền tố số nhà / ngõ / hẻm / số
  const match = trimmed.match(/^((?:số|so|nhà|nha|ngõ|ngo|ngách|ngach|hẻm|hem|địa chỉ|dia chi)?\s*[\d\/\-]+[a-zA-Z]?(?:\s*(?:ngõ|ngo|ngách|ngach|hẻm|hem)\s*[\d\/\-]+)?)\s*,?\s*(.*)$/i);

  if (match && match[1]) {
    return {
      houseNumber: match[1].trim(),
      searchKeywords: match[2].trim(),
    };
  }

  return {
    houseNumber: '',
    searchKeywords: trimmed,
  };
}

/**
 * Thuật toán tìm kiếm gợi ý địa chỉ thông minh
 * Dựa trên vietnamese-provinces-database và danh mục đường phố
 */
export function searchAddressSuggestions(query: string, maxResults = 6): AddressSuggestion[] {
  if (!query || query.trim().length < 2) return [];

  const { houseNumber, searchKeywords } = extractHouseNumber(query);
  const targetQuery = searchKeywords || query.trim();
  const normalizedQuery = removeVietnameseAccents(targetQuery);

  if (!normalizedQuery || normalizedQuery.length < 2) return [];

  const results: AddressSuggestion[] = [];
  const seenAddresses = new Set<string>();

  // 1. Tìm trong Danh mục Tuyến đường & Phường Quận (Độ chính xác cao nhất)
  for (const item of POPULAR_VIETNAM_STREETS) {
    const normStreet = removeVietnameseAccents(item.street);
    const normWard = removeVietnameseAccents(item.ward);
    const normDistrict = removeVietnameseAccents(item.district);
    const normProvince = removeVietnameseAccents(item.province);

    const matchesStreet = normStreet.includes(normalizedQuery);
    const matchesWard = normWard.includes(normalizedQuery);
    const matchesDistrict = normDistrict.includes(normalizedQuery);
    const matchesCombined = `${normStreet} ${normWard} ${normDistrict} ${normProvince}`.includes(normalizedQuery);

    if (matchesStreet || matchesWard || matchesDistrict || matchesCombined) {
      const full = houseNumber
        ? `${houseNumber} ${item.street}, ${item.ward}, ${item.district}, ${item.province}`
        : `${item.street}, ${item.ward}, ${item.district}, ${item.province}`;

      if (!seenAddresses.has(full)) {
        seenAddresses.add(full);
        results.push({
          fullAddress: full,
          street: item.street,
          ward: item.ward,
          district: item.district,
          province: item.province,
        });
        if (results.length >= maxResults) return results;
      }
    }
  }

  // 2. Tìm trong cơ sở dữ liệu vn_units.json của vietnamese-provinces-database
  if (Array.isArray(vnUnitsData)) {
    for (const prov of vnUnitsData as any[]) {
      const normProv = removeVietnameseAccents(prov.FullName);

      if (Array.isArray(prov.Wards)) {
        for (const ward of prov.Wards) {
          const normWard = removeVietnameseAccents(ward.FullName);
          const combined = `${normWard} ${normProv}`;

          if (normWard.includes(normalizedQuery) || combined.includes(normalizedQuery)) {
            const full = houseNumber
              ? `${houseNumber}, ${ward.FullName}, ${prov.FullName}`
              : `${ward.FullName}, ${prov.FullName}`;

            if (!seenAddresses.has(full)) {
              seenAddresses.add(full);
              results.push({
                fullAddress: full,
                ward: ward.FullName,
                province: prov.FullName,
                postalCode: ward.PostalCode,
              });
              if (results.length >= maxResults) return results;
            }
          }
        }
      }

      // Khớp theo tên tỉnh thành
      if (normProv.includes(normalizedQuery)) {
        const full = houseNumber ? `${houseNumber}, ${prov.FullName}` : prov.FullName;
        if (!seenAddresses.has(full)) {
          seenAddresses.add(full);
          results.push({
            fullAddress: full,
            province: prov.FullName,
          });
          if (results.length >= maxResults) return results;
        }
      }
    }
  }

  return results;
}
