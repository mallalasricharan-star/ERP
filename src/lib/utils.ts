import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Grade calculation helper based on requirements:
// 90–100 → A+
// 80–89  → A
// 70–79  → B+
// 60–69  → B
// 50–59  → C
// 40–49  → D
// Below 40 → F
export function calculateGrade(percentage: number): { grade: string; remarks: string; color: string } {
  if (percentage >= 90) return { grade: 'A+', remarks: 'Outstanding', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
  if (percentage >= 80) return { grade: 'A', remarks: 'Excellent', color: 'text-blue-600 bg-blue-50 border-blue-200' };
  if (percentage >= 70) return { grade: 'B+', remarks: 'Very Good', color: 'text-indigo-600 bg-indigo-50 border-indigo-200' };
  if (percentage >= 60) return { grade: 'B', remarks: 'Good', color: 'text-cyan-600 bg-cyan-50 border-cyan-200' };
  if (percentage >= 50) return { grade: 'C', remarks: 'Average', color: 'text-amber-600 bg-amber-50 border-amber-200' };
  if (percentage >= 40) return { grade: 'D', remarks: 'Pass', color: 'text-orange-600 bg-orange-50 border-orange-200' };
  return { grade: 'F', remarks: 'Needs Improvement', color: 'text-rose-600 bg-rose-50 border-rose-200' };
}

// Format date to readable string: 26-Aug-2026
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

// Format date to ISO YYYY-MM-DD
export function toISODate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Simple SHA-256 for browser-side hashing verification if offline
export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
