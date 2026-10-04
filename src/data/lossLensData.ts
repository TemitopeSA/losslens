// Centralized mock data for the LossLens prototype.
// Every screen reads from this module so the Acme Freight story stays consistent.

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type ReasonKey = 'price' | 'integration' | 'implementation' | 'no-decision' | 'features'
export type Competitor = 'Spendwise' | 'Paystack Pro' | 'Built in-house'
export type Segment = 'Enterprise' | 'Mid-market' | 'Growth'
export type Owner = 'Jordan Lee' | 'Priya Shah' | 'Marcus Chen' | 'Elena Ruiz'

export interface LostDeal {
  id: string
  account: string
  amount: number
  segment: Segment
  competitor: Competitor
  owner: Owner
  crmReason: ReasonKey
  interviewReason: ReasonKey
  contact: string
  contactRole: string
  closedOn: string
  daysToInsight: number
  citesNetSuite: boolean
  interviewStatus: 'Completed' | 'Scheduled' | 'Invited'
}

export interface Citation {
  id: string
  interviewId: string
  account: string
  t: number
  label: string
  quote: string
  speakerRole: string
}

export interface TranscriptLine {
  t: number
  speaker: 'Moderator' | 'Participant'
  text: string
  key?: boolean
}

export interface Highlight {
  id: string
  label: string
  t: number
  kind: 'primary' | 'surface' | 'competitor' | 'theme'
  quote: string
}

export interface Insight {
  id: string
  headline: string
  quote: string
  role: string
  account: string
  amount: number
  competitor?: Competitor
  citationId: string
  dealsCited: number
}

export interface TriggerCondition {
  id: string
  field: string
  operator: string
  value: string
}

export type TourPlacement = 'right' | 'left' | 'bottom' | 'top'

/* ------------------------------------------------------------------ */
/* Workspace                                                           */
/* ------------------------------------------------------------------ */

export const workspace = {
  name: 'Ledgerly',
  tagline: 'B2B spend management',
  user: { name: 'Riley Morgan', initials: 'RM', role: 'Head of Research' },
}

export const reasonLabels: Record<ReasonKey, string> = {
  price: 'Price',
  integration: 'Missing integration',
  implementation: 'Implementation effort',
  'no-decision': 'No decision',
  features: 'Features',
}
export const reasonOrder: ReasonKey[] = ['price', 'integration', 'implementation', 'no-decision', 'features']

/* ------------------------------------------------------------------ */
/* The hero deal                                                       */
/* ------------------------------------------------------------------ */

export const acmeDeal = {
  id: 'acme-freight',
  account: 'Acme Freight',
  amount: 84000,
  stage: 'Closed Lost',
  crmReason: 'Price',
  owner: 'Jordan Lee',
  ownerSlack: '@jordan.lee',
  participant: 'Dana Okafor',
  participantRole: 'VP Finance',
  actualReason: 'Missing NetSuite integration',
  competitor: 'Spendwise' as Competitor,
  closedOn: 'Sep 12, 2026',
  invitedOn: 'Sep 15, 2026',
  interviewedOn: 'Sep 16, 2026',
  opportunityId: '0068c00000Qx7LmAAJ',
  duration: 872, // 14m 32s
  durationLabel: '14m 32s',
  incentive: 75,
}

/* ------------------------------------------------------------------ */
/* Lost deals (last 90 days, interviewed)                              */
/* Totals: 17 deals · $1.42M · 9 Spendwise / 5 Paystack Pro / 3 in-house */
/* ------------------------------------------------------------------ */

