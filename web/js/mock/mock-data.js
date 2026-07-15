import { getFixtureShortId } from '../core/helpers.js';

const sportTypes = [
  { id: 'american-football', label: 'American Football' },
  { id: 'athletics', label: 'Athletics' },
  { id: 'baseball', label: 'Baseball' },
  { id: 'basketball', label: 'Basketball' },
  { id: 'boxing', label: 'Boxing' },
  { id: 'cricket', label: 'Cricket' },
  { id: 'darts', label: 'Darts' },
  { id: 'equestrian', label: 'Equestrian' },
  { id: 'extreme-sports', label: 'Extreme Sports' },
  { id: 'fishing', label: 'Fishing' },
  { id: 'football', label: 'Football' },
  { id: 'golf', label: 'Golf' },
  { id: 'motorsport', label: 'Motor Sport' },
  { id: 'racing-horse', label: 'Racing (Horse)' },
  { id: 'rugby', label: 'Rugby (Union League)' },
  { id: 'snooker-pool', label: 'Snooker/Pool' },
  { id: 'tennis', label: 'Tennis' },
  { id: 'watersports', label: 'Watersports' }
];

const dashboardStats = [
  { icon: '📦', iconClass: 'purple', trend: '↑ 12%', trendDirection: 'up', value: '247', label: 'Total Fixtures' },
  { icon: '⭐', iconClass: 'rose', trend: '+2', trendDirection: 'up', value: '12', label: 'Active Subscriptions' },
  { icon: '⏳', iconClass: 'sky', trend: '↓ 5', trendDirection: 'down', value: '34', label: 'Pending Imports' }
];

