import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  deriveGradeFromScore,
  fetchAdminCourses,
  fetchAdminResults,
  fetchAdminSemesters,
  fetchAdminStudents,
  saveAdminResult,
  type AdminResultViewRow,
  type CourseRow,
  type SemesterRow,
  type AdminStudentItem,
} from '../../services/supabase/admin';

export function AdminResultsPage() {
  const [results, setResults] = useState<AdminResultViewRow[] | null>(null);
  const [students, setStudents] = useState<AdminStudentItem[] | null>(null);
  const [courses, setCourses] = useState<CourseRow[] | null>(null);
  const [semesters, setSemesters] = useState<SemesterRow[] | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Filters
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('ALL');
  const [selectedSemesterFilter, setSelectedSemesterFilter] = useState<string>('ALL');

  // Form State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingResult, setEditingResult] = useState<AdminResultViewRow | null>(null);

  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>('');
  const [score, setScore] = useState<string>('75.00');
  const [grade, setGrade] = useState<string>('A');
  const [gradePoint, setGradePoint] = useState<number>(4.0);
  const [remark, setRemark] = useState<string>('Excellent');
  const [isManualOverride, setIsManualOverride] = useState<boolean>(false);

  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const [resResults, resStudents, resCourses, resSemesters] = await Promise.all([
      fetchAdminResults(),
      fetchAdminStudents(),
      fetchAdminCourses(),
      fetchAdminSemesters(),
    ]);

    if (resResults.error) {
      setError(resResults.error);
    } else {
      setError(null);
      setResults(resResults.data);
    }

    if (resStudents.data) setStudents(resStudents.data);
    if (resCourses.data) setCourses(resCourses.data);
    if (resSemesters.data) setSemesters(resSemesters.data);

    setLoading(false);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      const [resResults, resStudents, resCourses, resSemesters] = await Promise.all([
        fetchAdminResults(),
        fetchAdminStudents(),
        fetchAdminCourses(),
        fetchAdminSemesters(),
      ]);

      if (!isMounted) return;

      if (resResults.error) {
        setError(resResults.error);
      } else {
        setError(null);
        setResults(resResults.data);
      }

      if (resStudents.data) setStudents(resStudents.data);
      if (resCourses.data) setCourses(resCourses.data);
      if (resSemesters.data) setSemesters(resSemesters.data);

      setLoading(false);
    };

    void initialize();

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle Score Input Change with Auto-Derivation
  const handleScoreChange = (val: string) => {
    setScore(val);
    const num = Number(val);

    if (!isNaN(num) && !isManualOverride) {
      const derived = deriveGradeFromScore(num);
      setGrade(derived.grade);
      setGradePoint(derived.grade_point);
      setRemark(derived.remark);
    }
  };

  const openCreateModal = () => {
    setEditingResult(null);
    setSelectedStudentId(students && students.length > 0 ? students[0].student_id : '');
    setSelectedCourseId(courses && courses.length > 0 ? courses[0].course_id : '');
    setSelectedSemesterId(semesters && semesters.length > 0 ? semesters[0].semester_id : '');
    setScore('75.00');

    const derived = deriveGradeFromScore(75);
    setGrade(derived.grade);
    setGradePoint(derived.grade_point);
    setRemark(derived.remark);
    setIsManualOverride(false);

    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (resRow: AdminResultViewRow) => {
    setEditingResult(resRow);
    setSelectedStudentId(resRow.student_id);
    setSelectedCourseId(resRow.course_id);
    setSelectedSemesterId(resRow.semester_id);
    setScore(resRow.score.toString());
    setGrade(resRow.grade);
    setGradePoint(resRow.grade_point);
    setRemark(resRow.remark || '');
    setIsManualOverride(true);

    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingResult(null);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedCourseId || !selectedSemesterId) {
      setFormError('Student, Course, and Semester context selection are required.');
      return;
    }

    const numScore = Number(score);
    if (isNaN(numScore) || numScore < 0 || numScore > 100) {
      setFormError('Numerical Score must be a number between 0.00 and 100.00.');
      return;
    }

    if (isNaN(gradePoint) || gradePoint < 0 || gradePoint > 5) {
      setFormError('Grade Point must be between 0.00 and 5.00.');
      return;
    }

    setFormSubmitting(true);
    setFormError(null);

    const res = await saveAdminResult({
      result_id: editingResult?.result_id,
      student_id: selectedStudentId,
      course_id: selectedCourseId,
      semester_id: selectedSemesterId,
      score: numScore,
      grade: grade.trim(),
      grade_point: gradePoint,
      remark: remark ? remark.trim() : null,
    });

    setFormSubmitting(false);

    if (res.error) {
      setFormError(res.error);
    } else {
      setActionSuccess(
        `Result record for student ${editingResult ? 'updated' : 'saved'} successfully.`,
      );
      closeModal();
      void loadData();
    }
  };

  const filteredResults = useMemo(() => {
    if (!results) return [];
    return results.filter((r) => {
      const matchStudent =
        selectedStudentFilter === 'ALL' || r.student_id === selectedStudentFilter;
      const matchSemester =
        selectedSemesterFilter === 'ALL' || r.semester_id === selectedSemesterFilter;
      return matchStudent && matchSemester;
    });
  }, [results, selectedStudentFilter, selectedSemesterFilter]);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Result Management
          </p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">Student Result Records</h2>
          <p className="mt-1 text-sm text-slate-600">
            Enter numerical course scores, derive letter grades, and publish semester result entries.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none"
        >
          + Enter / Record Result
        </button>
      </div>

      {/* Notification Toast */}
      {actionSuccess && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 flex justify-between items-center shadow-sm">
          <span>{actionSuccess}</span>
          <button
            type="button"
            onClick={() => setActionSuccess(null)}
            className="text-emerald-600 hover:text-emerald-900 font-bold ml-4"
          >
            &times;
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
          <p className="mt-4 text-sm font-medium text-slate-600">Loading student results...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-red-900">Failed to load results</h3>
          <p className="mt-1 text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Main View */}
      {!loading && !error && results && (
        <div className="space-y-4">
          {/* Filters Toolbar */}
          <div className="grid gap-4 sm:grid-cols-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div>
              <label htmlFor="filterStudent" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Filter by Student
              </label>
              <select
                id="filterStudent"
                value={selectedStudentFilter}
                onChange={(e) => setSelectedStudentFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
              >
                <option value="ALL">All Students</option>
                {students?.map((s) => (
                  <option key={s.student_id} value={s.student_id}>
                    {s.full_name} ({s.matric_number})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="filterSemester" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Filter by Semester
              </label>
              <select
                id="filterSemester"
                value={selectedSemesterFilter}
                onChange={(e) => setSelectedSemesterFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
              >
                <option value="ALL">All Semesters</option>
                {semesters?.map((sem) => (
                  <option key={sem.semester_id} value={sem.semester_id}>
                    {sem.academic_sessions?.session_name ?? 'Session'} - {sem.semester_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Table */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">Student</th>
                    <th scope="col" className="px-6 py-3.5">Course</th>
                    <th scope="col" className="px-6 py-3.5">Session / Semester</th>
                    <th scope="col" className="px-6 py-3.5 text-center">Score</th>
                    <th scope="col" className="px-6 py-3.5 text-center">Grade</th>
                    <th scope="col" className="px-6 py-3.5 text-center">Grade Point</th>
                    <th scope="col" className="px-6 py-3.5 text-center">Quality Points</th>
                    <th scope="col" className="px-6 py-3.5">Remark</th>
                    <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                  {filteredResults.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-10 text-center text-slate-500">
                        No result records match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredResults.map((item) => {
                      const creditUnit = item.courses?.credit_unit ?? 0;
                      const qualityPoints = (item.grade_point * creditUnit).toFixed(2);
                      return (
                        <tr key={item.result_id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-900">{item.students?.full_name ?? 'N/A'}</p>
                            <p className="text-xs font-mono text-slate-500">{item.students?.matric_number}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-mono font-bold text-slate-900">{item.courses?.course_code ?? 'N/A'}</p>
                            <p className="text-xs text-slate-600 truncate max-w-xs">{item.courses?.course_title}</p>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-700">
                            <p className="font-semibold">{item.semesters?.academic_sessions?.session_name}</p>
                            <p>{item.semesters?.semester_name}</p>
                          </td>
                          <td className="px-6 py-4 text-center font-mono font-bold">
                            {item.score.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-center font-bold">
                            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-800">
                              {item.grade}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center font-mono font-semibold">
                            {item.grade_point.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-center font-mono font-bold text-slate-900">
                            {qualityPoints}
                          </td>
                          <td className="px-6 py-4 text-xs italic text-slate-600">
                            {item.remark ?? 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => openEditModal(item)}
                              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                            >
                              Edit Result
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create / Edit Result */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-xl font-bold text-slate-900">
              {editingResult ? 'Edit Student Result' : 'Enter / Record Result'}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Select context and enter score. Letter grades and grade points are auto-derived using the Polytechnic grading scale.
            </p>

            {formError && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label htmlFor="resultStudent" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Select Student *
                </label>
                <select
                  id="resultStudent"
                  required
                  disabled={Boolean(editingResult)}
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none disabled:bg-slate-100"
                >
                  {students?.map((s) => (
                    <option key={s.student_id} value={s.student_id}>
                      {s.full_name} ({s.matric_number})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="resultSemester" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Semester Context *
                  </label>
                  <select
                    id="resultSemester"
                    required
                    disabled={Boolean(editingResult)}
                    value={selectedSemesterId}
                    onChange={(e) => setSelectedSemesterId(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none disabled:bg-slate-100"
                  >
                    {semesters?.map((sem) => (
                      <option key={sem.semester_id} value={sem.semester_id}>
                        {sem.academic_sessions?.session_name} - {sem.semester_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="resultCourse" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Course Offering *
                  </label>
                  <select
                    id="resultCourse"
                    required
                    disabled={Boolean(editingResult)}
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none disabled:bg-slate-100"
                  >
                    {courses?.map((c) => (
                      <option key={c.course_id} value={c.course_id}>
                        {c.course_code} ({c.credit_unit} CU)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="resultScore" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Numerical Score * (0.00 - 100.00)
                </label>
                <input
                  id="resultScore"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  required
                  value={score}
                  onChange={(e) => handleScoreChange(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono font-bold focus:border-slate-900 focus:outline-none"
                  placeholder="e.g. 78.50"
                />
              </div>

              {/* Derived / Override Options */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Grading Scale Derivation
                  </span>
                  <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isManualOverride}
                      onChange={(e) => setIsManualOverride(e.target.checked)}
                      className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                    Manual Override
                  </label>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="resultGrade" className="block text-[0.7rem] font-bold uppercase text-slate-500 mb-1">
                      Grade
                    </label>
                    <input
                      id="resultGrade"
                      type="text"
                      disabled={!isManualOverride}
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm font-bold text-center uppercase focus:border-slate-900 focus:outline-none disabled:bg-slate-100"
                    />
                  </div>

                  <div>
                    <label htmlFor="resultGradePoint" className="block text-[0.7rem] font-bold uppercase text-slate-500 mb-1">
                      Grade Point
                    </label>
                    <input
                      id="resultGradePoint"
                      type="number"
                      step="0.01"
                      disabled={!isManualOverride}
                      value={gradePoint}
                      onChange={(e) => setGradePoint(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm font-mono font-bold text-center focus:border-slate-900 focus:outline-none disabled:bg-slate-100"
                    />
                  </div>

                  <div>
                    <label htmlFor="resultRemark" className="block text-[0.7rem] font-bold uppercase text-slate-500 mb-1">
                      Remark
                    </label>
                    <input
                      id="resultRemark"
                      type="text"
                      disabled={!isManualOverride}
                      value={remark}
                      onChange={(e) => setRemark(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-center focus:border-slate-900 focus:outline-none disabled:bg-slate-100"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {formSubmitting ? 'Saving...' : editingResult ? 'Update Result' : 'Save Result'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