export const lostDeals: LostDeal[] = [
  { id: 'acme-freight', account: 'Acme Freight', amount: 84000, segment: 'Mid-market', competitor: 'Spendwise', owner: 'Jordan Lee', crmReason: 'price', interviewReason: 'integration', contact: 'Dana Okafor', contactRole: 'VP Finance', closedOn: 'Sep 12', daysToInsight: 4, citesNetSuite: true, interviewStatus: 'Completed' },
  { id: 'northwind', account: 'Northwind Logistics', amount: 92000, segment: 'Enterprise', competitor: 'Spendwise', owner: 'Jordan Lee', crmReason: 'price', interviewReason: 'integration', contact: 'Marcus Webb', contactRole: 'Controller', closedOn: 'Aug 28', daysToInsight: 3, citesNetSuite: true, interviewStatus: 'Completed' },
  { id: 'harbor-health', account: 'Harbor Health', amount: 68000, segment: 'Mid-market', competitor: 'Spendwise', owner: 'Priya Shah', crmReason: 'price', interviewReason: 'integration', contact: 'Aisha Grant', contactRole: 'Director of Finance', closedOn: 'Aug 19', daysToInsight: 5, citesNetSuite: true, interviewStatus: 'Completed' },
  { id: 'orbit-retail', account: 'Orbit Retail', amount: 56000, segment: 'Growth', competitor: 'Spendwise', owner: 'Priya Shah', crmReason: 'price', interviewReason: 'integration', contact: 'Tomás Rivera', contactRole: 'Head of Finance', closedOn: 'Sep 3', daysToInsight: 4, citesNetSuite: true, interviewStatus: 'Completed' },
  { id: 'tidewater', account: 'Tidewater Supply', amount: 40000, segment: 'Growth', competitor: 'Spendwise', owner: 'Marcus Chen', crmReason: 'price', interviewReason: 'integration', contact: 'Hannah Cole', contactRole: 'Finance Manager', closedOn: 'Jul 30', daysToInsight: 6, citesNetSuite: true, interviewStatus: 'Completed' },
  { id: 'juniper-labs', account: 'Juniper Labs', amount: 172000, segment: 'Enterprise', competitor: 'Paystack Pro', owner: 'Priya Shah', crmReason: 'integration', interviewReason: 'integration', contact: 'Owen Park', contactRole: 'CFO', closedOn: 'Aug 7', daysToInsight: 3, citesNetSuite: false, interviewStatus: 'Completed' },
  { id: 'crestline', account: 'Crestline Foods', amount: 48000, segment: 'Growth', competitor: 'Spendwise', owner: 'Marcus Chen', crmReason: 'price', interviewReason: 'implementation', contact: 'Lena Fischer', contactRole: 'Controller', closedOn: 'Aug 22', daysToInsight: 4, citesNetSuite: true, interviewStatus: 'Completed' },
  { id: 'bramble', account: 'Bramble Health', amount: 128000, segment: 'Enterprise', competitor: 'Built in-house', owner: 'Marcus Chen', crmReason: 'implementation', interviewReason: 'implementation', contact: 'Rachel Adeyemi', contactRole: 'VP Operations', closedOn: 'Jul 24', daysToInsight: 7, citesNetSuite: false, interviewStatus: 'Completed' },
  { id: 'kestrel', account: 'Kestrel Energy', amount: 100000, segment: 'Enterprise', competitor: 'Paystack Pro', owner: 'Elena Ruiz', crmReason: 'no-decision', interviewReason: 'implementation', contact: 'Victor Hale', contactRole: 'Director of FP&A', closedOn: 'Aug 14', daysToInsight: 5, citesNetSuite: false, interviewStatus: 'Completed' },
  { id: 'halcyon', account: 'Halcyon Media', amount: 110000, segment: 'Enterprise', competitor: 'Spendwise', owner: 'Jordan Lee', crmReason: 'features', interviewReason: 'features', contact: 'Grace Liu', contactRole: 'Finance Director', closedOn: 'Sep 1', daysToInsight: 3, citesNetSuite: false, interviewStatus: 'Completed' },
  { id: 'pinecrest', account: 'Pinecrest Bank', amount: 96000, segment: 'Enterprise', competitor: 'Paystack Pro', owner: 'Priya Shah', crmReason: 'features', interviewReason: 'features', contact: 'Daniel Osei', contactRole: 'Director of Operations', closedOn: 'Aug 11', daysToInsight: 4, citesNetSuite: false, interviewStatus: 'Completed' },
  { id: 'vantage', account: 'Vantage Robotics', amount: 74000, segment: 'Mid-market', competitor: 'Built in-house', owner: 'Elena Ruiz', crmReason: 'features', interviewReason: 'features', contact: 'Sofia Marin', contactRole: 'Head of Procurement', closedOn: 'Jul 18', daysToInsight: 2, citesNetSuite: false, interviewStatus: 'Completed' },
  { id: 'lumen', account: 'Lumen Dental', amount: 58000, segment: 'Growth', competitor: 'Spendwise', owner: 'Elena Ruiz', crmReason: 'no-decision', interviewReason: 'features', contact: 'Imani Brooks', contactRole: 'Practice Finance Lead', closedOn: 'Sep 8', daysToInsight: 5, citesNetSuite: false, interviewStatus: 'Completed' },
  { id: 'sable', account: 'Sable Outdoor', amount: 88000, segment: 'Mid-market', competitor: 'Paystack Pro', owner: 'Jordan Lee', crmReason: 'price', interviewReason: 'price', contact: 'Chris Yamada', contactRole: 'CFO', closedOn: 'Aug 2', daysToInsight: 3, citesNetSuite: false, interviewStatus: 'Completed' },
  { id: 'meridian', account: 'Meridian Travel', amount: 74000, segment: 'Mid-market', competitor: 'Spendwise', owner: 'Elena Ruiz', crmReason: 'price', interviewReason: 'price', contact: 'Noah Bennett', contactRole: 'VP Finance', closedOn: 'Sep 5', daysToInsight: 4, citesNetSuite: false, interviewStatus: 'Completed' },
  { id: 'ferro', account: 'Ferro Analytics', amount: 70000, segment: 'Mid-market', competitor: 'Built in-house', owner: 'Jordan Lee', crmReason: 'no-decision', interviewReason: 'no-decision', contact: 'Priyanka Rao', contactRole: 'Head of FP&A', closedOn: 'Jul 27', daysToInsight: 6, citesNetSuite: false, interviewStatus: 'Completed' },
  { id: 'quill', account: 'Quill & Co', amount: 62000, segment: 'Growth', competitor: 'Paystack Pro', owner: 'Marcus Chen', crmReason: 'no-decision', interviewReason: 'no-decision', contact: 'Ben Ashford', contactRole: 'Operations Lead', closedOn: 'Aug 30', daysToInsight: 4, citesNetSuite: false, interviewStatus: 'Completed' },
]