const fixtureGroups = {
  'premier-league-2025': {
    name: 'Premier League 2025/26',
    sport: 'Football',
    season: '2025/26',
    organiser: 'English Premier League',
    startDate: 'Aug 16, 2025',
    endDate: 'May 24, 2026',
    totalFixtures: 380,
    fixtures: [
      { name: 'Arsenal vs Chelsea', date: 'Dec 22, 2025', venue: 'Emirates Stadium, London', status: 'Available' },
      { name: 'Liverpool vs Man United', date: 'Jan 4, 2026', venue: 'Anfield, Liverpool', status: 'Available' },
      { name: 'Man City vs Tottenham', date: 'Jan 18, 2026', venue: 'Etihad Stadium, Manchester', status: 'Imported' },
      { name: 'Newcastle vs Aston Villa', date: 'Jan 25, 2026', venue: 'St James\' Park, Newcastle', status: 'Available' },
      { name: 'Chelsea vs West Ham', date: 'Feb 1, 2026', venue: 'Stamford Bridge, London', status: 'Available' },
      { name: 'Everton vs Brighton', date: 'Feb 8, 2026', venue: 'Goodison Park, Liverpool', status: 'Imported' },
      { name: 'Wolves vs Crystal Palace', date: 'Feb 15, 2026', venue: 'Molineux, Wolverhampton', status: 'Imported' },
      { name: 'Tottenham vs Arsenal', date: 'Feb 22, 2026', venue: 'Tottenham Hotspur Stadium, London', status: 'Available' },
      { name: 'Man United vs Liverpool', date: 'Mar 1, 2026', venue: 'Old Trafford, Manchester', status: 'Available' },
      { name: 'Leicester vs Nottingham Forest', date: 'Mar 8, 2026', venue: 'King Power Stadium, Leicester', status: 'Imported' },
      { name: 'West Ham vs Fulham', date: 'Mar 15, 2026', venue: 'London Stadium, London', status: 'Available' },
      { name: 'Aston Villa vs Man City', date: 'Mar 22, 2026', venue: 'Villa Park, Birmingham', status: 'Available' },
      { name: 'Brighton vs Brentford', date: 'Mar 29, 2026', venue: 'Amex Stadium, Brighton', status: 'Imported' },
      { name: 'Bournemouth vs Southampton', date: 'Apr 5, 2026', venue: 'Vitality Stadium, Bournemouth', status: 'Available' },
      { name: 'Crystal Palace vs Ipswich', date: 'Apr 12, 2026', venue: 'Selhurst Park, London', status: 'Available' },
      { name: 'Chelsea vs Arsenal', date: 'Apr 19, 2026', venue: 'Stamford Bridge, London', status: 'Available' },
      { name: 'Liverpool vs Man City', date: 'Apr 26, 2026', venue: 'Anfield, Liverpool', status: 'Available' },
      { name: 'Man City vs Arsenal', date: 'May 3, 2026', venue: 'Etihad Stadium, Manchester', status: 'Available' },
      { name: 'Tottenham vs Chelsea', date: 'May 10, 2026', venue: 'Tottenham Hotspur Stadium, London', status: 'Available' },
      { name: 'Newcastle vs Liverpool', date: 'May 17, 2026', venue: 'St James\' Park, Newcastle', status: 'Available' }
    ]
  },
  'champions-league-2025': {
    name: 'Champions League 2025/26',
    sport: 'Football',
    season: '2025/26',
    organiser: 'UEFA',
    startDate: 'Sep 16, 2025',
    endDate: 'May 30, 2026',
    totalFixtures: 189,
    fixtures: [
      { name: 'Real Madrid vs Bayern Munich', date: 'Feb 12, 2026', venue: 'Santiago Bernabéu, Madrid', status: 'Available' },
      { name: 'PSG vs Inter Milan', date: 'Feb 19, 2026', venue: 'Parc des Princes, Paris', status: 'Available' },
      { name: 'Barcelona vs Man City', date: 'Mar 5, 2026', venue: 'Camp Nou, Barcelona', status: 'Imported' },
      { name: 'Liverpool vs Dortmund', date: 'Mar 12, 2026', venue: 'Anfield, Liverpool', status: 'Available' },
      { name: 'Juventus vs Atletico Madrid', date: 'Mar 19, 2026', venue: 'Allianz Stadium, Turin', status: 'Imported' },
      { name: 'Bayern Munich vs PSG', date: 'Mar 26, 2026', venue: 'Allianz Arena, Munich', status: 'Available' },
      { name: 'Man City vs Real Madrid', date: 'Apr 2, 2026', venue: 'Etihad Stadium, Manchester', status: 'Available' },
      { name: 'Inter Milan vs Liverpool', date: 'Apr 9, 2026', venue: 'San Siro, Milan', status: 'Imported' },
      { name: 'Dortmund vs Barcelona', date: 'Apr 16, 2026', venue: 'Signal Iduna Park, Dortmund', status: 'Available' },
      { name: 'Atletico Madrid vs Bayern Munich', date: 'Apr 23, 2026', venue: 'Wanda Metropolitano, Madrid', status: 'Available' },
      { name: 'Semi-Final 1 (Leg 1)', date: 'Apr 30, 2026', venue: 'TBD', status: 'Available' },
      { name: 'Semi-Final 1 (Leg 2)', date: 'May 7, 2026', venue: 'TBD', status: 'Available' },
      { name: 'Semi-Final 2 (Leg 1)', date: 'May 1, 2026', venue: 'TBD', status: 'Available' },
      { name: 'Semi-Final 2 (Leg 2)', date: 'May 8, 2026', venue: 'TBD', status: 'Available' },
      { name: 'Final', date: 'May 30, 2026', venue: 'Allianz Arena, Munich', status: 'Available' },
      { name: 'Group A - Matchday 1', date: 'Sep 16, 2025', venue: 'Various', status: 'Imported' },
      { name: 'Group A - Matchday 2', date: 'Oct 1, 2025', venue: 'Various', status: 'Imported' },
      { name: 'Group B - Matchday 1', date: 'Sep 17, 2025', venue: 'Various', status: 'Imported' },
      { name: 'Group B - Matchday 2', date: 'Oct 2, 2025', venue: 'Various', status: 'Imported' },
      { name: 'Group C - Matchday 1', date: 'Sep 16, 2025', venue: 'Various', status: 'Imported' }
    ]
  },
  'grand-slam-2025': {
    name: 'Grand Slam Series 2025',
    sport: 'Tennis',
    season: '2025/26',
    organiser: 'ITF / Grand Slam Board',
    startDate: 'Jan 12, 2026',
    endDate: 'Sep 13, 2026',
    totalFixtures: 56,
    fixtures: [
      { name: 'Australian Open Finals', date: 'Jan 26, 2026', venue: 'Melbourne Park, Australia', status: 'Available' },
      { name: 'Australian Open Semi-Finals', date: 'Jan 24, 2026', venue: 'Melbourne Park, Australia', status: 'Imported' },
      { name: 'French Open Semi-Finals', date: 'Jun 6, 2026', venue: 'Roland Garros, Paris', status: 'Available' },
      { name: 'French Open Finals', date: 'Jun 8, 2026', venue: 'Roland Garros, Paris', status: 'Available' },
      { name: 'Wimbledon Quarter-Finals', date: 'Jul 9, 2026', venue: 'All England Club, London', status: 'Imported' },
      { name: 'Wimbledon Semi-Finals', date: 'Jul 11, 2026', venue: 'All England Club, London', status: 'Available' },
      { name: 'Wimbledon Finals', date: 'Jul 13, 2026', venue: 'All England Club, London', status: 'Available' },
      { name: 'US Open Semi-Finals', date: 'Sep 11, 2026', venue: 'Flushing Meadows, New York', status: 'Available' },
      { name: 'US Open Finals', date: 'Sep 13, 2026', venue: 'Flushing Meadows, New York', status: 'Available' }
    ]
  },
  'f1-monaco-gp-2025': {
    name: 'F1 Monaco Grand Prix 2025',
    sport: 'Motor Sport',
    season: '2025',
    organiser: 'FIA / Formula 1',
    startDate: 'May 22, 2026',
    endDate: 'May 24, 2026',
    venue: 'Circuit de Monaco, Monte Carlo',
    totalFixtures: 5,
    fixtures: [
      { name: 'Monaco GP - Practice 1', date: 'May 22, 2026', venue: 'Circuit de Monaco', status: 'Available' },
      { name: 'Monaco GP - Practice 2', date: 'May 22, 2026', venue: 'Circuit de Monaco', status: 'Available' },
      { name: 'Monaco GP - Practice 3', date: 'May 23, 2026', venue: 'Circuit de Monaco', status: 'Available' },
      { name: 'Monaco GP - Qualifying', date: 'May 23, 2026', venue: 'Circuit de Monaco', status: 'Imported' },
      { name: 'Monaco GP - Race', date: 'May 24, 2026', venue: 'Circuit de Monaco', status: 'Available' }
    ]
  },
  'f1-silverstone-gp-2025': {
    name: 'F1 British Grand Prix 2025',
    sport: 'Motor Sport',
    season: '2025',
    organiser: 'FIA / Formula 1',
    startDate: 'Jul 4, 2026',
    endDate: 'Jul 6, 2026',
    venue: 'Silverstone Circuit, UK',
    totalFixtures: 5,
    fixtures: [
      { name: 'British GP - Practice 1', date: 'Jul 4, 2026', venue: 'Silverstone Circuit, UK', status: 'Available' },
      { name: 'British GP - Practice 2', date: 'Jul 4, 2026', venue: 'Silverstone Circuit, UK', status: 'Available' },
      { name: 'British GP - Practice 3', date: 'Jul 5, 2026', venue: 'Silverstone Circuit, UK', status: 'Available' },
      { name: 'British GP - Qualifying', date: 'Jul 5, 2026', venue: 'Silverstone Circuit, UK', status: 'Available' },
      { name: 'British GP - Race', date: 'Jul 6, 2026', venue: 'Silverstone Circuit, UK', status: 'Available' }
    ]
  },
  'f1-monza-gp-2025': {
    name: 'F1 Italian Grand Prix 2025',
    sport: 'Motor Sport',
    season: '2025',
    organiser: 'FIA / Formula 1',
    startDate: 'Sep 5, 2026',
    endDate: 'Sep 7, 2026',
    venue: 'Autodromo di Monza, Italy',
    totalFixtures: 5,
    fixtures: [
      { name: 'Italian GP - Practice 1', date: 'Sep 5, 2026', venue: 'Autodromo di Monza, Italy', status: 'Available' },
      { name: 'Italian GP - Practice 2', date: 'Sep 5, 2026', venue: 'Autodromo di Monza, Italy', status: 'Available' },
      { name: 'Italian GP - Practice 3', date: 'Sep 6, 2026', venue: 'Autodromo di Monza, Italy', status: 'Available' },
      { name: 'Italian GP - Qualifying', date: 'Sep 6, 2026', venue: 'Autodromo di Monza, Italy', status: 'Available' },
      { name: 'Italian GP - Race', date: 'Sep 7, 2026', venue: 'Autodromo di Monza, Italy', status: 'Available' }
    ]
  },
  'f1-spa-gp-2025': {
    name: 'F1 Belgian Grand Prix 2025',
    sport: 'Motor Sport',
    season: '2025',
    organiser: 'FIA / Formula 1',
    startDate: 'Jul 25, 2026',
    endDate: 'Jul 27, 2026',
    venue: 'Circuit de Spa-Francorchamps, Belgium',
    totalFixtures: 5,
    fixtures: [
      { name: 'Belgian GP - Practice 1', date: 'Jul 25, 2026', venue: 'Spa-Francorchamps, Belgium', status: 'Available' },
      { name: 'Belgian GP - Practice 2', date: 'Jul 25, 2026', venue: 'Spa-Francorchamps, Belgium', status: 'Available' },
      { name: 'Belgian GP - Practice 3', date: 'Jul 26, 2026', venue: 'Spa-Francorchamps, Belgium', status: 'Available' },
      { name: 'Belgian GP - Qualifying', date: 'Jul 26, 2026', venue: 'Spa-Francorchamps, Belgium', status: 'Available' },
      { name: 'Belgian GP - Race', date: 'Jul 27, 2026', venue: 'Spa-Francorchamps, Belgium', status: 'Available' }
    ]
  },
  'nba-season-2025': {
    name: 'NBA Season 2025/26',
    sport: 'Basketball',
    season: '2025/26',
    organiser: 'National Basketball Association',
    startDate: 'Oct 21, 2025',
    endDate: 'Jun 15, 2026',
    totalFixtures: 1230,
    fixtures: [
      { name: 'Lakers vs Celtics', date: 'Dec 25, 2025', venue: 'Staples Center, Los Angeles', status: 'Available' },
      { name: 'Warriors vs Bucks', date: 'Jan 10, 2026', venue: 'Chase Center, San Francisco', status: 'Imported' },
      { name: 'Nets vs 76ers', date: 'Jan 15, 2026', venue: 'Barclays Center, Brooklyn', status: 'Available' },
      { name: 'Heat vs Nuggets', date: 'Jan 22, 2026', venue: 'FTX Arena, Miami', status: 'Imported' },
      { name: 'Suns vs Mavericks', date: 'Feb 5, 2026', venue: 'Footprint Center, Phoenix', status: 'Available' },
      { name: 'Celtics vs Warriors', date: 'Feb 14, 2026', venue: 'TD Garden, Boston', status: 'Available' }
    ]
  },
  'nfl-season-2025': {
    name: 'NFL Season 2025/26',
    sport: 'American Football',
    season: '2025/26',
    organiser: 'National Football League',
    startDate: 'Sep 4, 2025',
    endDate: 'Feb 8, 2026',
    totalFixtures: 272,
    fixtures: [
      { name: 'Super Bowl LX', date: 'Feb 8, 2026', venue: 'Levi\'s Stadium, Santa Clara', status: 'Available' },
      { name: 'Cowboys vs Eagles', date: 'Dec 28, 2025', venue: 'AT&T Stadium, Arlington', status: 'Available' },
      { name: 'Chiefs vs Bills', date: 'Jan 11, 2026', venue: 'Arrowhead Stadium, Kansas City', status: 'Imported' },
      { name: '49ers vs Seahawks', date: 'Jan 18, 2026', venue: 'Levi\'s Stadium, Santa Clara', status: 'Imported' },
      { name: 'NFC Championship', date: 'Jan 25, 2026', venue: 'TBD', status: 'Available' },
      { name: 'AFC Championship', date: 'Jan 25, 2026', venue: 'TBD', status: 'Available' }
    ]
  },
  'ashes-2025': {
    name: 'The Ashes 2025',
    sport: 'Cricket',
    season: '2025/26',
    organiser: 'ECB / Cricket Australia',
    startDate: 'Jun 18, 2026',
    endDate: 'Aug 10, 2026',
    venue: 'Various (England)',
    totalFixtures: 25,
    fixtures: [
      { name: '1st Test - Day 1', date: 'Jun 18, 2026', venue: 'Lord\'s, London', status: 'Available' },
      { name: '1st Test - Day 2', date: 'Jun 19, 2026', venue: 'Lord\'s, London', status: 'Available' },
      { name: '1st Test - Day 3', date: 'Jun 20, 2026', venue: 'Lord\'s, London', status: 'Available' },
      { name: '1st Test - Day 4', date: 'Jun 21, 2026', venue: 'Lord\'s, London', status: 'Available' },
      { name: '1st Test - Day 5', date: 'Jun 22, 2026', venue: 'Lord\'s, London', status: 'Available' },
      { name: '2nd Test - Day 1', date: 'Jul 2, 2026', venue: 'Edgbaston, Birmingham', status: 'Available' },
      { name: '2nd Test - Day 2', date: 'Jul 3, 2026', venue: 'Edgbaston, Birmingham', status: 'Available' },
      { name: '2nd Test - Day 3', date: 'Jul 4, 2026', venue: 'Edgbaston, Birmingham', status: 'Available' },
      { name: '2nd Test - Day 4', date: 'Jul 5, 2026', venue: 'Edgbaston, Birmingham', status: 'Available' },
      { name: '2nd Test - Day 5', date: 'Jul 6, 2026', venue: 'Edgbaston, Birmingham', status: 'Available' },
      { name: '3rd Test - Day 1', date: 'Jul 16, 2026', venue: 'Headingley, Leeds', status: 'Imported' },
      { name: '3rd Test - Day 2', date: 'Jul 17, 2026', venue: 'Headingley, Leeds', status: 'Imported' },
      { name: '3rd Test - Day 3', date: 'Jul 18, 2026', venue: 'Headingley, Leeds', status: 'Imported' },
      { name: '4th Test - Day 1', date: 'Jul 30, 2026', venue: 'Old Trafford, Manchester', status: 'Available' },
      { name: '4th Test - Day 2', date: 'Jul 31, 2026', venue: 'Old Trafford, Manchester', status: 'Available' },
      { name: '5th Test - Day 1', date: 'Aug 6, 2026', venue: 'The Oval, London', status: 'Available' },
      { name: '5th Test - Day 2', date: 'Aug 7, 2026', venue: 'The Oval, London', status: 'Available' }
    ]
  }
};

