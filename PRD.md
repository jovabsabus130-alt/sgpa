# Product Requirements Document (PRD)

**Product Name:** SGPA & CGPA Academic Calculator  
**Version:** 1.0.0  
**Status:** Active / Production-Ready  
**Target Platform:** Web Browsers (Mobile & Desktop Responsive)  

---

## 1. Executive Summary & Objective

Academic grading systems often involve intricate weight distributions across continuous assessments, laboratory evaluations, attendance tiers, and specialized partner projects. Calculating Semester Grade Point Average (SGPA) and Cumulative Grade Point Average (CGPA) manually is error-prone, unintuitive, and time-consuming for students.

The **SGPA & CGPA Academic Calculator** is a fast, client-side web application designed to compute accurate semester-wise SGPAs and cumulative CGPAs across multiple semesters (Semester 1, Semester 2, and Semester 3). The application provides immediate real-time feedback on user inputs, projects potential grades even with partial continuous assessment scores, and persists all data locally in the user's browser without requiring a backend server.

---

## 2. Target Audience & User Personas

| Persona | Description | Needs & Goals |
| :--- | :--- | :--- |
| **Enrolled Engineering/CS Students** | Students enrolled in the specific academic curriculum across Semesters 1, 2, and 3. | Fast, real-time SGPA calculation; instant grade projection based on ongoing CA marks; overall CGPA tracking. |
| **Academic Mentors / Class Coordinators** | Faculty or advisors guiding students on target grade requirements. | Quick projection tool to demonstrate what minimum CA or Viva scores are needed to achieve a target letter grade or SGPA. |

---

## 3. Product Scope & Curriculum Configuration

The application covers the academic structure across three semesters with a total of **68 credits**:

### 3.1 Semester 1 (26 Total Credits)
- Standard Letter Grade Dropdowns (O, A+, A, B+, B, C, D, E/F):
  - *Breadth of Computer Science 1* (4 Credits)
  - *Front-End Web Development* (4 Credits)
  - *Problem Solving Using Programming* (4 Credits)
  - *Critical Thinking 101* (4 Credits)
  - *Design for Developers* (3 Credits)
  - *Discrete Mathematics and Probability* (4 Credits)
  - *Professional Skills for the Workplace* (3 Credits)

### 3.2 Semester 2 (20 Total Credits)
- Standard Letter Grade Dropdowns:
  - *Breadth of Computer Science 2* (4 Credits)
  - *Back-End Web Development* (5 Credits)
  - *Databases* (3 Credits)
  - *Full Stack Development* (4 Credits)
  - *Learning How to Learn* (4 Credits)

### 3.3 Semester 3 (22 Total Credits)
- Granular Continuous Assessment (CA1–CA5) & Attendance for standard subjects:
  - *Object Oriented Programming* (3 Credits)
  - *Object Oriented Programming Laboratory* (1 Credit)
  - *Database Management Systems* (3 Credits)
  - *Economics, Politics and Rural Society Development* (3 Credits)
  - *Mathematical Thinking 101* (4 Credits)
- Industry Partner Project & Viva for specialized subject:
  - *Integrated Work with a Partner Company-I* (8 Credits)

---

## 4. Functional Requirements

### 4.1 Grade Scale & Points Mapping
The application calculates grade points based on a 10-point scale:

| Mark Range (%) | Letter Grade | Grade Points |
| :--- | :---: | :---: |
| 91 – 100 | **O** (Outstanding) | 10 |
| 81 – 90 | **A+** (Excellent) | 9 |
| 71 – 80 | **A** (Very Good) | 8 |
| 61 – 70 | **B+** (Good) | 7 |
| 51 – 60 | **B** (Above Average) | 6 |
| 41 – 50 | **C** (Average) | 5 |
| 31 – 40 | **D** (Pass) | 4 |
| 0 – 30 | **E / F** (Fail) | 0 |

### 4.2 Attendance Marking Tier (Semester 3 Standard Subjects)
Attendance contributes up to 5 scaled marks to the final score:

| Attendance Percentage | Scaled Attendance Marks |
| :--- | :---: |
| $\ge 90\%$ | 5 Marks |
| $85\% \le \text{Att} < 90\%$ | 4 Marks |
| $80\% \le \text{Att} < 85\%$ | 3 Marks |
| $75\% \le \text{Att} < 80\%$ | 2 Marks |
| $< 75\%$ | 0 Marks |

### 4.3 Evaluation Engine Rules

#### Rule 1: Semester 1 & 2 Standard Grade Selection
$$\text{SGPA} = \frac{\sum (\text{Subject Credits} \times \text{Grade Points})}{\sum \text{Credits Entered}}$$