/** Pending deals in the pipeline: invited or scheduled, not yet interviewed. */
export const pendingDeals = [
  { account: 'Granite Payroll', amount: 46000, owner: 'Priya Shah', contact: 'Ivy Chen', role: 'Controller', status: 'Scheduled' as const, closedOn: 'Sep 29' },
  { account: 'Copperline Labs', amount: 112000, owner: 'Jordan Lee', contact: 'Felix Grant', role: 'VP Finance', status: 'Invited' as const, closedOn: 'Oct 1' },
  { account: 'Atlas Freightworks', amount: 18000, owner: 'Elena Ruiz', contact: 'Mia Novak', role: 'Finance Manager', status: 'Owner hold' as const, closedOn: 'Oct 2' },
]

/* ------------------------------------------------------------------ */
/* Dashboard aggregates                                                */
/* ------------------------------------------------------------------ */

export const dashboardBaseline = {
  dealsReviewed: 17,
  pipelineLost: 1420000,
  responseRate: 45,
  medianDaysToInsight: 4,
  /** Share of reviewed losses (last 90 days). */
  reasonComparison: [
    { key: 'price' as ReasonKey, crm: 46, interview: 12 },
    { key: 'integration' as ReasonKey, crm: 8, interview: 35 },
    { key: 'implementation' as ReasonKey, crm: 6, interview: 18 },
    { key: 'no-decision' as ReasonKey, crm: 22, interview: 12 },
    { key: 'features' as ReasonKey, crm: 18, interview: 23 },
  ],
}

export const filterOptions = {
  segment: ['All segments', 'Enterprise', 'Mid-market', 'Growth'],
  size: ['Any deal size', '$10k–$50k', '$50k–$100k', '$100k+'],
  competitor: ['All competitors', 'Spendwise', 'Paystack Pro', 'Built in-house'],
  owner: ['All owners', 'Jordan Lee', 'Priya Shah', 'Marcus Chen', 'Elena Ruiz'],
  range: ['Last 90 days', 'Last 30 days', 'This quarter'],
}

/* ------------------------------------------------------------------ */
/* Salesforce integration                                              */
/* ------------------------------------------------------------------ */

export const salesforce = {
  org: 'ledgerly.my.salesforce.com',
  connectedBy: 'Riley Morgan',
  connectedOn: 'Jun 4, 2026',
  lastSync: '2 min ago',
  objects: ['Opportunity', 'Contact', 'Account'],
  fieldMappings: [
    { gq: 'Candidate · Email', sf: 'Contact.Email', direction: 'Read' },
    { gq: 'Candidate · Name', sf: 'Contact.Name', direction: 'Read' },
    { gq: 'Candidate · Job title', sf: 'Contact.Title', direction: 'Read' },
    { gq: 'Candidate · Company', sf: 'Account.Name', direction: 'Read' },
    { gq: 'Deal · Amount', sf: 'Opportunity.Amount', direction: 'Read' },
    { gq: 'Deal · CRM loss reason', sf: 'Opportunity.Loss_Reason__c', direction: 'Read' },
    { gq: 'Deal · Owner', sf: 'Opportunity.Owner', direction: 'Read' },
    { gq: 'Interview status', sf: 'Opportunity.Interview_Status__c', direction: 'Write' },
    { gq: 'Primary loss reason (interview)', sf: 'Opportunity.GQ_Primary_Loss_Reason__c', direction: 'Write' },
  ],
  activity: [
    { when: 'Sep 16, 4:12 PM', text: 'Wrote GQ_Primary_Loss_Reason__c on Acme Freight' },
    { when: 'Sep 15, 9:00 AM', text: 'Invited Dana Okafor (Acme Freight) to Win/Loss — Always-on' },
    { when: 'Sep 14, 9:02 AM', text: 'Owner veto window closed for Acme Freight — no hold' },
    { when: 'Sep 12, 5:41 PM', text: 'Acme Freight qualified: Closed Lost · $84,000 · New business' },
    { when: 'Sep 10, 11:20 AM', text: 'Atlas Freightworks skipped: Amount below $10,000 threshold' },
  ],
}

export const triggerFieldOptions: Record<string, { operators: string[]; values?: string[] }> = {
  'Opportunity Stage': { operators: ['=', '≠'], values: ['Closed Lost', 'Closed Won', 'Negotiation'] },
  Amount: { operators: ['≥', '≤', '='] },
  Type: { operators: ['≠', '='], values: ['Renewal', 'New business', 'Expansion'] },
  'Lead source': { operators: ['=', '≠'], values: ['Outbound', 'Inbound', 'Partner'] },
  Region: { operators: ['=', '≠'], values: ['North America', 'EMEA', 'APAC'] },
}

