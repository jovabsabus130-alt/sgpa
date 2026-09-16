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
  sem3: {}
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
 * Evaluates immediately on ANY entered field (normalizing proportional weight if partial)
 * Full formula when complete: Round( (90/5/40)*(CA1+CA2+CA3) + (90/5/60)*(CA4+CA5) + Attendance, 0 )
 */
function calculateStandardSem3Score(ca1, ca2, ca3, ca4, ca5, attPercent) {
  const c1 = ca1 !== '' && ca1 !== null && !isNaN(parseFloat(ca1)) ? parseFloat(ca1) : null;
  const c2 = ca2 !== '' && ca2 !== null && !isNaN(parseFloat(ca2)) ? parseFloat(ca2) : null;
  const c3 = ca3 !== '' && ca3 !== null && !isNaN(parseFloat(ca3)) ? parseFloat(ca3) : null;
  const c4 = ca4 !== '' && ca4 !== null && !isNaN(parseFloat(ca4)) ? parseFloat(ca4) : null;
  const c5 = ca5 !== '' && ca5 !== null && !isNaN(parseFloat(ca5)) ? parseFloat(ca5) : null;
  const hasAtt = attPercent !== '' && attPercent !== null && !isNaN(parseFloat(attPercent));
  const attVal = hasAtt ? parseFloat(attPercent) : null;

  const enteredList = [c1, c2, c3, c4, c5, attVal].filter(v => v !== null);
  if (enteredList.length === 0) return null;

  const isComplete = (c1 !== null && c2 !== null && c3 !== null && c4 !== null && c5 !== null && hasAtt);

  if (isComplete) {
    // Official full formula
    const attMarks = getAttendanceMarks(attVal);
    const part1 = (90 / 5 / 40) * (c1 + c2 + c3);
    const part2 = (90 / 5 / 60) * (c4 + c5);
    const totalScore = Math.min(100, Math.max(0, Math.round(part1 + part2 + attMarks)));
    return { score: totalScore, isComplete: true, filledCount: 6 };
  } else {
    // Proportional calculation for single or partial fields
    let earnedWeight = 0;
    let maxWeight = 0;

    if (c1 !== null) { earnedWeight += 0.45 * c1; maxWeight += 18; }
    if (c2 !== null) { earnedWeight += 0.45 * c2; maxWeight += 18; }
    if (c3 !== null) { earnedWeight += 0.45 * c3; maxWeight += 18; }

    if (c4 !== null) { earnedWeight += 0.30 * c4; maxWeight += 18; }
    if (c5 !== null) { earnedWeight += 0.30 * c5; maxWeight += 18; }

    if (hasAtt) {
      earnedWeight += getAttendanceMarks(attVal);
      maxWeight += 5;
    }

    let projectedScore = maxWeight > 0 ? Math.min(100, Math.max(0, Math.round((earnedWeight / maxWeight) * 100))) : 0;
    return { score: projectedScore, isComplete: false, filledCount: enteredList.length };
  }
}

/**
 * Partner Company Special Subject Evaluation
 * Evaluates immediately on ANY entered sprint or viva
 * Full formula when complete: Round( avg(sprint1, sprint2, sprint3)*0.70 + viva, 0 )
 */
