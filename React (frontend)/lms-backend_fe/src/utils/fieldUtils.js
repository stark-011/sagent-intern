export const safeText = (value) => (value == null ? "" : String(value).trim());

export const normalizeRole = (role) => {
  const normalized = safeText(role).toUpperCase();
  if (normalized === "ADMIN") return "LIBRARIAN";
  if (normalized === "USER") return "MEMBER";
  if (normalized === "LIBRARIAN" || normalized === "MEMBER") return normalized;
  return "MEMBER";
};

export const extractToken = (payload = {}) =>
  payload.token ||
  payload.jwt ||
  payload.jwtToken ||
  payload.accessToken ||
  payload.access_token ||
  null;

export const getEntityId = (entity = {}) =>
  entity.id ??
  entity.bookIssueId ??
  entity.bookId ??
  entity.issueId ??
  entity.transactionId ??
  entity.stockId ??
  entity.notificationId ??
  entity.notifyId ??
  entity.userId ??
  null;

export const getIssueId = (issue = {}) =>
  issue.id ?? issue.bookIssueId ?? issue.issueId ?? issue.transactionId ?? null;

export const getUserId = (user = {}) =>
  user.id ?? user.userId ?? user.memberId ?? user.libraryId ?? null;

export const getLibraryId = (user = {}) =>
  user.libraryId ?? user.memberId ?? user.userCode ?? user.id ?? null;

export const getUserDisplayName = (user = {}) =>
  safeText(user.name || user.fullName || user.username || user.email || "Member");

const nestedId = (value) => {
  if (!value || typeof value !== "object") return null;
  return value.id ?? value.userId ?? value.stockId ?? value.bookId ?? null;
};

export const getIssueUserId = (issue = {}) =>
  issue.userId ?? issue.memberId ?? nestedId(issue.user) ?? nestedId(issue.member) ?? null;

export const getIssueBookId = (issue = {}) =>
  issue.stockId ??
  issue.bookId ??
  issue.inventoryId ??
  nestedId(issue.stock) ??
  nestedId(issue.book) ??
  null;

export const getIssueStatus = (issue = {}) =>
  safeText(issue.status || issue.issueStatus || issue.transactionStatus || "Requested");

export const getIssueFine = (issue = {}) => {
  const value = issue.fine ?? issue.fineAmount ?? issue.overdueFine ?? 0;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const getIssueDueDate = (issue = {}) =>
  issue.dueDate || issue.returnDueDate || issue.expectedReturnDate || null;

export const getIssueReturnDate = (issue = {}) =>
  issue.returnDate || issue.returnedDate || issue.actualReturnDate || null;

export const getBookTitle = (stock = {}) =>
  safeText(stock.title || stock.bookTitle || stock.name || "Untitled");

export const getBookAuthor = (stock = {}) =>
  safeText(stock.author || stock.bookAuthor || stock.writer || "-");

export const getBookSubject = (stock = {}) =>
  safeText(stock.subject || stock.category || stock.genre || "-");

export const getAvailabilityLabel = (stock = {}) => {
  const status = safeText(stock.status || stock.condition).toLowerCase();

  if (status.includes("damaged")) return "Damaged";
  if (status.includes("lost")) return "Book Not Available";
  if (status.includes("not available")) return "Book Not Available";

  const availableCopies = Number(
    stock.availableCopies ??
      stock.availableQuantity ??
      stock.quantityAvailable ??
      stock.quantity ??
      stock.copies
  );

  if (!Number.isNaN(availableCopies)) {
    return availableCopies > 0 ? "Book Available" : "Book Not Available";
  }

  const isAvailable = stock.available ?? stock.isAvailable;
  if (typeof isAvailable === "boolean") {
    return isAvailable ? "Book Available" : "Book Not Available";
  }

  return "Book Not Available";
};

export const getNotificationMessage = (item = {}) =>
  safeText(item.message || item.content || item.text || "");

export const isNotificationRead = (item = {}) => {
  if (typeof item.read === "boolean") return item.read;
  if (typeof item.isRead === "boolean") return item.isRead;
  const status = safeText(item.status).toLowerCase();
  return status === "read";
};

export const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};