export const defaultConditions: TriggerCondition[] = [
  { id: 'c1', field: 'Opportunity Stage', operator: '=', value: 'Closed Lost' },
  { id: 'c2', field: 'Amount', operator: '≥', value: '10000' },
  { id: 'c3', field: 'Type', operator: '≠', value: 'Renewal' },
]

export const incentiveWallet = {
  balance: 4850,
  monthlyCap: 2000,
  spentThisMonth: 825,
  perInterview: 75,
  rewardType: 'Gift card',
  recent: [
    { name: 'Dana Okafor', company: 'Acme Freight', study: 'Win/Loss — Always-on', amount: 75, date: 'Sep 16', status: 'Delivered' },
    { name: 'Lumen Dental participant', company: 'Lumen Dental', study: 'Win/Loss — Always-on', amount: 75, date: 'Sep 13', status: 'Delivered' },
    { name: 'Noah Bennett', company: 'Meridian Travel', study: 'Win/Loss — Always-on', amount: 75, date: 'Sep 9', status: 'Delivered' },
    { name: 'Kai Rowe', company: 'Ledgerly customer', study: 'Approvals usability test', amount: 50, date: 'Sep 8', status: 'Delivered' },
    { name: 'Orbit Retail participant', company: 'Orbit Retail', study: 'Win/Loss — Always-on', amount: 75, date: 'Sep 7', status: 'Delivered' },
    { name: 'Halcyon Media participant', company: 'Halcyon Media', study: 'Win/Loss — Always-on', amount: 75, date: 'Sep 4', status: 'Claim pending' },
  ],
}

/* ------------------------------------------------------------------ */
/* Studies                                                             */
/* ------------------------------------------------------------------ */

export const alwaysOnStudy = {
  id: 'win-loss-always-on',
  title: 'Win/Loss — Always-on',
  method: 'AI moderated interview',
  invited: 38,
  completed: 17,
  responseRate: 45,
  goal: 'Understand the real reasons we lose deals, beyond the CRM loss reason.',
  guide: [
    'Walk me through what happened from the first conversation to your final decision.',
    'What mattered most as you evaluated your options?',
    'What alternatives did you seriously consider?',
    'And then what happened?',
    'What did you choose instead, and what tipped it?',
    'Looking back, what could have changed your decision?',
  ],
  flexibilityLabels: ['Scripted', 'Guided', 'Balanced', 'Probing', 'Exploratory'],
  lengthMinutes: 15,
  language: 'English',
}

export const studies = [
  { id: 'win-loss-always-on', title: 'Win/Loss — Always-on', method: 'AI moderated interview', status: 'Live', participants: '17 / 38', owner: 'Riley Morgan', updated: 'Today' },
  { id: 'approvals-usability', title: 'Approvals workflow usability test', method: 'Unmoderated test', status: 'Live', participants: '22 / 30', owner: 'Sam Ortiz', updated: 'Yesterday' },
  { id: 'onboarding-diary', title: 'First 30 days onboarding diary', method: 'Diary study', status: 'Draft', participants: '0 / 12', owner: 'Riley Morgan', updated: 'Sep 28' },
  { id: 'card-controls', title: 'Card controls concept interviews', method: 'Interview', status: 'Closed', participants: '9 / 9', owner: 'Ana Silva', updated: 'Sep 2' },
  { id: 'pricing-survey', title: 'Pricing page comprehension survey', method: 'Survey', status: 'Closed', participants: '214 / 250', owner: 'Sam Ortiz', updated: 'Aug 19' },
]

/* ------------------------------------------------------------------ */
/* Interview: Acme Freight                                             */
/* ------------------------------------------------------------------ */

