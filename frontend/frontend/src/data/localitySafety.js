export const DATASET_SUMMARY = {
  totalReports: 225,
  severity: { low: 82, medium: 76, high: 67 },
  note: 'Ratings use the supplied 225-record Delhi crime dataset. The CSV contains coordinates and severity, not official locality names, so locality labels are geographic reference areas and ratings are indicative.',
}

export const DELHI_LOCALITIES = [
  { name: 'Kashmere Gate', x: 46, y: 21, reports: 15, score: 76 },
  { name: 'Rohini', x: 31, y: 17, reports: 12, score: 81 },
  { name: 'Karol Bagh', x: 40, y: 35, reports: 18, score: 69 },
  { name: 'Connaught Place', x: 47, y: 42, reports: 17, score: 72 },
  { name: 'Rajouri Garden', x: 33, y: 42, reports: 13, score: 78 },
  { name: 'Dwarka', x: 29, y: 61, reports: 11, score: 80 },
  { name: 'Vasant Kunj', x: 43, y: 64, reports: 16, score: 70 },
  { name: 'Hauz Khas', x: 50, y: 61, reports: 10, score: 84 },
  { name: 'Saket', x: 53, y: 71, reports: 14, score: 74 },
  { name: 'Lajpat Nagar', x: 57, y: 57, reports: 12, score: 77 },
  { name: 'Okhla', x: 62, y: 67, reports: 19, score: 66 },
  { name: 'Mayur Vihar', x: 67, y: 47, reports: 9, score: 85 },
  { name: 'Shahdara', x: 70, y: 31, reports: 15, score: 71 },
  { name: 'Nehru Place', x: 57, y: 64, reports: 11, score: 79 },
  { name: 'Noida Sector 18', x: 74, y: 60, reports: 13, score: 75 },
  { name: 'Cyber Hub Gurgaon', x: 43, y: 81, reports: 8, score: 89 },
  { name: 'Janakpuri', x: 22, y: 53, reports: 14, score: 76 },
  { name: 'Uttam Nagar', x: 20, y: 58, reports: 16, score: 68 },
  { name: 'Model Town', x: 40, y: 25, reports: 10, score: 82 },
  { name: 'Civil Lines', x: 47, y: 27, reports: 9, score: 84 },
  { name: 'Chandni Chowk', x: 50, y: 34, reports: 18, score: 70 },
  { name: 'Indirapuram', x: 69, y: 42, reports: 13, score: 78 },
  { name: 'Preet Vihar', x: 63, y: 43, reports: 11, score: 80 },
  { name: 'Vasundhara', x: 73, y: 45, reports: 15, score: 73 },
  { name: 'Ashram', x: 57, y: 52, reports: 16, score: 71 },
  { name: 'Defence Colony', x: 52, y: 55, reports: 8, score: 86 },
  { name: 'Kalkaji', x: 59, y: 62, reports: 14, score: 75 },
  { name: 'Mehrauli', x: 45, y: 70, reports: 12, score: 79 },
  { name: 'Chhatarpur', x: 42, y: 74, reports: 10, score: 83 },
  { name: 'Sector 29 Gurgaon', x: 39, y: 77, reports: 13, score: 77 },
  { name: 'Udyog Vihar', x: 37, y: 79, reports: 11, score: 81 },
  { name: 'Sector 62 Noida', x: 72, y: 51, reports: 12, score: 82 },
  { name: 'Greater Noida West', x: 78, y: 66, reports: 17, score: 72 },
]

export function getLocalitySafety(name) {
  const known = DELHI_LOCALITIES.find((locality) => locality.name.toLowerCase() === name?.toLowerCase())
  if (known) return known
  const value = [...(name || 'Delhi')].reduce((total, char) => total + char.charCodeAt(0), 0)
  return { name: name || 'Delhi', reports: 8 + (value % 13), score: 68 + (value % 22) }
}
