/**
 * SGPA & CGPA Calculator
 * 100% Full-Width Responsive Computation Engine
 */

const GRADE_SCALE = [
  { grade: 'O',   points: 10, min: 91, max: 100 },
  { grade: 'A+',  points: 9,  min: 81, max: 90 },
  { grade: 'A',   points: 8,  min: 71, max: 80 },
  { grade: 'B+',  points: 7,  min: 61, max: 70 },
  { grade: 'B',   points: 6,  min: 51, max: 60 },
  { grade: 'C',   points: 5,  min: 41, max: 50 },
  { grade: 'D',   points: 4,  min: 31, max: 40 },
  { grade: 'E/F', points: 0,  min: 0,  max: 30 },
];

const GRADE_POINTS_MAP = {
  'O': 10,
  'A+': 9,
  'A': 8,
  'B+': 7,
  'B': 6,
  'C': 5,
  'D': 4,
  'E/F': 0
};

const SEMESTER_DATA = {
  sem1: {
    name: 'Semester 1',
    totalCredits: 26,
    subjects: [
      { id: 'sem1_sub1', name: 'Breadth of Computer Science 1', credits: 4 },
      { id: 'sem1_sub2', name: 'Front-End Web Development', credits: 4 },
      { id: 'sem1_sub3', name: 'Problem Solving Using Programming', credits: 4 },
      { id: 'sem1_sub4', name: 'Critical Thinking 101', credits: 4 },
      { id: 'sem1_sub5', name: 'Design for Developers', credits: 3 },
      { id: 'sem1_sub6', name: 'Discrete Mathematics and Probability', credits: 4 },
      { id: 'sem1_sub7', name: 'Professional Skills for the Workplace', credits: 3 },
    ]
  },
  sem2: {
    name: 'Semester 2',
    totalCredits: 20,
    subjects: [
      { id: 'sem2_sub1', name: 'Breadth of Computer Science 2', credits: 4 },
      { id: 'sem2_sub2', name: 'Back-End Web Development', credits: 5 },
      { id: 'sem2_sub3', name: 'Databases', credits: 3 },
      { id: 'sem2_sub4', name: 'Full Stack Development', credits: 4 },
      { id: 'sem2_sub5', name: 'Learning How to Learn', credits: 4 },
    ]
  },
  sem3: {
    name: 'Semester 3',
    totalCredits: 22,
    subjects: [
      { id: 'sem3_sub1', name: 'Object Oriented Programming', credits: 3, isSpecial: false },
      { id: 'sem3_sub2', name: 'Object Oriented Programming Laboratory', credits: 1, isSpecial: false },
      { id: 'sem3_sub3', name: 'Database Management Systems', credits: 3, isSpecial: false },
      { id: 'sem3_sub4', name: 'Economics, Politics and Rural Society Development', credits: 3, isSpecial: false },
      { id: 'sem3_sub5', name: 'Integrated Work with a Partner Company-I', credits: 8, isSpecial: true },
      { id: 'sem3_sub6', name: 'Mathematical Thinking 101', credits: 4, isSpecial: false },
    ]
  }
};

const state = {
  activeTab: 'sem3',
  sem1: {},
  sem2: {},
  sem3: {},
  integratedCompact: false
};

function getAttendanceMarks(attPercent) {
  if (attPercent === null || attPercent === undefined || attPercent === '' || isNaN(parseFloat(attPercent))) return 0;
  const att = parseFloat(attPercent);
  if (att >= 90) return 5;
  if (att >= 85) return 4;
  if (att >= 80) return 3;
  if (att >= 75) return 2;
  return 0;
}

function scoreToGrade(score) {
  if (score === null || score === undefined || isNaN(score)) return null;
  const rounded = Math.round(score);
  for (const tier of GRADE_SCALE) {
    if (rounded >= tier.min && rounded <= tier.max) {
      return { grade: tier.grade, points: tier.points, score: rounded };
    }
  }
  if (rounded > 100) return { grade: 'O', points: 10, score: 100 };
  return { grade: 'E/F', points: 0, score: Math.max(0, rounded) };
}

/**
 * Standard Sem 3 Subject Evaluation
 * Evaluates strictly for the marks given (unentered CAs default to 0; no future output projections)
 * Full formula: Round( (90/5/40)*(CA1+CA2+CA3) + (90/5/60)*(CA4+CA5) + Attendance, 0 )
 * Limits: CA1, CA2, CA3 are [0, 40]; CA4, CA5 are [0, 60]; Attendance is [0, 100]
 */
