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
  if (attPercent === null || attPercent === undefined || isNaN(attPercent)) return 0;
  if (attPercent >= 90) return 5;
  if (attPercent >= 85) return 4;
  if (attPercent >= 80) return 3;
  if (attPercent >= 75) return 2;
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

function calculateStandardSem3Score(ca1, ca2, ca3, ca4, ca5, attPercent) {
  const inputs = [ca1, ca2, ca3, ca4, ca5, attPercent];
  const filledCount = inputs.filter(v => v !== '' && v !== null && v !== undefined && !isNaN(parseFloat(v))).length;
  if (filledCount === 0) return null;

  const nCa1 = parseFloat(ca1) || 0;
  const nCa2 = parseFloat(ca2) || 0;
  const nCa3 = parseFloat(ca3) || 0;
  const nCa4 = parseFloat(ca4) || 0;
  const nCa5 = parseFloat(ca5) || 0;
  const nAtt = attPercent !== '' && attPercent !== null ? parseFloat(attPercent) : NaN;

  const attMarks = isNaN(nAtt) ? 0 : getAttendanceMarks(nAtt);
  const part1 = (90 / 5 / 40) * (nCa1 + nCa2 + nCa3);
  const part2 = (90 / 5 / 60) * (nCa4 + nCa5);
  const totalScore = Math.min(100, Math.max(0, Math.round(part1 + part2 + attMarks)));

  return { score: totalScore, isComplete: filledCount === 6 };
}

function calculateSpecialSem3Score(sprint1, sprint2, sprint3, viva) {
  const inputs = [sprint1, sprint2, sprint3, viva];
  const filledCount = inputs.filter(v => v !== '' && v !== null && v !== undefined && !isNaN(parseFloat(v))).length;
  if (filledCount === 0) return null;

  const s1 = parseFloat(sprint1) || 0;
  const s2 = parseFloat(sprint2) || 0;
  const s3 = parseFloat(sprint3) || 0;
  const v = parseFloat(viva) || 0;

  const sprintAvg = (s1 + s2 + s3) / 3;
  const sprintPart = sprintAvg * 0.7;
  const totalScore = Math.min(100, Math.max(0, Math.round(sprintPart + v)));

  return { score: totalScore, isComplete: filledCount === 4 };
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
            <span>Score: <strong class="result-val" id="score_${sub.id}">${calc ? `${calc.score}/100` : '-'}</strong></span>
            <span>Grade: <strong class="result-val" id="gradeBadge_${sub.id}">${gradeResult ? `${gradeResult.grade} (${gradeResult.points} pts)` : '-'}</strong></span>
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
            <span>Score: <strong class="result-val" id="score_${sub.id}">${calc ? `${calc.score}/100` : '-'}</strong></span>
            <span>Grade: <strong class="result-val" id="gradeBadge_${sub.id}">${gradeResult ? `${gradeResult.grade} (${gradeResult.points} pts)` : '-'}</strong></span>
          </div>
        </div>
      `;
    }
  }).join('');
}

function recalculateAll() {
  let totalAllWeightedPoints = 0;
  let totalAllGradedCredits = 0;

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

  // Sem 3
  let sem3Weighted = 0, sem3Credits = 0;
  SEMESTER_DATA.sem3.subjects.forEach(sub => {
    const subState = state.sem3[sub.name] || {};
    let gradeObj = null;

    if (sub.isSpecial) {
      const calc = calculateSpecialSem3Score(subState.sprint1, subState.sprint2, subState.sprint3, subState.viva);
      if (calc) gradeObj = scoreToGrade(calc.score);
    } else {
      const calc = calculateStandardSem3Score(subState.ca1, subState.ca2, subState.ca3, subState.ca4, subState.ca5, subState.att);
      if (calc) gradeObj = scoreToGrade(calc.score);
    }

    if (gradeObj) {
      sem3Weighted += sub.credits * gradeObj.points;
      sem3Credits += sub.credits;
    }
  });
  const sem3Sgpa = sem3Credits > 0 ? (sem3Weighted / sem3Credits) : null;

  // Overall CGPA
  totalAllWeightedPoints = sem1Weighted + sem2Weighted + sem3Weighted;
  totalAllGradedCredits = sem1Credits + sem2Credits + sem3Credits;
  const overallCgpa = totalAllGradedCredits > 0 ? (totalAllWeightedPoints / totalAllGradedCredits) : null;

  // Update Displays
  const cgpaDisplay = document.getElementById('cgpaDisplay');
  if (cgpaDisplay) {
    cgpaDisplay.textContent = overallCgpa !== null ? overallCgpa.toFixed(2) : '0.00';
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
          const gradeResult = calc ? scoreToGrade(calc.score) : null;
          if (scoreEl) scoreEl.textContent = calc ? `${calc.score}/100` : '-';
          if (badgeEl) badgeEl.textContent = gradeResult ? `${gradeResult.grade} (${gradeResult.points} pts)` : '-';
        } else {
          const calc = calculateStandardSem3Score(sState.ca1, sState.ca2, sState.ca3, sState.ca4, sState.ca5, sState.att);
          const gradeResult = calc ? scoreToGrade(calc.score) : null;
          if (scoreEl) scoreEl.textContent = calc ? `${calc.score}/100` : '-';
          if (badgeEl) badgeEl.textContent = gradeResult ? `${gradeResult.grade} (${gradeResult.points} pts)` : '-';
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
