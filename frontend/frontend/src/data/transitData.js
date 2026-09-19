export const TRANSIT_SOURCES = {
  metroNetwork: 'https://delhimetrorail.com/',
  metroData: 'https://otd.delhi.gov.in/data/staticDMRC/',
  busTimetable: 'https://dtc.delhi.gov.in/',
}

export const METRO_LINES = [
  { name: 'Red Line', color: '#d53a3a', points: [[28.82, 77.10], [28.75, 77.12], [28.70, 77.15], [28.66, 77.21], [28.65, 77.30]] },
  { name: 'Yellow Line', color: '#e5bd25', points: [[28.88, 77.10], [28.78, 77.15], [28.63, 77.22], [28.54, 77.25], [28.46, 77.08]] },
  { name: 'Blue Line', color: '#1976d2', points: [[28.62, 76.98], [28.64, 77.12], [28.63, 77.22], [28.62, 77.34]] },
  { name: 'Violet Line', color: '#8f3eb4', points: [[28.70, 77.21], [28.62, 77.22], [28.54, 77.25], [28.42, 77.31]] },
  { name: 'Pink Line', color: '#e9709f', points: [[28.79, 77.16], [28.70, 77.21], [28.59, 77.23], [28.65, 77.32], [28.76, 77.25]] },
  { name: 'Magenta Line', color: '#b338a4', points: [[28.73, 77.15], [28.62, 77.22], [28.54, 77.25], [28.56, 77.29]] },
  { name: 'Green Line', color: '#2b9d62', points: [[28.69, 76.94], [28.66, 77.02], [28.64, 77.12], [28.63, 77.22]] },
  { name: 'Airport Express', color: '#e07f22', points: [[28.56, 77.10], [28.60, 77.16], [28.64, 77.21], [28.67, 77.23]] },
]

export const METRO_STATIONS = [
  { name: 'Kashmere Gate', position: [28.667, 77.228], lines: ['Red Line', 'Yellow Line', 'Violet Line'], first: '05:29', last: '23:35', busStop: 'ISBT Kashmere Gate', buses: ['120', '405', '419', '502', '729'] },
  { name: 'Rajiv Chowk', position: [28.633, 77.219], lines: ['Blue Line', 'Yellow Line'], first: '05:30', last: '23:20', busStop: 'Shivaji Stadium', buses: ['680', '894', '990'] },
  { name: 'Hauz Khas', position: [28.549, 77.207], lines: ['Yellow Line', 'Magenta Line'], first: '05:45', last: '23:14', busStop: 'Hauz Khas Village', buses: ['516', '610A', 'OMS(+)' ] },
  { name: 'Lajpat Nagar', position: [28.570, 77.236], lines: ['Violet Line', 'Pink Line'], first: '05:37', last: '23:06', busStop: 'Lajpat Nagar Ring Road', buses: ['419', '429', '463', '522'] },
  { name: 'Azadpur', position: [28.707, 77.180], lines: ['Yellow Line', 'Pink Line'], first: '05:32', last: '23:27', busStop: 'Azadpur Terminal', buses: ['100', '120', '133', 'A-1'] },
  { name: 'Anand Vihar ISBT', position: [28.646, 77.315], lines: ['Blue Line', 'Pink Line'], first: '05:42', last: '23:09', busStop: 'Anand Vihar ISBT', buses: ['85', '212', '309', '390', '473'] },
  { name: 'Janakpuri West', position: [28.621, 77.077], lines: ['Blue Line', 'Magenta Line'], first: '05:35', last: '23:09', busStop: 'Janakpuri West Metro', buses: ['RL-77', '764', '817N'] },
  { name: 'Botanical Garden', position: [28.565, 77.334], lines: ['Blue Line', 'Magenta Line'], first: '05:37', last: '23:09', busStop: 'Botanical Garden Metro', buses: ['8A', '34A', '390', '493'] },
  { name: 'Mandi House', position: [28.626, 77.235], lines: ['Blue Line', 'Violet Line'], first: '05:36', last: '23:15', busStop: 'Mandi House', buses: ['33', '410', '425', '522'] },
  { name: 'Netaji Subhash Place', position: [28.695, 77.152], lines: ['Red Line', 'Pink Line'], first: '05:34', last: '23:16', busStop: 'Netaji Subhash Place', buses: ['44', '901', '972'] },
  { name: 'INA', position: [28.574, 77.210], lines: ['Yellow Line', 'Pink Line'], first: '05:42', last: '23:10', busStop: 'INA Market', buses: ['505', '610A', '644'] },
  { name: 'New Delhi', position: [28.641, 77.219], lines: ['Yellow Line', 'Airport Express'], first: '05:33', last: '23:24', busStop: 'New Delhi Railway Station Gate 2', buses: ['16A', '39A', '405', '429'] },
]