function calculateStandardSem3Score(ca1, ca2, ca3, ca4, ca5, attPercent) {
  const hasC1 = ca1 !== '' && ca1 !== null && !isNaN(parseFloat(ca1));
  const hasC2 = ca2 !== '' && ca2 !== null && !isNaN(parseFloat(ca2));
  const hasC3 = ca3 !== '' && ca3 !== null && !isNaN(parseFloat(ca3));
  const hasC4 = ca4 !== '' && ca4 !== null && !isNaN(parseFloat(ca4));
  const hasC5 = ca5 !== '' && ca5 !== null && !isNaN(parseFloat(ca5));
  const hasAtt = attPercent !== '' && attPercent !== null && !isNaN(parseFloat(attPercent));

  // If no marks given at all for this subject, return null
  if (!hasC1 && !hasC2 && !hasC3 && !hasC4 && !hasC5 && !hasAtt) {
    return null;
  }

  // Any CA not given defaults to 0; enforce min 0 and max limits
  const c1 = hasC1 ? Math.min(40, Math.max(0, parseFloat(ca1))) : 0;
  const c2 = hasC2 ? Math.min(40, Math.max(0, parseFloat(ca2))) : 0;
  const c3 = hasC3 ? Math.min(40, Math.max(0, parseFloat(ca3))) : 0;
  const c4 = hasC4 ? Math.min(60, Math.max(0, parseFloat(ca4))) : 0;
  const c5 = hasC5 ? Math.min(60, Math.max(0, parseFloat(ca5))) : 0;
  const attVal = hasAtt ? Math.min(100, Math.max(0, parseFloat(attPercent))) : 0;

  const attMarks = getAttendanceMarks(attVal);
  const part1 = (90 / 5 / 40) * (c1 + c2 + c3);
  const part2 = (90 / 5 / 60) * (c4 + c5);
  const totalScore = Math.min(100, Math.max(0, Math.round(part1 + part2 + attMarks)));

  return {
    score: totalScore,
    isComplete: (hasC1 && hasC2 && hasC3 && hasC4 && hasC5 && hasAtt)
  };
}

/**
 * Integrated Work with a Partner Company-I Evaluation
 * Parameters:
 * - Attendance (25%): (Slots present / Slots counted) * 25
 * - Worklog submission (25%): (Days submitted on time / Days counted) * 25
 * - Viva (50%): ((Viva 1 + Viva 2 + Viva 3) / 3) * (50 / 25)  [each viva max 25]
 * Sum out of 100 is scaled down to 70 (* 0.7) for Kalvium WI score.
 * Remaining 30 marks come from University-Faculty Viva (max 30).
 * Missing fields default to 0; no future projections.
 */
function calculateSpecialSem3Score(slotsPresent, slotsCounted, daysPresent, daysCounted, viva1, viva2, viva3, uniViva) {
  const hasSlotsPres = slotsPresent !== '' && slotsPresent !== null && !isNaN(parseFloat(slotsPresent));
  const hasSlotsCount = slotsCounted !== '' && slotsCounted !== null && !isNaN(parseFloat(slotsCounted));
  const hasDaysPres = daysPresent !== '' && daysPresent !== null && !isNaN(parseFloat(daysPresent));
  const hasDaysCount = daysCounted !== '' && daysCounted !== null && !isNaN(parseFloat(daysCounted));
  const hasViva1 = viva1 !== '' && viva1 !== null && !isNaN(parseFloat(viva1));
  const hasViva2 = viva2 !== '' && viva2 !== null && !isNaN(parseFloat(viva2));
  const hasViva3 = viva3 !== '' && viva3 !== null && !isNaN(parseFloat(viva3));
  const hasUniViva = uniViva !== '' && uniViva !== null && !isNaN(parseFloat(uniViva));

  // If no fields entered at all, return null
  if (!hasSlotsPres && !hasSlotsCount && !hasDaysPres && !hasDaysCount && !hasViva1 && !hasViva2 && !hasViva3 && !hasUniViva) {
    return null;
  }

  // Attendance (25%): (Slots present / Slots counted) * 25
  let attendanceScore = 0;
  if (hasSlotsPres && hasSlotsCount) {
    const counted = Math.max(0, parseFloat(slotsCounted));
    if (counted > 0) {
      const present = Math.min(counted, Math.max(0, parseFloat(slotsPresent)));
      attendanceScore = (present / counted) * 25;
    }
  }

  // Worklog submission (25%): (Days submitted on time / Days counted) * 25
  let worklogScore = 0;
  if (hasDaysPres && hasDaysCount) {
    const counted = Math.max(0, parseFloat(daysCounted));
    if (counted > 0) {
      const present = Math.min(counted, Math.max(0, parseFloat(daysPresent)));
      worklogScore = (present / counted) * 25;
    }
  }

  // Viva (50%): ((Viva 1 + Viva 2 + Viva 3) / 3) * (50 / 25)
  // Each viva is out of 25 (min 0, max 25). If not given, defaults to 0.
  const v1 = hasViva1 ? Math.min(25, Math.max(0, parseFloat(viva1))) : 0;
  const v2 = hasViva2 ? Math.min(25, Math.max(0, parseFloat(viva2))) : 0;
  const v3 = hasViva3 ? Math.min(25, Math.max(0, parseFloat(viva3))) : 0;
  const vivaScore = ((v1 + v2 + v3) / 3) * (50 / 25);

  // Kalvium score out of 100
  const kalvium100 = attendanceScore + worklogScore + vivaScore;
  // Scaled down to 70
  const kalvium70 = kalvium100 * 0.7;

  // University-Faculty Viva (30 marks)
  const uniVivaScore = hasUniViva ? Math.min(30, Math.max(0, parseFloat(uniViva))) : 0;

  // Final Total Score (out of 100)
  const totalScore = Math.min(100, Math.max(0, Math.round(kalvium70 + uniVivaScore)));

  return {
    score: totalScore,
    kalvium100,
    kalvium70,
    uniVivaScore,
    attendanceScore,
    worklogScore,
    vivaScore,
    isComplete: (hasSlotsPres && hasSlotsCount && hasDaysPres && hasDaysCount && hasViva1 && hasViva2 && hasViva3 && hasUniViva)
  };
}

