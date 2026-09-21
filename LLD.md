# Low-Level Design (LLD)

**System Name:** SGPA & CGPA Academic Calculator  
**Document Version:** 1.0.0  
**Implementation Language:** JavaScript (ES6+), HTML5, CSS3  

---

## 1. Data Structures & Constants

### 1.1 `GRADE_SCALE` Array
Defines the mapping between percentage score brackets, letter grades, and grade points:

```javascript
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
```

### 1.2 `GRADE_POINTS_MAP` Lookup
Provides $O(1)$ letter-grade-to-points translation:

```javascript
const GRADE_POINTS_MAP = {
  'O': 10, 'A+': 9, 'A': 8, 'B+': 7,
  'B': 6,  'C': 5,  'D': 4, 'E/F': 0
};
```

### 1.3 `SEMESTER_DATA` Curriculum Metadata
Static specification of semesters, credits, subject IDs, names, and special flags:

```javascript
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
```

### 1.4 Runtime State Schema (`state`)
```javascript
const state = {
  activeTab: 'sem3', // 'sem1' | 'sem2' | 'sem3'
  sem1: {
    // [subjectName: string]: 'O' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'E/F' | ''
  },
  sem2: {
    // [subjectName: string]: 'O' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'E/F' | ''
  },
  sem3: {
    // Standard subject: { ca1?: string|number, ca2?: string|number, ca3?: string|number, ca4?: string|number, ca5?: string|number, att?: string|number }
    // Special subject:  { sprint1?: string|number, sprint2?: string|number, sprint3?: string|number, viva?: string|number }
  }
};
```

---

## 2. Core Functions & Algorithmic Design

```mermaid
flowchart TD
    Start([User Input Event]) --> Extract[Extract Subject & Value from Dataset]
    Extract --> UpdateState[Update In-Memory State Object]
    UpdateState --> Recalc[Invoke recalculateAll]

    Recalc --> Sem1Loop[Compute Sem 1 Weighted Points]
    Recalc --> Sem2Loop[Compute Sem 2 Weighted Points]
    Recalc --> Sem3Loop[Evaluate Sem 3 Subjects]

    Sem3Loop --> CheckSpecial{isSpecial Subject?}
    CheckSpecial -- Yes --> CalcSpecial[calculateSpecialSem3Score]
    CheckSpecial -- No --> CalcStandard[calculateStandardSem3Score]

    CalcSpecial --> MapGrade[scoreToGrade]
    CalcStandard --> MapGrade

    MapGrade --> SumSem3[Accumulate Sem 3 SGPA]
    Sem1Loop --> SumAll[Compute Sem 1+2 CGPA & All 3 Sems CGPA]
    Sem2Loop --> SumAll
    SumSem3 --> SumAll

    SumAll --> UpdateDOM[Update Header, Pills, Cards in DOM]
    UpdateDOM --> SaveStorage[Serialize to localStorage]
    SaveStorage --> End([Done])
```

---

### 2.1 `getAttendanceMarks(attPercent)`
- **Input:** `attPercent: number | string | null`
- **Output:** `number` (0, 2, 3, 4, or 5)
- **Logic:**
  ```javascript
  function getAttendanceMarks(attPercent) {
    if (attPercent === null || attPercent === undefined || attPercent === '' || isNaN(parseFloat(attPercent))) return 0;
    const att = parseFloat(attPercent);
    if (att >= 90) return 5;
    if (att >= 85) return 4;
    if (att >= 80) return 3;
    if (att >= 75) return 2;
    return 0;
  }
  ```

---

### 2.2 `scoreToGrade(score)`
- **Input:** `score: number | null`
- **Output:** `{ grade: string, points: number, score: number } | null`
- **Algorithm:**
  1. If `score` is `null`, `undefined`, or `NaN`, return `null`.
  2. Round score to nearest integer: `rounded = Math.round(score)`.
  3. Traverse `GRADE_SCALE` to find match where `rounded >= tier.min && rounded <= tier.max`.
  4. Upper clamp check: if `rounded > 100`, return `{ grade: 'O', points: 10, score: 100 }`.
  5. Default fallback: return `{ grade: 'E/F', points: 0, score: Math.max(0, rounded) }`.

---

### 2.3 `calculateStandardSem3Score(ca1, ca2, ca3, ca4, ca5, attPercent)`
- **Input:** 6 numeric/string parameters for CA1–CA5 marks and attendance percentage.
- **Output:** `{ score: number, isComplete: boolean, filledCount: number } | null`
- **Logic:**
  - **Parsing:** Filter non-null, non-empty, valid numerical inputs. If count is 0, return `null`.
  - **Complete Branch ($N = 6$ fields entered):**
    $$\text{part1} = \left(\frac{90}{5 \times 40}\right) \times (c_1 + c_2 + c_3) = 0.45 \times (c_1 + c_2 + c_3)$$
    $$\text{part2} = \left(\frac{90}{5 \times 60}\right) \times (c_4 + c_5) = 0.30 \times (c_4 + c_5)$$
    $$\text{totalScore} = \min(100, \max(0, \text{Round}(\text{part1} + \text{part2} + \text{attMarks})))$$
  - **Partial Branch ($1 \le N < 6$ fields entered):**
    - Accumulates `earnedWeight` and `maxWeight` based on provided fields ($c_1, c_2, c_3 \rightarrow \text{max } 18$ each; $c_4, c_5 \rightarrow \text{max } 18$ each; Attendance $\rightarrow \text{max } 5$).
    - Projects score:
      $$\text{projectedScore} = \min\left(100, \max\left(0, \text{Round}\left(\frac{\text{earnedWeight}}{\text{maxWeight}} \times 100\right)\right)\right)$$

