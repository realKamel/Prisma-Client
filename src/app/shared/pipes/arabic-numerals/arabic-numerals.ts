/** Two-letter avatar initials from a full Arabic name */
export function studentInitials(name: string): string {
  return name
    .trim()
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('');
}