export const transcript: TranscriptLine[] = [
  { t: 0, speaker: 'Moderator', text: "Thanks for making time, Dana. This is a confidential conversation about a recent software decision your team made. There are no right or wrong answers. Ready to start?" },
  { t: 14, speaker: 'Participant', text: 'Sure, happy to.' },
  { t: 21, speaker: 'Moderator', text: 'Walk me through what happened from the first conversation to your final decision.' },
  { t: 34, speaker: 'Participant', text: 'We started looking in March. Card spend was all over the place — reimbursements in spreadsheets, approvals over email. We shortlisted three tools and ran demos in April.' },
  { t: 82, speaker: 'Moderator', text: 'Who was involved in the evaluation?' },
  { t: 89, speaker: 'Participant', text: 'Me, our controller Sam, and someone from IT for the security review. I owned the budget.' },
  { t: 130, speaker: 'Moderator', text: 'What mattered most as you evaluated your options?' },
  { t: 138, speaker: 'Participant', text: "Month-end close. If a tool didn't make close faster, it wasn't worth the change management." },
  { t: 185, speaker: 'Moderator', text: 'What alternatives did you seriously consider?' },
  { t: 192, speaker: 'Participant', text: 'Ledgerly, Spendwise, and briefly Paystack Pro. Paystack dropped out early on card controls.' },
  { t: 242, speaker: 'Moderator', text: 'How did the two finalists compare in the demos?' },
  { t: 249, speaker: 'Participant', text: "Ledgerly's approval flows were honestly the nicest we saw. The team liked the mobile app too." },
  { t: 291, speaker: 'Moderator', text: 'And then what happened?' },
  { t: 298, speaker: 'Participant', text: 'We had pricing conversations with both. Spendwise came in a bit higher per seat, Ledgerly a bit lower.' },
  { t: 330, speaker: 'Moderator', text: 'What did you choose instead, and what tipped it?' },
  { t: 341, speaker: 'Participant', text: 'We went with Spendwise.' },
  { t: 348, speaker: 'Participant', text: 'Honestly, it came down to price.', key: true },
  { t: 372, speaker: 'Moderator', text: 'What happened right before price became the deciding factor?', key: true },
  { t: 384, speaker: 'Participant', text: "Our finance team needed a native NetSuite sync. Spendwise had it, and with Ledgerly we'd have had to do extra implementation work. That made Ledgerly feel expensive.", key: true },
  { t: 425, speaker: 'Moderator', text: 'Can you say more about the extra implementation work?' },
  { t: 434, speaker: 'Participant', text: "The suggestion was a CSV export plus a middleware connector. Sam estimated four to six weeks of mapping and testing, plus a contractor. Once you add that, the cheaper licence wasn't cheaper." },
  { t: 500, speaker: 'Moderator', text: 'Did the sales team know NetSuite was a requirement?' },
  { t: 507, speaker: 'Participant', text: "I mentioned it on the first call, but I don't think it registered as a dealbreaker. It became one when Sam read the integration doc." },
  { t: 580, speaker: 'Moderator', text: 'Looking back, what could have changed your decision?' },
  { t: 588, speaker: 'Participant', text: "A native sync, even a beta. Or a fixed-fee implementation that took the risk off us. We'd have paid more if the NetSuite piece just worked." },
  { t: 662, speaker: 'Moderator', text: "Is there anything else you'd want the team to hear?" },
  { t: 670, speaker: 'Participant', text: "The product is good. Don't read this as a price problem — it was an integration problem that showed up as price." },
  { t: 725, speaker: 'Moderator', text: 'How confident are you that a native sync would have changed the outcome?' },
  { t: 734, speaker: 'Participant', text: "Very. It was the one thing Sam wouldn't compromise on." },
  { t: 820, speaker: 'Moderator', text: "That's really helpful, Dana. Thank you. Your $75 thank-you will arrive by email." },
  { t: 838, speaker: 'Participant', text: 'Thanks — good luck with it.' },
]

export const acmeHighlights: Highlight[] = [
  { id: 'h-price', label: 'Price (surface)', t: 348, kind: 'surface', quote: 'Honestly, it came down to price.' },
  { id: 'h-integration', label: 'Integration gap', t: 384, kind: 'primary', quote: 'Our finance team needed a native NetSuite sync.' },
  { id: 'h-spendwise', label: 'Competitor: Spendwise', t: 384, kind: 'competitor', quote: 'Spendwise had it, and with Ledgerly we’d have had to do extra implementation work.' },
  { id: 'h-impl', label: 'Implementation effort', t: 434, kind: 'theme', quote: "Once you add that, the cheaper licence wasn't cheaper." },
]

export const acmeSummary = {
  text: 'Although the CRM recorded price as the loss reason, the buyer described a missing native NetSuite integration as the deciding factor. The expected implementation work increased perceived cost, while Spendwise offered the integration natively.',
  citations: ['acme-0548', 'acme-0612', 'acme-0624'],
}

/* ------------------------------------------------------------------ */
/* Citations / evidence                                                */
/* ------------------------------------------------------------------ */