function renderDropdownSemester(semKey, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const sem = SEMESTER_DATA[semKey];

  container.innerHTML = sem.subjects.map(sub => {
    const savedGrade = state[semKey][sub.name] || '';

    return `
      <div class="subject-card" data-subject-id="${sub.id}">
        <div class="card-header">
          <span class="subject-name">${sub.name}</span>
          <span class="credits-badge">${sub.credits} Credits</span>
        </div>
        <div class="select-row">
          <select class="grade-select" data-sem="${semKey}" data-subject="${sub.name}" aria-label="Grade for ${sub.name}">
            <option value="">-- Select Grade --</option>
            ${GRADE_SCALE.map(g => `
              <option value="${g.grade}" ${savedGrade === g.grade ? 'selected' : ''}>
                Grade ${g.grade} (${g.points} pts)
              </option>
            `).join('')}
          </select>
          <span class="grade-badge" id="badge_${sub.id}">${savedGrade || '-'}</span>
        </div>
      </div>
    `;
  }).join('');
}

function renderSem3() {
  const container = document.getElementById('sem3SubjectsContainer');
  if (!container) return;
  const sem = SEMESTER_DATA.sem3;

  container.innerHTML = sem.subjects.map(sub => {
    const subState = state.sem3[sub.name] || {};

    if (sub.isSpecial) {
      const sp = subState.slots_present !== undefined ? subState.slots_present : '';
      const sc = subState.slots_counted !== undefined ? subState.slots_counted : '';
      const dp = subState.days_present !== undefined ? subState.days_present : '';
      const dc = subState.days_counted !== undefined ? subState.days_counted : '';
      const v1 = subState.viva1 !== undefined ? subState.viva1 : '';
      const v2 = subState.viva2 !== undefined ? subState.viva2 : '';
      const v3 = subState.viva3 !== undefined ? subState.viva3 : '';
      const uniViva = subState.uni_viva !== undefined ? subState.uni_viva : '';

      const calc = calculateSpecialSem3Score(sp, sc, dp, dc, v1, v2, v3, uniViva);
      const gradeResult = calc ? scoreToGrade(calc.score) : null;

      let scoreText = calc ? `${calc.score}/100` : '-';
      let gradeText = gradeResult ? `${gradeResult.grade} (${gradeResult.points} pts)` : '-';
      let kalviumBadge = calc ? `${calc.kalvium70.toFixed(1)} / 70` : '- / 70';
      let uniBadge = calc ? `${calc.uniVivaScore.toFixed(0)} / 30` : '- / 30';

      const FILTER_QUERY = 'subject:Thanks for filling in this form: Simulated Work Daily Journal Form effective 13th March 2026';

      const attendanceTooltip = `
        <span class="info-tooltip-wrap">
          <button type="button" class="info-icon-btn btn-open-guidelines" aria-label="Open Attendance Slot Guidelines" title="Click for full guidelines window">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </button>
          <span class="info-tooltip-box" role="tooltip">
            <strong class="tooltip-title">Attendance Slot Rules:</strong>
            <span class="tooltip-item">• <strong>Simulated Work:</strong> 3 hours a day</span>
            <span class="tooltip-item">• <strong>Internship:</strong> 5 hours a day</span>
            <span class="tooltip-item">• <strong>Mon–Fri only</strong> (Sat & Sun excluded)</span>
            <span class="tooltip-copy-hint">(Click icon for full dialog)</span>
          </span>
        </span>
      `;

      const worklogTooltip = `
        <span class="info-tooltip-wrap">
          <button type="button" class="info-icon-btn btn-open-guidelines" aria-label="Open Worklog Guidelines & Search Filter" title="Click for full guidelines window">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </button>
          <span class="info-tooltip-box" role="tooltip">
            <strong class="tooltip-title">Daily Worklog Form Rules:</strong>
            <span class="tooltip-item">• <strong>Limit:</strong> 1 form per day (Mon–Fri only)</span>
            <span class="tooltip-item">• <strong>Email Search Filter:</strong></span>
            <code class="tooltip-filter-chip">${FILTER_QUERY}</code>
            <span class="tooltip-copy-hint">(Click icon for full dialog & copy)</span>
          </span>
        </span>
      `;

      const generalTooltip = `
        <span class="info-tooltip-wrap">
          <button type="button" class="info-icon-btn btn-open-guidelines" aria-label="Open Work & Form Guidelines" title="Click for full guidelines window">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </button>
          <span class="info-tooltip-box" role="tooltip">
            <strong class="tooltip-title">Work & Daily Form Rules:</strong>
            <span class="tooltip-item">• <strong>Simulated:</strong> 3 hrs/day | <strong>Internship:</strong> 5 hrs/day</span>
            <span class="tooltip-item">• Mon–Fri only (Sat & Sun excluded)</span>
            <span class="tooltip-item">• 1 form per day counted</span>
            <span class="tooltip-copy-hint">(Click icon for full dialog)</span>
          </span>
        </span>
      `;

      return `
        <div class="subject-card special-card" data-subject-id="${sub.id}" id="specialCard_${sub.id}">
          <div class="card-header">
            <div>
              <div class="subject-title-row">
                <span class="subject-name">${sub.name}</span>
                <span class="info-tooltip-wrap">
                  <button type="button" class="info-icon-btn btn-open-guidelines" aria-label="Open Work & Journal Guidelines Dialog" title="Click to view full guidelines dialog & search filter">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                  </button>
                  <span class="info-tooltip-box" role="tooltip">
                    <strong class="tooltip-title">Work & Journal Guidelines:</strong>
                    <span class="tooltip-item">• <strong>Simulated:</strong> 3 hrs/day | <strong>Internship:</strong> 5 hrs/day</span>
                    <span class="tooltip-item">• <strong>Mon–Fri only</strong> (Sat & Sun excluded)</span>
                    <span class="tooltip-item">• <strong>Forms:</strong> 1 per day counted</span>
                    <span class="tooltip-copy-hint">(Click icon for full dialog & filter copy)</span>
                  </span>
                </span>
              </div>
              <div class="special-subtitle">Kalvium WI (70%) + University Faculty Viva (30%)</div>
            </div>
            <span class="credits-badge">${sub.credits} Credits</span>
          </div>

          <div class="special-sections-wrap">
            <!-- Kalvium Component -->
            <div class="special-section">
              <div class="special-section-header">
                <span class="special-section-title">Kalvium Component (Scaled to 70) ${generalTooltip}</span>
                <span class="special-section-meta" id="meta_kalvium_${sub.id}">Kalvium: ${kalviumBadge}</span>
              </div>
              <div class="inputs-grid">
                <div class="input-box">
                  <label class="input-label" for="inp_${sub.id}_sp">Slots Present</label>
                  <input type="number" id="inp_${sub.id}_sp" class="num-input sem3-input"
                    data-subject="${sub.name}" data-field="slots_present" min="0" step="any"
                    placeholder="Present" value="${sp}">
                </div>
                <div class="input-box">
                  <label class="input-label" for="inp_${sub.id}_sc">Slots Counted ${attendanceTooltip}</label>
                  <input type="number" id="inp_${sub.id}_sc" class="num-input sem3-input"
                    data-subject="${sub.name}" data-field="slots_counted" min="0" step="any"
                    placeholder="Counted" value="${sc}">
                </div>
                <div class="input-box">
                  <label class="input-label" for="inp_${sub.id}_dp">Logs On-Time ${worklogTooltip}</label>
                  <input type="number" id="inp_${sub.id}_dp" class="num-input sem3-input"
                    data-subject="${sub.name}" data-field="days_present" min="0" step="any"
                    placeholder="On-time" value="${dp}">
                </div>
                <div class="input-box">
                  <label class="input-label" for="inp_${sub.id}_dc">Logs Counted ${worklogTooltip}</label>
                  <input type="number" id="inp_${sub.id}_dc" class="num-input sem3-input"
                    data-subject="${sub.name}" data-field="days_counted" min="0" step="any"
                    placeholder="Counted" value="${dc}">
                </div>
                <div class="input-box">
                  <label class="input-label" for="inp_${sub.id}_v1">Viva 1 (/25)</label>
                  <input type="number" id="inp_${sub.id}_v1" class="num-input sem3-input"
                    data-subject="${sub.name}" data-field="viva1" min="0" max="25" step="any"
                    placeholder="0-25" value="${v1}">
                </div>
                <div class="input-box">
                  <label class="input-label" for="inp_${sub.id}_v2">Viva 2 (/25)</label>
                  <input type="number" id="inp_${sub.id}_v2" class="num-input sem3-input"
                    data-subject="${sub.name}" data-field="viva2" min="0" max="25" step="any"
                    placeholder="0-25" value="${v2}">
                </div>
                <div class="input-box">
                  <label class="input-label" for="inp_${sub.id}_v3">Viva 3 (/25)</label>
                  <input type="number" id="inp_${sub.id}_v3" class="num-input sem3-input"
                    data-subject="${sub.name}" data-field="viva3" min="0" max="25" step="any"
                    placeholder="0-25" value="${v3}">
                </div>
              </div>
            </div>

            <!-- University Faculty Viva Component -->
            <div class="special-section">
              <div class="special-section-header">
                <span class="special-section-title">University Faculty Viva (30 Marks)</span>
                <span class="special-section-meta" id="meta_uni_${sub.id}">Uni: ${uniBadge}</span>
              </div>
              <div class="inputs-grid" style="grid-template-columns: minmax(130px, 200px);">
                <div class="input-box">
                  <label class="input-label" for="inp_${sub.id}_univiva">Faculty Viva (/30)</label>
                  <input type="number" id="inp_${sub.id}_univiva" class="num-input sem3-input"
                    data-subject="${sub.name}" data-field="uni_viva" min="0" max="30" step="any"
                    placeholder="0-30" value="${uniViva}">
                </div>
              </div>
            </div>
          </div>

          <div class="card-result-row">
            <span>Score: <strong class="result-val" id="score_${sub.id}">${scoreText}</strong></span>
            <span>Grade: <strong class="result-val" id="gradeBadge_${sub.id}">${gradeText}</strong></span>
          </div>
        </div>
      `;
    } else {
      const ca1 = subState.ca1 !== undefined ? subState.ca1 : '';
      const ca2 = subState.ca2 !== undefined ? subState.ca2 : '';
      const ca3 = subState.ca3 !== undefined ? subState.ca3 : '';
      const ca4 = subState.ca4 !== undefined ? subState.ca4 : '';
      const ca5 = subState.ca5 !== undefined ? subState.ca5 : '';
      const att = subState.att !== undefined ? subState.att : '';

      const calc = calculateStandardSem3Score(ca1, ca2, ca3, ca4, ca5, att);
      const gradeResult = calc ? scoreToGrade(calc.score) : null;

      let scoreText = calc ? `${calc.score}/100` : '-';
      let gradeText = gradeResult ? `${gradeResult.grade} (${gradeResult.points} pts)` : '-';

      return `
        <div class="subject-card" data-subject-id="${sub.id}">
          <div class="card-header">
            <span class="subject-name">${sub.name}</span>
            <span class="credits-badge">${sub.credits} Credits</span>
          </div>

          <div class="inputs-grid">
            <div class="input-box">
              <label class="input-label" for="inp_${sub.id}_ca1">CA 1 (/40)</label>
              <input type="number" id="inp_${sub.id}_ca1" class="num-input sem3-input"
                data-subject="${sub.name}" data-field="ca1" step="any" min="0" max="40"
                placeholder="0-40" value="${ca1}">
            </div>
            <div class="input-box">
              <label class="input-label" for="inp_${sub.id}_ca2">CA 2 (/40)</label>
              <input type="number" id="inp_${sub.id}_ca2" class="num-input sem3-input"
                data-subject="${sub.name}" data-field="ca2" step="any" min="0" max="40"
                placeholder="0-40" value="${ca2}">
            </div>
            <div class="input-box">
              <label class="input-label" for="inp_${sub.id}_ca3">CA 3 (/40)</label>
              <input type="number" id="inp_${sub.id}_ca3" class="num-input sem3-input"
                data-subject="${sub.name}" data-field="ca3" step="any" min="0" max="40"
                placeholder="0-40" value="${ca3}">
            </div>
            <div class="input-box">
              <label class="input-label" for="inp_${sub.id}_ca4">CA 4 (/60)</label>
              <input type="number" id="inp_${sub.id}_ca4" class="num-input sem3-input"
                data-subject="${sub.name}" data-field="ca4" step="any" min="0" max="60"
                placeholder="0-60" value="${ca4}">
            </div>
            <div class="input-box">
              <label class="input-label" for="inp_${sub.id}_ca5">CA 5 (/60)</label>
              <input type="number" id="inp_${sub.id}_ca5" class="num-input sem3-input"
                data-subject="${sub.name}" data-field="ca5" step="any" min="0" max="60"
                placeholder="0-60" value="${ca5}">
            </div>
            <div class="input-box">
              <label class="input-label" for="inp_${sub.id}_att">Attendance %</label>
              <input type="number" id="inp_${sub.id}_att" class="num-input sem3-input"
                data-subject="${sub.name}" data-field="att" min="0" max="100" step="any"
                placeholder="0-100%" value="${att}">
            </div>
          </div>

          <div class="card-result-row">
            <span>Score: <strong class="result-val" id="score_${sub.id}">${scoreText}</strong></span>
            <span>Grade: <strong class="result-val" id="gradeBadge_${sub.id}">${gradeText}</strong></span>
          </div>
        </div>
      `;
    }
  }).join('');
}