const importableFixtures = [
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567001', name: 'Arsenal vs Chelsea', groupId: 'premier-league-2025', typeId: 'football', sportType: 'Football', date: 'Dec 22, 2025', venue: 'Emirates Stadium, London', status: 'Available' },
  { id: 'b2c3d4e5-f6a7-8901-bcde-f12345670002', name: 'Liverpool vs Man United', groupId: 'premier-league-2025', typeId: 'football', sportType: 'Football', date: 'Jan 4, 2026', venue: 'Anfield, Liverpool', status: 'Available' },
  { id: 'c3d4e5f6-a7b8-9012-cdef-123456700003', name: 'Newcastle vs Aston Villa', groupId: 'premier-league-2025', typeId: 'football', sportType: 'Football', date: 'Jan 25, 2026', venue: 'St James\' Park, Newcastle', status: 'Available' },
  { id: 'd4e5f6a7-b8c9-0123-defa-234567800004', name: 'Chelsea vs West Ham', groupId: 'premier-league-2025', typeId: 'football', sportType: 'Football', date: 'Feb 1, 2026', venue: 'Stamford Bridge, London', status: 'Available' },
  { id: 'e5f6a7b8-c9d0-1234-efab-345678900005', name: 'Real Madrid vs Bayern Munich', groupId: 'champions-league-2025', typeId: 'football', sportType: 'Football', date: 'Feb 12, 2026', venue: 'Santiago Bernabéu, Madrid', status: 'Available' },
  { id: 'f6a7b8c9-d0e1-2345-fabc-456789000006', name: 'PSG vs Inter Milan', groupId: 'champions-league-2025', typeId: 'football', sportType: 'Football', date: 'Feb 19, 2026', venue: 'Parc des Princes, Paris', status: 'Available' },
  { id: 'a7b8c9d0-e1f2-3456-abcd-567890100007', name: 'Liverpool vs Dortmund', groupId: 'champions-league-2025', typeId: 'football', sportType: 'Football', date: 'Mar 12, 2026', venue: 'Anfield, Liverpool', status: 'Available' },
  { id: 'b8c9d0e1-f2a3-4567-bcde-678901200008', name: 'Australian Open Finals', groupId: 'grand-slam-2025', typeId: 'tennis', sportType: 'Tennis', date: 'Jan 26, 2026', venue: 'Melbourne Park, Australia', status: 'Available' },
  { id: 'c9d0e1f2-a3b4-5678-cdef-789012300009', name: 'French Open Semi-Finals', groupId: 'grand-slam-2025', typeId: 'tennis', sportType: 'Tennis', date: 'Jun 6, 2026', venue: 'Roland Garros, Paris', status: 'Available' },
  { id: 'd0e1f2a3-b4c5-6789-defa-890123400010', name: 'Wimbledon Finals', groupId: 'grand-slam-2025', typeId: 'tennis', sportType: 'Tennis', date: 'Jul 13, 2026', venue: 'All England Club, London', status: 'Available' },
  { id: 'e1f2a3b4-c5d6-7890-efab-901234500011', name: 'Monaco GP - Practice 1', groupId: 'f1-monaco-gp-2025', typeId: 'motorsport', sportType: 'Motor Sport', date: 'May 22, 2026', venue: 'Circuit de Monaco', status: 'Available' },
  { id: 'f2a3b4c5-d6e7-8901-fabc-012345600012', name: 'Monaco GP - Practice 2', groupId: 'f1-monaco-gp-2025', typeId: 'motorsport', sportType: 'Motor Sport', date: 'May 22, 2026', venue: 'Circuit de Monaco', status: 'Available' },
  { id: 'a3b4c5d6-e7f8-9012-abcd-123456700013', name: 'Monaco GP - Practice 3', groupId: 'f1-monaco-gp-2025', typeId: 'motorsport', sportType: 'Motor Sport', date: 'May 23, 2026', venue: 'Circuit de Monaco', status: 'Available' },
  { id: 'b4c5d6e7-f8a9-0123-bcde-234567800014', name: 'Monaco GP - Race', groupId: 'f1-monaco-gp-2025', typeId: 'motorsport', sportType: 'Motor Sport', date: 'May 24, 2026', venue: 'Circuit de Monaco', status: 'Available' },
  { id: 'c5d6e7f8-a9b0-1234-cdef-345678900015', name: 'British GP - Practice 1', groupId: 'f1-silverstone-gp-2025', typeId: 'motorsport', sportType: 'Motor Sport', date: 'Jul 4, 2026', venue: 'Silverstone Circuit, UK', status: 'Available' },
  { id: 'd6e7f8a9-b0c1-2345-defa-456789000016', name: 'British GP - Qualifying', groupId: 'f1-silverstone-gp-2025', typeId: 'motorsport', sportType: 'Motor Sport', date: 'Jul 5, 2026', venue: 'Silverstone Circuit, UK', status: 'Available' },
  { id: 'e7f8a9b0-c1d2-3456-efab-567890100017', name: 'British GP - Race', groupId: 'f1-silverstone-gp-2025', typeId: 'motorsport', sportType: 'Motor Sport', date: 'Jul 6, 2026', venue: 'Silverstone Circuit, UK', status: 'Available' },
  { id: 'f8a9b0c1-d2e3-4567-fabc-678901200018', name: 'Italian GP - Practice 1', groupId: 'f1-monza-gp-2025', typeId: 'motorsport', sportType: 'Motor Sport', date: 'Sep 5, 2026', venue: 'Autodromo di Monza, Italy', status: 'Available' },
  { id: 'a9b0c1d2-e3f4-5678-abcd-789012300019', name: 'Italian GP - Qualifying', groupId: 'f1-monza-gp-2025', typeId: 'motorsport', sportType: 'Motor Sport', date: 'Sep 6, 2026', venue: 'Autodromo di Monza, Italy', status: 'Available' },
  { id: 'b0c1d2e3-f4a5-6789-bcde-890123400020', name: 'Italian GP - Race', groupId: 'f1-monza-gp-2025', typeId: 'motorsport', sportType: 'Motor Sport', date: 'Sep 7, 2026', venue: 'Autodromo di Monza, Italy', status: 'Available' },
  { id: 'c1d2e3f4-a5b6-7890-cdef-901234500021', name: 'Lakers vs Celtics', groupId: 'nba-season-2025', typeId: 'basketball', sportType: 'Basketball', date: 'Dec 25, 2025', venue: 'Staples Center, Los Angeles', status: 'Available' },
  { id: 'd2e3f4a5-b6c7-8901-defa-012345600022', name: 'Nets vs 76ers', groupId: 'nba-season-2025', typeId: 'basketball', sportType: 'Basketball', date: 'Jan 15, 2026', venue: 'Barclays Center, Brooklyn', status: 'Available' },
  { id: 'e3f4a5b6-c7d8-9012-efab-123456700023', name: 'Super Bowl LX', groupId: 'nfl-season-2025', typeId: 'american-football', sportType: 'American Football', date: 'Feb 8, 2026', venue: 'Levi\'s Stadium, Santa Clara', status: 'Available' },
  { id: 'f4a5b6c7-d8e9-0123-fabc-234567800024', name: 'Cowboys vs Eagles', groupId: 'nfl-season-2025', typeId: 'american-football', sportType: 'American Football', date: 'Dec 28, 2025', venue: 'AT&T Stadium, Arlington', status: 'Available' },
  { id: 'a5b6c7d8-e9f0-1234-abcd-345678900025', name: '1st Test - Day 1', groupId: 'ashes-2025', typeId: 'cricket', sportType: 'Cricket', date: 'Jun 18, 2026', venue: 'Lord\'s, London', status: 'Available' },
  { id: 'b6c7d8e9-f0a1-2345-bcde-456789000026', name: '2nd Test - Day 1', groupId: 'ashes-2025', typeId: 'cricket', sportType: 'Cricket', date: 'Jul 2, 2026', venue: 'Edgbaston, Birmingham', status: 'Available' }
].map((fixture) => ({ ...fixture, shortId: getFixtureShortId(fixture.id) }));