export const citations: Record<string, Citation> = {
  'acme-0548': { id: 'acme-0548', interviewId: 'acme-freight', account: 'Acme Freight', t: 348, label: 'Acme Freight, 05:48', quote: 'Honestly, it came down to price.', speakerRole: 'VP Finance' },
  'acme-0612': { id: 'acme-0612', interviewId: 'acme-freight', account: 'Acme Freight', t: 372, label: 'Acme Freight, 06:12', quote: 'What happened right before price became the deciding factor?', speakerRole: 'AI moderator' },
  'acme-0624': { id: 'acme-0624', interviewId: 'acme-freight', account: 'Acme Freight', t: 384, label: 'Acme Freight, 06:24', quote: "Our finance team needed a native NetSuite sync. Spendwise had it, and with Ledgerly we'd have had to do extra implementation work.", speakerRole: 'VP Finance' },
  'acme-0714': { id: 'acme-0714', interviewId: 'acme-freight', account: 'Acme Freight', t: 434, label: 'Acme Freight, 07:14', quote: "Once you add that, the cheaper licence wasn't cheaper.", speakerRole: 'VP Finance' },
  'acme-0948': { id: 'acme-0948', interviewId: 'acme-freight', account: 'Acme Freight', t: 588, label: 'Acme Freight, 09:48', quote: "We'd have paid more if the NetSuite piece just worked.", speakerRole: 'VP Finance' },
  'northwind-0840': { id: 'northwind-0840', interviewId: 'northwind', account: 'Northwind Logistics', t: 520, label: 'Northwind Logistics, 08:40', quote: 'Spendwise plugged straight into NetSuite. Our close process lives there, so that was the deal.', speakerRole: 'Controller' },
  'harbor-0415': { id: 'harbor-0415', interviewId: 'harbor-health', account: 'Harbor Health', t: 255, label: 'Harbor Health, 04:15', quote: 'Every vendor said "integration". Only one of them meant native sync with our GL.', speakerRole: 'Director of Finance' },
  'crestline-0532': { id: 'crestline-0532', interviewId: 'crestline', account: 'Crestline Foods', t: 332, label: 'Crestline Foods, 05:32', quote: 'The licence was fine. It was the six weeks of CSV mapping our controller would own.', speakerRole: 'Controller' },
  'orbit-0310': { id: 'orbit-0310', interviewId: 'orbit-retail', account: 'Orbit Retail', t: 190, label: 'Orbit Retail, 03:10', quote: 'We would have needed a contractor for the NetSuite side. Spendwise did it in a click.', speakerRole: 'Head of Finance' },
  'ferro-0702': { id: 'ferro-0702', interviewId: 'ferro', account: 'Ferro Analytics', t: 422, label: 'Ferro Analytics, 07:02', quote: 'We never got IT and finance in the same room, so nobody could own the switch.', speakerRole: 'Head of FP&A' },
  'pinecrest-0605': { id: 'pinecrest-0605', interviewId: 'pinecrest', account: 'Pinecrest Bank', t: 365, label: 'Pinecrest Bank, 06:05', quote: 'Paystack let branch managers set card limits themselves. That mattered for 40 branches.', speakerRole: 'Director of Operations' },
  'sable-0455': { id: 'sable-0455', interviewId: 'sable', account: 'Sable Outdoor', t: 295, label: 'Sable Outdoor, 04:55', quote: 'This one really was budget. We cut the line item entirely for the year.', speakerRole: 'CFO' },
}

export const insights: Insight[] = [
  { id: 'i-netsuite', headline: 'A missing NetSuite sync is the leading hidden loss driver', quote: "Spendwise had the native NetSuite sync. With Ledgerly, we'd have had to do extra implementation work.", role: 'VP Finance', account: 'Acme Freight', amount: 84000, competitor: 'Spendwise', citationId: 'acme-0624', dealsCited: 6 },
  { id: 'i-impl', headline: 'Implementation effort is being recorded as “price”', quote: 'The licence was fine. It was the six weeks of CSV mapping our controller would own.', role: 'Controller', account: 'Crestline Foods', amount: 48000, competitor: 'Spendwise', citationId: 'crestline-0532', dealsCited: 4 },
  { id: 'i-champion', headline: '“No decision” usually means no owner across IT and finance', quote: 'We never got IT and finance in the same room, so nobody could own the switch.', role: 'Head of FP&A', account: 'Ferro Analytics', amount: 70000, competitor: 'Built in-house', citationId: 'ferro-0702', dealsCited: 2 },
  { id: 'i-controls', headline: 'Paystack Pro wins distributed teams on delegated card controls', quote: 'Paystack let branch managers set card limits themselves. That mattered for 40 branches.', role: 'Director of Operations', account: 'Pinecrest Bank', amount: 96000, competitor: 'Paystack Pro', citationId: 'pinecrest-0605', dealsCited: 3 },
]

/* ------------------------------------------------------------------ */
/* Repository                                                          */
/* ------------------------------------------------------------------ */

export const repositoryInterviews = [
  { id: 'acme-freight', title: 'Acme Freight · Win/loss interview', participant: 'VP Finance', study: 'Win/Loss — Always-on', date: 'Sep 16', duration: '14m 32s', highlights: 4, tags: ['Integration gap', 'Competitor: Spendwise'], summary: acmeSummary.text },
  { id: 'northwind', title: 'Northwind Logistics · Win/loss interview', participant: 'Controller', study: 'Win/Loss — Always-on', date: 'Sep 1', duration: '12m 05s', highlights: 3, tags: ['Integration gap', 'Competitor: Spendwise'], summary: 'Close process lives in NetSuite; Spendwise’s native sync removed the need for a middleware project. Pricing was described as comparable.' },
  { id: 'crestline', title: 'Crestline Foods · Win/loss interview', participant: 'Controller', study: 'Win/Loss — Always-on', date: 'Aug 26', duration: '15m 10s', highlights: 3, tags: ['Implementation effort', 'Competitor: Spendwise'], summary: 'Licence cost acceptable; the estimated six weeks of CSV mapping owned by a one-person finance team made Ledgerly the riskier option.' },
  { id: 'pinecrest', title: 'Pinecrest Bank · Win/loss interview', participant: 'Director of Operations', study: 'Win/Loss — Always-on', date: 'Aug 15', duration: '13m 48s', highlights: 2, tags: ['Features', 'Competitor: Paystack Pro'], summary: 'Delegated card controls for 40 branch managers were the deciding capability. Ledgerly’s centralized approvals were seen as a bottleneck.' },
  { id: 'ferro', title: 'Ferro Analytics · Win/loss interview', participant: 'Head of FP&A', study: 'Win/Loss — Always-on', date: 'Aug 2', duration: '11m 22s', highlights: 2, tags: ['No decision', 'Built in-house'], summary: 'No single owner across IT and finance; the team defaulted to extending internal spreadsheets rather than running a migration.' },
  { id: 'approvals-kai', title: 'Approvals usability · Session 14', participant: 'AP Specialist', study: 'Approvals workflow usability test', date: 'Sep 8', duration: '24m 40s', highlights: 5, tags: ['Usability', 'Approvals'], summary: 'Participant completed multi-step approval routing but missed the delegate option twice; recommends surfacing delegation in the approval drawer.' },
]