function recalculateAll() {
  const sem1TotalCredits = SEMESTER_DATA.sem1.totalCredits; // 26
  const sem2TotalCredits = SEMESTER_DATA.sem2.totalCredits; // 20
  const sem3TotalCredits = SEMESTER_DATA.sem3.totalCredits; // 22
  const sem1And2TotalCredits = sem1TotalCredits + sem2TotalCredits; // 46
  const all3TotalCredits = sem1TotalCredits + sem2TotalCredits + sem3TotalCredits; // 68

  // Sem 1 (Evaluates across full 26 credits)
  let sem1Weighted = 0;
  let hasAnySem1 = false;
  SEMESTER_DATA.sem1.subjects.forEach(sub => {
    const grade = state.sem1[sub.name];
    if (grade && GRADE_POINTS_MAP[grade] !== undefined) {
      sem1Weighted += sub.credits * GRADE_POINTS_MAP[grade];
      hasAnySem1 = true;
    }
  });
  const sem1Sgpa = hasAnySem1 ? (sem1Weighted / sem1TotalCredits) : null;

  // Sem 2 (Evaluates across full 20 credits)
  let sem2Weighted = 0;
  let hasAnySem2 = false;
  SEMESTER_DATA.sem2.subjects.forEach(sub => {
    const grade = state.sem2[sub.name];
    if (grade && GRADE_POINTS_MAP[grade] !== undefined) {
      sem2Weighted += sub.credits * GRADE_POINTS_MAP[grade];
      hasAnySem2 = true;
    }
  });
  const sem2Sgpa = hasAnySem2 ? (sem2Weighted / sem2TotalCredits) : null;

  // Sem 3 (Evaluates live across full 22 credits; unentered subjects/CAs default to 0)
  let sem3Weighted = 0;
  let hasAnySem3 = false;
  SEMESTER_DATA.sem3.subjects.forEach(sub => {
    const subState = state.sem3[sub.name] || {};
    let gradeObj = null;

    if (sub.isSpecial) {
      const calc = calculateSpecialSem3Score(
        subState.slots_present, subState.slots_counted,
        subState.days_present, subState.days_counted,
        subState.viva1, subState.viva2, subState.viva3,
        subState.uni_viva
      );
      if (calc) {
        gradeObj = scoreToGrade(calc.score);
        hasAnySem3 = true;
      }
    } else {
      const calc = calculateStandardSem3Score(
        subState.ca1, subState.ca2, subState.ca3, subState.ca4, subState.ca5, subState.att
      );
      if (calc) {
        gradeObj = scoreToGrade(calc.score);
        hasAnySem3 = true;
      }
    }

    if (gradeObj) {
      sem3Weighted += sub.credits * gradeObj.points;
    }
  });
  const sem3Sgpa = hasAnySem3 ? (sem3Weighted / sem3TotalCredits) : null;

  // Overall CGPA for Sem 1 & Sem 2 (Main display in header, across full 46 credits)
  const hasAnySem1Or2 = hasAnySem1 || hasAnySem2;
  const sem1And2Weighted = sem1Weighted + sem2Weighted;
  const sem1And2Cgpa = hasAnySem1Or2 ? (sem1And2Weighted / sem1And2TotalCredits) : null;

  // Overall CGPA across ALL 3 semesters (Sub display in header, across full 68 credits)
  const hasAnyAll3 = hasAnySem1 || hasAnySem2 || hasAnySem3;
  const all3Weighted = sem1Weighted + sem2Weighted + sem3Weighted;
  const all3Cgpa = hasAnyAll3 ? (all3Weighted / all3TotalCredits) : null;

  // Update Header CGPA Displays
  const cgpaDisplay = document.getElementById('cgpaDisplay');
  const cgpaAllSemsDisplay = document.getElementById('cgpaAllSemsDisplay');

  if (cgpaDisplay) {
    cgpaDisplay.textContent = sem1And2Cgpa !== null ? sem1And2Cgpa.toFixed(2) : '0.00';
  }
  if (cgpaAllSemsDisplay) {
    cgpaAllSemsDisplay.textContent = all3Cgpa !== null ? all3Cgpa.toFixed(2) : '0.00';
  }

  // Update Tab Sub-pills
  const sem1TabSgpa = document.getElementById('sem1TabSgpa');
  const sem2TabSgpa = document.getElementById('sem2TabSgpa');
  const sem3TabSgpa = document.getElementById('sem3TabSgpa');

  if (sem1TabSgpa) sem1TabSgpa.textContent = sem1Sgpa !== null ? sem1Sgpa.toFixed(2) : '-';
  if (sem2TabSgpa) sem2TabSgpa.textContent = sem2Sgpa !== null ? sem2Sgpa.toFixed(2) : '-';
  if (sem3TabSgpa) sem3TabSgpa.textContent = sem3Sgpa !== null ? sem3Sgpa.toFixed(2) : '-';

  // Update Current Active Semester Card
  const currentSemLabel = document.getElementById('currentSemLabel');
  const currentSemDisplay = document.getElementById('currentSemSgpaDisplay');

  const activeSemName = state.activeTab === 'sem1' ? 'Semester 1' : (state.activeTab === 'sem2' ? 'Semester 2' : 'Semester 3');
  const activeSgpa = state.activeTab === 'sem1' ? sem1Sgpa : (state.activeTab === 'sem2' ? sem2Sgpa : sem3Sgpa);

  if (currentSemLabel) currentSemLabel.textContent = `${activeSemName} SGPA`;
  if (currentSemDisplay) currentSemDisplay.textContent = activeSgpa !== null ? activeSgpa.toFixed(2) : '0.00';

  saveToLocalStorage();
}