---

### 2.4 `calculateSpecialSem3Score(sprint1, sprint2, sprint3, viva)`
- **Input:** 4 numeric/string parameters for Sprint 1, 2, 3 (out of 100) and Viva (out of 30).
- **Output:** `{ score: number, isComplete: boolean, filledCount: number } | null`
- **Logic:**
  - **Complete Branch (3 sprints + Viva):**
    $$\text{sprintAvg} = \frac{s_1 + s_2 + s_3}{3}$$
    $$\text{totalScore} = \min(100, \max(0, \text{Round}(\text{sprintAvg} \times 0.70 + viva)))$$
  - **Partial Branch:**
    - Sprint weight pool: 70 max weight allocated proportionally to entered sprints.
    - Viva weight pool: 30 max weight.
    - Projected score normalized to 100%.

---

### 2.5 `recalculateAll()`
- **Purpose:** Central aggregator that computes all semester SGPAs, overall CGPAs, updates UI elements, and triggers localStorage persistence.
- **Workflow:**
  1. **Sem 1:** Sums $(\text{credits} \times \text{points})$ for entered dropdowns. Divides by entered credits $\rightarrow \text{sem1Sgpa}$.
  2. **Sem 2:** Sums $(\text{credits} \times \text{points})$ for entered dropdowns. Divides by entered credits $\rightarrow \text{sem2Sgpa}$.
  3. **Sem 3:** Evaluates standard/special subjects via calculation engines. If grade is resolved, adds $(\text{credits} \times \text{points})$. Divides by entered credits $\rightarrow \text{sem3Sgpa}$.
  4. **Sem 1 & 2 CGPA:**
     $$\text{CGPA}_{1,2} = \frac{\text{sem1Weighted} + \text{sem2Weighted}}{\text{sem1Credits} + \text{sem2Credits}}$$
  5. **All 3 Sems CGPA:**
     $$\text{CGPA}_{\text{All}} = \frac{\text{sem1Weighted} + \text{sem2Weighted} + \text{sem3Weighted}}{\text{sem1Credits} + \text{sem2Credits} + \text{sem3Credits}}$$
  6. Updates DOM elements: `#cgpaDisplay`, `#cgpaAllSemsDisplay`, `#sem1TabSgpa`, `#sem2TabSgpa`, `#sem3TabSgpa`, `#currentSemSgpaDisplay`.
  7. Invokes `saveToLocalStorage()`.

---

## 3. DOM Element Mappings & IDs

| DOM Selector / ID | Purpose |
| :--- | :--- |
| `#cgpaDisplay` | Header display for Sem 1 & 2 CGPA |
| `#cgpaAllSemsDisplay` | Header sub-badge for All 3 Semesters CGPA |
| `#tabSem1`, `#tabSem2`, `#tabSem3` | Tab navigation buttons |
| `#sem1TabSgpa`, `#sem2TabSgpa`, `#sem3TabSgpa` | Dynamic SGPA indicator pills on tabs |
| `#panelSem1`, `#panelSem2`, `#panelSem3` | Container panels for semester subject cards |
| `#sem1SubjectsGrid`, `#sem2SubjectsGrid` | Subject grid for dropdowns |
| `#sem3SubjectsContainer` | Subject grid for continuous assessment inputs |
| `#currentSemLabel`, `#currentSemSgpaDisplay` | Top-right summary card for the currently active tab |

---

## 4. LocalStorage Key Specification

| Storage Key | Format | Example Stored Value |
| :--- | :--- | :--- |
| `sgpa_sem1` | JSON Object | `{"Breadth of Computer Science 1": "A+", "Front-End Web Development": "O"}` |
| `sgpa_sem2` | JSON Object | `{"Back-End Web Development": "A", "Databases": "B+"}` |
| `sgpa_sem3` | JSON Object | `{"Object Oriented Programming": {"ca1": "35", "ca2": "38", "att": "92"}}` |
| `sgpa_active_tab` | String | `"sem3"` |

---

## 5. Error Handling & Edge Case Matrix

| Scenario | Input Condition | Expected Behavior |
| :--- | :--- | :--- |
| **Empty Input** | `""` or whitespace | Treats field as unentered; does not contribute to earned or max weight. |
| **Non-numeric Input** | Characters e.g. `"abc"` | `parseFloat()` returns `NaN`, input is ignored gracefully. |
| **Out-of-bound Values** | Score $> 100$ or $< 0$ | Math functions clamp score strictly between `0` and `100`. |
| **Partial Sprints** | 1 or 2 sprints entered without viva | Computes normalized percentage against 70% max weight, displays projected grade. |
| **Zero Credits Entered** | No subjects selected | Displays `0.00` / `-` without triggering divide-by-zero errors. |
| **Quota Exceeded in Storage** | Private Browsing / Full Storage | `try-catch` block catches storage error and logs warning without breaking UI. |