#### Rule 2: Semester 3 Standard Subjects (Strict Real-Time Evaluation)
Each continuous assessment has strict boundary limits:
- $CA_1, CA_2, CA_3 \in [0, 40]$
- $CA_4, CA_5 \in [0, 60]$
- Attendance $\% \in [0, 100]$

Any assessment not yet given or left blank defaults to 0. No optimistic or future projected score is assumed; SGPA and subject scores are strictly computed for the actual marks entered:
$$\text{Score} = \text{Round}\left( \left(\frac{90}{5 \times 40}\right) \times (CA_1 + CA_2 + CA_3) + \left(\frac{90}{5 \times 60}\right) \times (CA_4 + CA_5) + \text{Attendance Marks} \right)$$
$$\text{Score} = \min(100, \max(0, \text{Score}))$$

#### Rule 3: Semester 3 Specialized Subject (*Integrated Work with a Partner Company-I*)
Curriculum grading for the specialized 8-credit industry partner subject comprises two primary components:

1. **Kalvium Continuous Evaluation (Scaled down to 70 Marks)**:
   - **Attendance (25%)**:
     $$\text{Attendance Score} = \left(\frac{\text{Slots Present}}{\text{Slots Counted}}\right) \times 25$$
   - **Worklog Submission (25%)**:
     $$\text{Worklog Score} = \left(\frac{\text{Days Submitted on Time}}{\text{Days Counted}}\right) \times 25$$
   - **Kalvium Viva (50%)**:
     Evaluated across 3 vivas (each out of 25 marks):
     $$\text{Viva Score} = \left(\frac{Viva_1 + Viva_2 + Viva_3}{3}\right) \times \left(\frac{50}{25}\right) = \left(\frac{Viva_1 + Viva_2 + Viva_3}{3}\right) \times 2$$
   - **Kalvium Total (out of 100)**:
     $$\text{Kalvium}_{100} = \text{Attendance Score} + \text{Worklog Score} + \text{Viva Score}$$
   - **Kalvium Scaled Submission (out of 70)**:
     $$\text{Kalvium}_{70} = \text{Kalvium}_{100} \times 0.70$$

2. **University Faculty Viva (30 Marks)**:
   - Evaluated by University Faculty towards the end of the semester: $\text{Uni Viva} \in [0, 30]$.

3. **Final Total Score**:
   Any unentered parameter defaults to 0 without future projections:
   $$\text{Final Score} = \min(100, \max(0, \text{Round}(\text{Kalvium}_{70} + \text{Uni Viva})))$$

4. **Working Hours & Form Submission Guidelines (`(i)` Tooltip)**:
   - **Simulated Work:** 3 hours / slots per day count.
   - **Internship:** 5 hours / slots per day count.
   - **Days Counted:** Monday to Friday only (Saturday & Sunday excluded).
   - **Daily Forms:** The exact same schedule and daily rules apply to daily worklog form submissions.

### 4.4 Cumulative CGPA Aggregation
- **Overall CGPA (Sem 1 & 2)**: Primary metric in header computed across completed subjects of Semester 1 and Semester 2:
  $$\text{CGPA}_{1,2} = \frac{\text{sem1Weighted} + \text{sem2Weighted}}{\text{sem1Credits} + \text{sem2Credits}}$$
- **All 3 Sems CGPA**: Cumulative grade point average across all three semesters:
  $$\text{CGPA}_{\text{All}} = \frac{\text{sem1Weighted} + \text{sem2Weighted} + \text{sem3Weighted}}{\text{sem1Credits} + \text{sem2Credits} + \text{sem3Credits}}$$

### 4.5 Data Persistence
- All grade dropdown selections, numeric CA inputs, and active tab preferences are automatically saved to browser `localStorage`.
- Zero user data is wiped upon refreshing or reopening the application.

---

## 5. Non-Functional Requirements

- **Performance:** 100% instantaneous recalculation (< 5ms response time on input events).
- **Zero Backend Dependency:** Runs entirely in the client browser; zero external APIs, zero server infrastructure costs.
- **Aesthetics & UI:** Modern green-and-white theme, ambient glow background effects, glassmorphic cards, typography powered by *Plus Jakarta Sans* and *JetBrains Mono*.
- **Responsiveness:** Full 100% width fluid responsive layout across mobile screens (320px+), tablets, and high-resolution desktop monitors.
- **Accessibility:** Semantic HTML5 structure, ARIA tabs (`role="tablist"`, `role="tab"`, `role="tabpanel"`), accessible form labels, and high contrast visibility.

---

## 6. Future Enhancements

1. **PDF / Transcript Export:** Ability to download an official-looking grade report card.
2. **Target SGPA Goal Calculator:** Reverse calculator allowing users to set a desired SGPA and discover needed scores in remaining assessments.
3. **Multi-Curriculum / Custom Subjects:** Option to customize subject names and credit allocations for other departments or semesters (Sem 4–8).