export const reelClips = [
  { id: 'r1', account: 'Acme Freight', label: 'Native NetSuite sync tipped the decision', t: 384, length: '0:38' },
  { id: 'r2', account: 'Northwind Logistics', label: 'Close process lives in NetSuite', t: 520, length: '0:24' },
  { id: 'r3', account: 'Crestline Foods', label: 'Six weeks of CSV mapping', t: 332, length: '0:31' },
  { id: 'r4', account: 'Orbit Retail', label: 'Would have needed a contractor', t: 190, length: '0:19' },
  { id: 'r5', account: 'Acme Freight', label: '“We’d have paid more if it just worked”', t: 588, length: '0:22' },
]

/* ------------------------------------------------------------------ */
/* Candidates                                                          */
/* ------------------------------------------------------------------ */

export const candidates = [
  { name: 'Dana Okafor', title: 'VP Finance', company: 'Acme Freight', source: 'Salesforce', lastStudy: 'Win/Loss — Always-on', status: 'Completed', lastContact: 'Sep 16' },
  { name: 'Marcus Webb', title: 'Controller', company: 'Northwind Logistics', source: 'Salesforce', lastStudy: 'Win/Loss — Always-on', status: 'Completed', lastContact: 'Sep 1' },
  { name: 'Felix Grant', title: 'VP Finance', company: 'Copperline Labs', source: 'Salesforce', lastStudy: 'Win/Loss — Always-on', status: 'Invited', lastContact: 'Oct 4' },
  { name: 'Ivy Chen', title: 'Controller', company: 'Granite Payroll', source: 'Salesforce', lastStudy: 'Win/Loss — Always-on', status: 'Scheduled', lastContact: 'Oct 2' },
  { name: 'Kai Rowe', title: 'AP Specialist', company: 'Ledgerly customer', source: 'Product signup', lastStudy: 'Approvals usability test', status: 'Completed', lastContact: 'Sep 8' },
  { name: 'Lena Fischer', title: 'Controller', company: 'Crestline Foods', source: 'Salesforce', lastStudy: 'Win/Loss — Always-on', status: 'Completed', lastContact: 'Aug 26' },
  { name: 'Ana Duarte', title: 'Finance Ops Lead', company: 'Ledgerly customer', source: 'Panel', lastStudy: 'Card controls concept', status: 'Completed', lastContact: 'Sep 2' },
  { name: 'Mia Novak', title: 'Finance Manager', company: 'Atlas Freightworks', source: 'Salesforce', lastStudy: '—', status: 'Do not contact', lastContact: '—' },
]

/* ------------------------------------------------------------------ */
/* Ask AI                                                              */
/* ------------------------------------------------------------------ */

export type AnswerRun = { text: string; bold?: boolean } | { cite: string }
export interface AnswerBlock {
  kind: 'p' | 'item' | 'rec'
  num?: number
  runs: AnswerRun[]
}
export interface ScriptedAnswer {
  id: string
  match: string[]
  question: string
  blocks: AnswerBlock[]
  sources: string
}

export const seedQuestion = 'Why did we lose to Spendwise this quarter, and what should product prioritise?'