const recentlyImported = [
  { name: 'Manchester Derby', groupId: 'premier-league-2025', sport: 'Football', importDate: 'Nov 10, 2025', titleId: '1698332', venue: 'Old Trafford, Manchester', importedBy: 'admin@sky.uk' },
  { name: 'Wimbledon Finals', groupId: 'grand-slam-2025', sport: 'Tennis', importDate: 'Nov 8, 2025', titleId: '1638382', venue: 'All England Club, London', importedBy: 'admin@sky.uk' },
  { name: 'Champions League Final', groupId: 'champions-league-2025', sport: 'Football', importDate: 'Nov 7, 2025', titleId: '1674259', venue: 'Allianz Arena, Munich', importedBy: 'admin@sky.uk' },
  { name: 'Monaco GP - Qualifying', groupId: 'f1-monaco-gp-2025', sport: 'Motor Sport', importDate: 'Nov 5, 2025', titleId: '1619047', venue: 'Circuit de Monaco, Monte Carlo', importedBy: 'system@sky.uk' }
];

const subscriptions = [
  { id: 'sub-f1', fixture: 'F1 Grand Prix', type: 'MotorSport', subscribed: 'Sep 20, 2023', autoImport: 'Enabled', activityLabel: '23 updates', activityKey: 'F1' },
  { id: 'sub-nba', fixture: 'NBA Finals', type: 'Basketball', subscribed: 'Aug 30, 2023', autoImport: 'Enabled', activityLabel: '15 updates', activityKey: 'NBA' },
  { id: 'sub-pl', fixture: 'Premier League', type: 'Football', subscribed: 'Jul 15, 2023', autoImport: 'Disabled', activityLabel: '41 updates', activityKey: 'PL' }
];