function calculateSpecialSem3Score(sprint1, sprint2, sprint3, viva) {
  const s1 = sprint1 !== '' && sprint1 !== null && !isNaN(parseFloat(sprint1)) ? parseFloat(sprint1) : null;
  const s2 = sprint2 !== '' && sprint2 !== null && !isNaN(parseFloat(sprint2)) ? parseFloat(sprint2) : null;
  const s3 = sprint3 !== '' && sprint3 !== null && !isNaN(parseFloat(sprint3)) ? parseFloat(sprint3) : null;
  const v = viva !== '' && viva !== null && !isNaN(parseFloat(viva)) ? parseFloat(viva) : null;

  const enteredSprints = [s1, s2, s3].filter(v => v !== null);
  const hasViva = (v !== null);

  if (enteredSprints.length === 0 && !hasViva) return null;

  const isComplete = (s1 !== null && s2 !== null && s3 !== null && hasViva);

  if (isComplete) {
    const sprintAvg = (s1 + s2 + s3) / 3;
    const totalScore = Math.min(100, Math.max(0, Math.round(sprintAvg * 0.7 + v)));
    return { score: totalScore, isComplete: true, filledCount: 4 };
  } else {
    // Proportional calculation for partial fields
    let earnedWeight = 0;
    let maxWeight = 0;

    if (enteredSprints.length > 0) {
      const avgEntered = enteredSprints.reduce((a, b) => a + b, 0) / enteredSprints.length;
      earnedWeight += avgEntered * 0.7;
      maxWeight += 70;
    }

    if (hasViva) {
      earnedWeight += v;
      maxWeight += 30;
    }

    let projectedScore = maxWeight > 0 ? Math.min(100, Math.max(0, Math.round((earnedWeight / maxWeight) * 100))) : 0;
    return { score: projectedScore, isComplete: false, filledCount: enteredSprints.length + (hasViva ? 1 : 0) };
  }
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
      const s1 = subState.sprint1 !== undefined ? subState.sprint1 : '';
      const s2 = subState.sprint2 !== undefined ? subState.sprint2 : '';
      const s3 = subState.sprint3 !== undefined ? subState.sprint3 : '';
      const viva = subState.viva !== undefined ? subState.viva : '';

      const calc = calculateSpecialSem3Score(s1, s2, s3, viva);
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
              <label class="input-label" for="inp_${sub.id}_s1">Sprint 1</label>
              <input type="number" id="inp_${sub.id}_s1" class="num-input sem3-input"
                data-subject="${sub.name}" data-field="sprint1" min="0" max="100" step="any"
                placeholder="0-100" value="${s1}">
            </div>
            <div class="input-box">
              <label class="input-label" for="inp_${sub.id}_s2">Sprint 2</label>
              <input type="number" id="inp_${sub.id}_s2" class="num-input sem3-input"
                data-subject="${sub.name}" data-field="sprint2" min="0" max="100" step="any"
                placeholder="0-100" value="${s2}">
            </div>
            <div class="input-box">
              <label class="input-label" for="inp_${sub.id}_s3">Sprint 3</label>
              <input type="number" id="inp_${sub.id}_s3" class="num-input sem3-input"
                data-subject="${sub.name}" data-field="sprint3" min="0" max="100" step="any"
                placeholder="0-100" value="${s3}">
            </div>
            <div class="input-box">
              <label class="input-label" for="inp_${sub.id}_viva">Viva (/30)</label>
              <input type="number" id="inp_${sub.id}_viva" class="num-input sem3-input"
                data-subject="${sub.name}" data-field="viva" min="0" max="30" step="any"
                placeholder="0-30" value="${viva}">
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
              <label class="input-label" for="inp_${sub.id}_ca1">CA 1</label>
              <input type="number" id="inp_${sub.id}_ca1" class="num-input sem3-input"
                data-subject="${sub.name}" data-field="ca1" step="any" min="0"
                placeholder="Marks" value="${ca1}">
            </div>
            <div class="input-box">
              <label class="input-label" for="inp_${sub.id}_ca2">CA 2</label>
              <input type="number" id="inp_${sub.id}_ca2" class="num-input sem3-input"
                data-subject="${sub.name}" data-field="ca2" step="any" min="0"
                placeholder="Marks" value="${ca2}">
            </div>
            <div class="input-box">
              <label class="input-label" for="inp_${sub.id}_ca3">CA 3</label>
              <input type="number" id="inp_${sub.id}_ca3" class="num-input sem3-input"
                data-subject="${sub.name}" data-field="ca3" step="any" min="0"
                placeholder="Marks" value="${ca3}">
            </div>
            <div class="input-box">
              <label class="input-label" for="inp_${sub.id}_ca4">CA 4</label>
              <input type="number" id="inp_${sub.id}_ca4" class="num-input sem3-input"
                data-subject="${sub.name}" data-field="ca4" step="any" min="0"
                placeholder="Marks" value="${ca4}">
            </div>
            <div class="input-box">
              <label class="input-label" for="inp_${sub.id}_ca5">CA 5</label>
              <input type="number" id="inp_${sub.id}_ca5" class="num-input sem3-input"
                data-subject="${sub.name}" data-field="ca5" step="any" min="0"
                placeholder="Marks" value="${ca5}">
            </div>
            <div class="input-box">
              <label class="input-label" for="inp_${sub.id}_att">Attendance %</label>
              <input type="number" id="inp_${sub.id}_att" class="num-input sem3-input"
                data-subject="${sub.name}" data-field="att" min="0" max="100" step="any"
                placeholder="%" value="${att}">
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
  // Sem 1
  let sem1Weighted = 0, sem1Credits = 0;
  SEMESTER_DATA.sem1.subjects.forEach(sub => {
    const grade = state.sem1[sub.name];
    if (grade && GRADE_POINTS_MAP[grade] !== undefined) {
      sem1Weighted += sub.credits * GRADE_POINTS_MAP[grade];
      sem1Credits += sub.credits;
    }
  });
  const sem1Sgpa = sem1Credits > 0 ? (sem1Weighted / sem1Credits) : null;

  // Sem 2
  let sem2Weighted = 0, sem2Credits = 0;
  SEMESTER_DATA.sem2.subjects.forEach(sub => {
    const grade = state.sem2[sub.name];
    if (grade && GRADE_POINTS_MAP[grade] !== undefined) {
      sem2Weighted += sub.credits * GRADE_POINTS_MAP[grade];
      sem2Credits += sub.credits;
    }
  });
  const sem2Sgpa = sem2Credits > 0 ? (sem2Weighted / sem2Credits) : null;

  // Sem 3 (Calculates live on even 1 field entered)
  let sem3Weighted = 0, sem3Credits = 0;
  SEMESTER_DATA.sem3.subjects.forEach(sub => {
    const subState = state.sem3[sub.name] || {};
    let gradeObj = null;

    if (sub.isSpecial) {
      const calc = calculateSpecialSem3Score(subState.sprint1, subState.sprint2, subState.sprint3, subState.viva);
      if (calc) {
        gradeObj = scoreToGrade(calc.score);
      }
    } else {
      const calc = calculateStandardSem3Score(subState.ca1, subState.ca2, subState.ca3, subState.ca4, subState.ca5, subState.att);
      if (calc) {
        gradeObj = scoreToGrade(calc.score);
      }
    }

    if (gradeObj) {
      sem3Weighted += sub.credits * gradeObj.points;
      sem3Credits += sub.credits;
    }
  });
  const sem3Sgpa = sem3Credits > 0 ? (sem3Weighted / sem3Credits) : null;

  // Overall CGPA for Sem 1 & Sem 2 (Main display in header)
  const sem1And2Weighted = sem1Weighted + sem2Weighted;
  const sem1And2Credits = sem1Credits + sem2Credits;
  const sem1And2Cgpa = sem1And2Credits > 0 ? (sem1And2Weighted / sem1And2Credits) : null;

  // Overall CGPA across ALL 3 semesters (Sub display in header)
  const all3Weighted = sem1Weighted + sem2Weighted + sem3Weighted;
  const all3Credits = sem1Credits + sem2Credits + sem3Credits;
  const all3Cgpa = all3Credits > 0 ? (all3Weighted / all3Credits) : null;

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

    if (s1) state.sem1 = JSON.parse(s1);
    if (s2) state.sem2 = JSON.parse(s2);
    if (s3) state.sem3 = JSON.parse(s3);
    if (savedTab) state.activeTab = savedTab;
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
          const calc = calculateSpecialSem3Score(sState.sprint1, sState.sprint2, sState.sprint3, sState.viva);
          if (calc) {
            const gradeResult = scoreToGrade(calc.score);
            if (scoreEl) scoreEl.textContent = `${calc.score}/100`;
            if (badgeEl) badgeEl.textContent = `${gradeResult.grade} (${gradeResult.points} pts)`;
          } else {
            if (scoreEl) scoreEl.textContent = '-';
            if (badgeEl) badgeEl.textContent = '-';
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
