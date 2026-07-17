function pick<T>(values: T[], seed: string, offset = 0) {
  const hash = [...seed].reduce((value, character) => (value * 31 + character.charCodeAt(0)) >>> 0, offset);
  return values[hash % values.length];
}

export function generateContentDefaults(title: string, category?: string, location?: string) {
  const subject = category?.trim() || "Visual Archive";
  const place = location?.trim() ? ` tại ${location.trim()}` : "";
  const descriptions = [`${title} là một ghi chép thị giác thuộc chủ đề ${subject}${place}, được lưu giữ trong kho tư liệu ARCHI.`, `Một lát cắt về ${subject}${place}, nơi ánh sáng, không gian và thời điểm gặp nhau trong ${title}.`, `${title} ghi lại nhịp điệu và chi tiết của ${subject}${place} dưới góc nhìn tư liệu đương đại.`];
  const stories = [`Tác phẩm được tuyển chọn như một phần của hồ sơ thị giác dài hạn. Bối cảnh, thời điểm và quyền tác giả được giữ cùng hình ảnh để giá trị tư liệu không bị tách rời.`, `Khung hình được lưu trữ không chỉ như một hình ảnh độc lập mà còn như một dấu vết của địa điểm, con người và thời điểm nó được tạo ra.`, `Hồ sơ này thuộc quá trình xây dựng một kho lưu trữ có thể tra cứu, nơi mỗi hình ảnh giữ nguyên ngữ cảnh và lịch sử quyền sử dụng.`];
  const tags = [subject, title, location, "ARCHI", "visual archive", "editorial"].filter(Boolean).join(", ");
  return { description: pick(descriptions, title), story: pick(stories, title, 7), displayPrice: String(pick([35, 49, 65, 79, 95, 120], title, 13)), tags, seoTitle: `${title} | ARCHI Visual Archive`.slice(0, 160), seoDescription: `${title} - hồ sơ ${subject.toLowerCase()}${place} trong kho lưu trữ hình ảnh ARCHI.`.slice(0, 320) };
}