export const scriptedAnswers: ScriptedAnswer[] = [
  {
    id: 'spendwise',
    match: ['spendwise', 'prioriti', 'lose to'],
    question: seedQuestion,
    sources: '9 Spendwise losses · 9 interviews · 23 highlights',
    blocks: [
      { kind: 'p', runs: [{ text: 'Across 9 deals lost to Spendwise in the last 90 days, buyers point to three connected reasons:' }] },
      { kind: 'item', num: 1, runs: [{ text: 'Integration gap.', bold: true }, { text: ' Buyers repeatedly needed a native NetSuite integration; Spendwise offered one out of the box. ' }, { cite: 'acme-0624' }, { cite: 'northwind-0840' }] },
      { kind: 'item', num: 2, runs: [{ text: 'Implementation burden.', bold: true }, { text: ' Extra setup (CSV exports, middleware, contractors) increased the perceived cost of choosing Ledgerly, which sales recorded as “price”. ' }, { cite: 'acme-0612' }, { cite: 'crestline-0532' }] },
      { kind: 'item', num: 3, runs: [{ text: 'Competitive disadvantage.', bold: true }, { text: ' Spendwise was better aligned with existing finance workflows, so month-end close stayed in the GL buyers already trusted. ' }, { cite: 'harbor-0415' }] },
      { kind: 'rec', runs: [{ text: 'Recommendation: ', bold: true }, { text: 'Ship native NetSuite sync — cited in 6 of 9 Spendwise losses ($388k).', bold: true }] },
    ],
  },
  {
    id: 'netsuite-deals',
    match: ['netsuite', 'which deals', 'integration'],
    question: 'Which lost deals mentioned NetSuite?',
    sources: '17 interviews searched · 6 matches',
    blocks: [
      { kind: 'p', runs: [{ text: '6 lost deals cite NetSuite, totalling ' }, { text: '$388k', bold: true }, { text: '. All six chose Spendwise.' }] },
      { kind: 'item', num: 1, runs: [{ text: 'Northwind Logistics', bold: true }, { text: ' · $92k · Controller ' }, { cite: 'northwind-0840' }] },
      { kind: 'item', num: 2, runs: [{ text: 'Acme Freight', bold: true }, { text: ' · $84k · VP Finance ' }, { cite: 'acme-0624' }] },
      { kind: 'item', num: 3, runs: [{ text: 'Harbor Health', bold: true }, { text: ' · $68k · Director of Finance ' }, { cite: 'harbor-0415' }] },
      { kind: 'item', num: 4, runs: [{ text: 'Orbit Retail', bold: true }, { text: ' · $56k · Head of Finance ' }, { cite: 'orbit-0310' }] },
      { kind: 'item', num: 5, runs: [{ text: 'Crestline Foods', bold: true }, { text: ' · $48k · Controller ' }, { cite: 'crestline-0532' }] },
      { kind: 'item', num: 6, runs: [{ text: 'Tidewater Supply', bold: true }, { text: ' · $40k · Finance Manager' }] },
      { kind: 'p', runs: [{ text: 'In all six, the CRM loss reason was recorded as Price.' }] },
    ],
  },
  {
    id: 'price',
    match: ['price', 'pricing', 'discount', 'cost'],
    question: 'Is price really why we lose?',
    sources: '17 interviews · CRM loss reasons',
    blocks: [
      { kind: 'p', runs: [{ text: 'Rarely on its own. Sales logged Price on 46% of losses, but buyers named it as the primary reason in 12%.' }] },
      { kind: 'item', num: 1, runs: [{ text: 'Price is often the first answer, not the real one.', bold: true }, { text: ' Buyers open with price, then describe integration or setup costs when probed. ' }, { cite: 'acme-0548' }, { cite: 'acme-0624' }] },
      { kind: 'item', num: 2, runs: [{ text: 'True budget losses exist but are few.', bold: true }, { text: ' Sable Outdoor cut the budget line entirely. ' }, { cite: 'sable-0455' }] },
      { kind: 'rec', runs: [{ text: 'Implication: ', bold: true }, { text: 'Discounting would not have saved most of these deals. Reducing integration and implementation cost would.' }] },
    ],
  },
  {
    id: 'prd',
    match: ['prd', 'brief', 'spec', 'draft'],
    question: 'Draft a one-paragraph brief for NetSuite sync.',
    sources: '6 interviews · 11 highlights',
    blocks: [
      { kind: 'p', runs: [{ text: 'Problem.', bold: true }, { text: ' Mid-market finance teams run month-end close in NetSuite. Without a native sync, Ledgerly requires CSV exports or middleware, which buyers estimate at four to six weeks of work. ' }, { cite: 'acme-0714' }] },
      { kind: 'p', runs: [{ text: 'Opportunity.', bold: true }, { text: ' 6 of 9 Spendwise losses ($388k in 90 days) cite the gap; buyers say they would pay more if it “just worked”. ' }, { cite: 'acme-0948' }] },
      { kind: 'p', runs: [{ text: 'Success looks like', bold: true }, { text: ' a sync configured in under a day, with approved transactions posting to the GL automatically.' }] },
    ],
  },
]

export const fallbackAnswer = (q: string): ScriptedAnswer => ({
  id: 'fallback',
  match: [],
  question: q,
  sources: 'Win/Loss — Always-on · 17 interviews',
  blocks: [
    { kind: 'p', runs: [{ text: 'This prototype answers from a fixed set of Repository evidence. The strongest pattern related to your question:' }] },
    { kind: 'item', num: 1, runs: [{ text: 'Integration and setup costs are the dominant hidden loss drivers', bold: true }, { text: ', accounting for $788k of $1.42M lost pipeline. ' }, { cite: 'acme-0624' }, { cite: 'crestline-0532' }] },
    { kind: 'p', runs: [{ text: 'Try one of the suggested questions for a fuller answer.' }] },
  ],
})

export const suggestedQuestions = [
  'Which lost deals mentioned NetSuite?',
  'Is price really why we lose?',
  'Draft a one-paragraph brief for NetSuite sync.',
]

/* ------------------------------------------------------------------ */
/* Formatting helpers                                                  */
/* ------------------------------------------------------------------ */

export const fmtTime = (s: number) => {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}
export const fmtMoney = (n: number) => '$' + n.toLocaleString('en-US')
export const fmtK = (n: number) => (n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M` : `$${Math.round(n / 1000)}k`)