function saveToLocalStorage() {
  try {
    localStorage.setItem('sgpa_sem1', JSON.stringify(state.sem1));
    localStorage.setItem('sgpa_sem2', JSON.stringify(state.sem2));
    localStorage.setItem('sgpa_sem3', JSON.stringify(state.sem3));
    localStorage.setItem('sgpa_active_tab', state.activeTab);
    localStorage.setItem('sgpa_integrated_compact', state.integratedCompact ? 'true' : 'false');
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
}

function loadFromLocalStorage() {
  try {
    const s1 = localStorage.getItem('sgpa_sem1');
    const s2 = localStorage.getItem('sgpa_sem2');
    const s3 = localStorage.getItem('sgpa_sem3');
    const savedTab = localStorage.getItem('sgpa_active_tab');
    const savedCompact = localStorage.getItem('sgpa_integrated_compact');

    if (s1) state.sem1 = JSON.parse(s1);
    if (s2) state.sem2 = JSON.parse(s2);
    if (s3) {
      state.sem3 = JSON.parse(s3);
      // Clean up legacy sprint keys if present
      const specialObj = state.sem3['Integrated Work with a Partner Company-I'];
      if (specialObj && (specialObj.sprint1 !== undefined || specialObj.sprint2 !== undefined || specialObj.sprint3 !== undefined)) {
        delete specialObj.sprint1;
        delete specialObj.sprint2;
        delete specialObj.sprint3;
        delete specialObj.viva;
      }
    }
    if (savedTab) state.activeTab = savedTab;
    if (savedCompact !== null) state.integratedCompact = (savedCompact === 'true');
  } catch (e) {
    console.error('Error loading from localStorage:', e);
  }
}

function switchTab(tabId) {
  state.activeTab = tabId;

  document.querySelectorAll('.tab-btn').forEach(btn => {
    const isSelected = btn.dataset.tab === tabId;
    btn.classList.toggle('active', isSelected);
    btn.setAttribute('aria-selected', isSelected ? 'true' : 'false');
  });

  document.querySelectorAll('.tab-panel').forEach(panel => {
    const isTarget = panel.id === `panel${tabId.charAt(0).toUpperCase() + tabId.slice(1)}`;
    panel.classList.toggle('active', isTarget);
    if (isTarget) {
      panel.removeAttribute('hidden');
    } else {
      panel.setAttribute('hidden', '');
    }
  });

  recalculateAll();
}

function setupEventListeners() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  document.addEventListener('change', (e) => {
    if (e.target.matches('.grade-select')) {
      const select = e.target;
      const semKey = select.dataset.sem;
      const subject = select.dataset.subject;
      const grade = select.value;

      if (!state[semKey]) state[semKey] = {};
      state[semKey][subject] = grade;

      const card = select.closest('.subject-card');
      if (card) {
        const subId = card.dataset.subjectId;
        const badge = document.getElementById(`badge_${subId}`);
        if (badge) badge.textContent = grade || '-';
      }

      recalculateAll();
    }

    // Input boundary clamping on change/blur
    if (e.target.matches('.sem3-input')) {
      const input = e.target;
      const min = input.min !== '' ? parseFloat(input.min) : null;
      const max = input.max !== '' ? parseFloat(input.max) : null;
      if (input.value !== '' && !isNaN(parseFloat(input.value))) {
        let val = parseFloat(input.value);
        if (min !== null && val < min) val = min;
        if (max !== null && val > max) val = max;
        if (parseFloat(input.value) !== val) {
          input.value = val;
          const subject = input.dataset.subject;
          const field = input.dataset.field;
          state.sem3[subject][field] = val.toString();
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    }
  });

  document.addEventListener('input', (e) => {
    if (e.target.matches('.sem3-input')) {
      const input = e.target;
      const subject = input.dataset.subject;
      const field = input.dataset.field;
      const val = input.value;

      if (!state.sem3[subject]) state.sem3[subject] = {};
      state.sem3[subject][field] = val;

      const card = input.closest('.subject-card');
      if (card) {
        const subId = card.dataset.subjectId;
        const scoreEl = document.getElementById(`score_${subId}`);
        const badgeEl = document.getElementById(`gradeBadge_${subId}`);

        const isSpecial = subject === 'Integrated Work with a Partner Company-I';
        const sState = state.sem3[subject] || {};

        if (isSpecial) {
          const calc = calculateSpecialSem3Score(
            sState.slots_present, sState.slots_counted,
            sState.days_present, sState.days_counted,
            sState.viva1, sState.viva2, sState.viva3,
            sState.uni_viva
          );
          const metaKalviumEl = document.getElementById(`meta_kalvium_${subId}`);
          const metaUniEl = document.getElementById(`meta_uni_${subId}`);

          if (calc) {
            const gradeResult = scoreToGrade(calc.score);
            if (scoreEl) scoreEl.textContent = `${calc.score}/100`;
            if (badgeEl) badgeEl.textContent = `${gradeResult.grade} (${gradeResult.points} pts)`;
            if (metaKalviumEl) metaKalviumEl.textContent = `Kalvium: ${calc.kalvium70.toFixed(1)} / 70`;
            if (metaUniEl) metaUniEl.textContent = `Uni: ${calc.uniVivaScore.toFixed(0)} / 30`;
          } else {
            if (scoreEl) scoreEl.textContent = '-';
            if (badgeEl) badgeEl.textContent = '-';
            if (metaKalviumEl) metaKalviumEl.textContent = 'Kalvium: - / 70';
            if (metaUniEl) metaUniEl.textContent = 'Uni: - / 30';
          }
        } else {
          const calc = calculateStandardSem3Score(sState.ca1, sState.ca2, sState.ca3, sState.ca4, sState.ca5, sState.att);
          if (calc) {
            const gradeResult = scoreToGrade(calc.score);
            if (scoreEl) scoreEl.textContent = `${calc.score}/100`;
            if (badgeEl) badgeEl.textContent = `${gradeResult.grade} (${gradeResult.points} pts)`;
          } else {
            if (scoreEl) scoreEl.textContent = '-';
            if (badgeEl) badgeEl.textContent = '-';
          }
        }
      }

      recalculateAll();
    }
  });

  // Modal open / close handlers and copy filter handlers
  document.addEventListener('click', (e) => {
    // Open Guidelines Modal
    const openBtn = e.target.closest('.btn-open-guidelines');
    if (openBtn) {
      e.preventDefault();
      openGuidelinesModal();
      return;
    }

    // Close Guidelines Modal
    const closeBtn = e.target.closest('#closeModalBtn, #modalGotItBtn');
    if (closeBtn) {
      e.preventDefault();
      closeGuidelinesModal();
      return;
    }

    const modalBackdrop = document.getElementById('guidelinesModal');
    if (e.target === modalBackdrop) {
      closeGuidelinesModal();
      return;
    }

    // Toggle Compact Mode for Integrated Subject
    const toggleCompactBtn = e.target.closest('#btnToggleCompact');
    if (toggleCompactBtn) {
      e.preventDefault();
      toggleIntegratedCompact();
      return;
    }

    // Copy Filter Buttons
    const copyBtn = e.target.closest('.copy-query-pill, #copyFilterBtn');
    if (copyBtn) {
      e.preventDefault();
      const query = copyBtn.dataset.query || 'subject:Thanks for filling in this form: Simulated Work Daily Journal Form effective 13th March 2026';
      copyTextToClipboard(query, copyBtn);
      return;
    }

    // Direct click on code chips
    const codeChip = e.target.closest('.tooltip-filter-chip, .inline-filter-code, .modal-filter-code');
    if (codeChip) {
      const text = codeChip.textContent.trim();
      const associatedBtn = codeChip.closest('.pg-filter-box, .modal-code-wrap')?.querySelector('button');
      copyTextToClipboard(text, associatedBtn);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeGuidelinesModal();
    }
  });
}

function toggleIntegratedCompact() {
  state.integratedCompact = !state.integratedCompact;
  saveToLocalStorage();
  const card = document.querySelector('.subject-card.special-card');
  const guidelinesCard = document.getElementById('guidelinesCard');
  const btn = document.getElementById('btnToggleCompact');
  if (card) {
    card.classList.toggle('is-compact', state.integratedCompact);
  }
  if (guidelinesCard) {
    guidelinesCard.classList.toggle('is-compact', state.integratedCompact);
  }
  if (btn) {
    btn.setAttribute('title', state.integratedCompact ? 'Expand to standard view' : 'Make integrated more compact');
    btn.innerHTML = `
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        ${state.integratedCompact
          ? '<polyline points="6 9 12 15 18 9"></polyline>'
          : '<polyline points="18 15 12 9 6 15"></polyline>'}
      </svg>
      <span id="compactBtnText">${state.integratedCompact ? 'Expand' : 'Compact'}</span>
    `;
  }
}

function openGuidelinesModal() {
  const modal = document.getElementById('guidelinesModal');
  if (modal) {
    modal.removeAttribute('hidden');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
}

function closeGuidelinesModal() {
  const modal = document.getElementById('guidelinesModal');
  if (modal) {
    modal.setAttribute('hidden', '');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}

function copyTextToClipboard(text, triggerBtn) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(showSuccess).catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }

  function fallbackCopy(str) {
    const ta = document.createElement('textarea');
    ta.value = str;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showSuccess();
    } catch (err) {
      console.error('Copy failed', err);
    }
    document.body.removeChild(ta);
  }

  function showSuccess() {
    if (!triggerBtn) return;
    const originalHtml = triggerBtn.innerHTML;
    triggerBtn.classList.add('copied');
    triggerBtn.innerHTML = `
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span>Copied!</span>
    `;
    setTimeout(() => {
      triggerBtn.classList.remove('copied');
      triggerBtn.innerHTML = originalHtml;
    }, 2000);
  }
}

function init() {
  loadFromLocalStorage();
  renderDropdownSemester('sem1', 'sem1SubjectsGrid');
  renderDropdownSemester('sem2', 'sem2SubjectsGrid');
  renderSem3();
  setupEventListeners();

  switchTab(state.activeTab || 'sem3');
  recalculateAll();
}

document.addEventListener('DOMContentLoaded', init);