const activityLog = [
  { id: 1, timestamp: 'Nov 13, 2025 14:23', action: 'Import', actionBadge: 'badge-blue', fixture: 'Manchester Derby', user: 'admin@sky.uk', status: 'Success', statusBadge: 'badge-green' },
  { id: 2, timestamp: 'Nov 13, 2025 13:15', action: 'Auto Update', actionBadge: 'badge-indigo', fixture: 'F1 Grand Prix - Monaco', user: 'System', status: 'Success', statusBadge: 'badge-green' },
  { id: 3, timestamp: 'Nov 13, 2025 12:08', action: 'Import', actionBadge: 'badge-blue', fixture: 'Wimbledon Finals', user: 'admin@sky.uk', status: 'Success', statusBadge: 'badge-green' },
  { id: 4, timestamp: 'Nov 13, 2025 10:45', action: 'Subscribe', actionBadge: 'badge-amber', fixture: 'NBA Eastern Finals', user: 'admin@sky.uk', status: 'Success', statusBadge: 'badge-green' },
  { id: 5, timestamp: 'Nov 12, 2025 16:30', action: 'Unsubscribe', actionBadge: 'badge-red', fixture: 'Champions League', user: 'user@sky.uk', status: 'Success', statusBadge: 'badge-green' }
];

export const mockData = {
  sportTypes,
  dashboardStats,
  fixtureGroups,
  importableFixtures,
  recentlyImported,
  subscriptions,
  activityLog
};

