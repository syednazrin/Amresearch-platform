import { type ClassValue, clsx } from 'clsx';

// Utility function for conditional class names
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Format file size to human readable
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Format date to readable string
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Format date and time
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Truncate text with ellipsis
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

// Generate random ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Sanitize filename for safe storage
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
}

// Normalize date to day (YYYY-MM-DD format) for comparison
export function normalizeDateToDay(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Format date header with relative dates (Today, Yesterday, or formatted date)
export function formatDateHeader(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Normalize to day for comparison
  const dateStr = normalizeDateToDay(d);
  const todayStr = normalizeDateToDay(today);
  const yesterdayStr = normalizeDateToDay(yesterday);

  if (dateStr === todayStr) {
    return 'Today';
  } else if (dateStr === yesterdayStr) {
    return 'Yesterday';
  } else {
    return formatDate(d);
  }
}

// Group documents by normalized date
export function groupDocumentsByDate<T extends { uploadedAt: string | Date }>(
  documents: T[]
): Map<string, T[]> {
  const grouped = new Map<string, T[]>();

  documents.forEach((doc) => {
    const dateKey = normalizeDateToDay(doc.uploadedAt);
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(doc);
  });

  // Sort documents within each group by uploadedAt (newest first)
  grouped.forEach((docs, dateKey) => {
    docs.sort((a, b) => {
      const dateA = typeof a.uploadedAt === 'string' ? new Date(a.uploadedAt) : a.uploadedAt;
      const dateB = typeof b.uploadedAt === 'string' ? new Date(b.uploadedAt) : b.uploadedAt;
      return dateB.getTime() - dateA.getTime();
    });
  });

  return grouped;
}