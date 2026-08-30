import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  calculateCgpa,
  calculateSemesterGpa,
  getValidAcademicResults,
} from '../../services/academicCalculations';
import {
  fetchAdminStudents,
  fetchStudentTranscriptForAdmin,
  type AdminStudentItem,
} from '../../services/supabase/admin';
import type { StudentRecord, StudentResultItem } from '../../types';

type SemesterGroup = {
  semesterName: string;
  semesterOrder: number;
  results: StudentResultItem[];
  semesterGpa: number | null;
  semesterCreditUnits: number;
  semesterQualityPoints: number;
};

type SessionGroup = {
  sessionName: string;
  semesters: SemesterGroup[];
};

export function AdminTranscriptsPage() {
  const [students, setStudents] = useState<AdminStudentItem[] | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [targetStudent, setTargetStudent] = useState<StudentRecord | null>(null);
  const [results, setResults] = useState<StudentResultItem[] | null>(null);

  const [loadingStudents, setLoadingStudents] = useState<boolean>(true);
  const [loadingTranscript, setLoadingTranscript] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch student directory first
  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      const res = await fetchAdminStudents();
      if (!isMounted) return;
      if (res.error) {
        setError(res.error);
      } else if (res.data && res.data.length > 0) {
        setStudents(res.data);
        setSelectedStudentId(res.data[0].student_id);
      }
      setLoadingStudents(false);
    };
    void init();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch transcript when selected student changes
  const loadTranscript = useCallback(async (sId: string) => {
    if (!sId) return;
    setLoadingTranscript(true);
    setError(null);

    const res = await fetchStudentTranscriptForAdmin(sId);
    if (res.error) {
      setError(res.error);
      setTargetStudent(null);
      setResults(null);
    } else {
      setTargetStudent(res.student);
      setResults(res.results);
    }
    setLoadingTranscript(false);
  }, []);

  useEffect(() => {
    if (selectedStudentId) {
      void loadTranscript(selectedStudentId);
    }
  }, [selectedStudentId, loadTranscript]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Group results chronologically by academic session and semester
  const groupedSessions = useMemo<SessionGroup[]>(() => {
    if (!results || results.length === 0) return [];

    const sessionMap = new Map<string, Map<string, SemesterGroup>>();

    for (const item of results) {
      const sessionKey = item.session_name;
      const semesterKey = item.semester_name;

      if (!sessionMap.has(sessionKey)) {
        sessionMap.set(sessionKey, new Map());
      }
      const semesterMap = sessionMap.get(sessionKey)!;

      if (!semesterMap.has(semesterKey)) {
        semesterMap.set(semesterKey, {
          semesterName: item.semester_name,
          semesterOrder: item.semester_order,
          results: [],
          semesterGpa: null,
          semesterCreditUnits: 0,
          semesterQualityPoints: 0,
        });
      }

      semesterMap.get(semesterKey)!.results.push(item);
    }

    const sessions: SessionGroup[] = [];

    sessionMap.forEach((semestersMap, sessionName) => {
      const sortedSemesters = Array.from(semestersMap.values())
        .sort((a, b) => a.semesterOrder - b.semesterOrder)
        .map((semGroup) => {
          const sortedResults = [...semGroup.results].sort((a, b) =>
            a.course_code.localeCompare(b.course_code),
          );

          const validSemResults = getValidAcademicResults(sortedResults);

          const creditUnits = validSemResults.reduce(
            (sum, r) => sum + Number(r.credit_unit),
            0,
          );

          const qualityPoints = validSemResults.reduce(
            (sum, r) => sum + Number(r.grade_point) * Number(r.credit_unit),
            0,
          );

          const semesterGpa = calculateSemesterGpa(sortedResults);

          return {
            ...semGroup,
            results: sortedResults,
            semesterGpa,
            semesterCreditUnits: creditUnits,
            semesterQualityPoints: qualityPoints,
          };
        });

      sessions.push({
        sessionName,
        semesters: sortedSemesters,
      });
    });

    return sessions;
  }, [results]);

  // Overall Cumulative Calculations
  const cumulativeStats = useMemo(() => {
    if (!results || results.length === 0) {
      return {
        totalCourses: 0,
        totalCreditUnits: 0,
        totalQualityPoints: 0,
        cgpa: null,
      };
    }

    const validResults = getValidAcademicResults(results);

    const totalCourses = results.length;
    const totalCreditUnits = validResults.reduce(
      (sum, item) => sum + Number(item.credit_unit),
      0,
    );
    const totalQualityPoints = validResults.reduce(
      (sum, item) => sum + Number(item.grade_point) * Number(item.credit_unit),
      0,
    );
    const cgpa = calculateCgpa(results);

    return {
      totalCourses,
      totalCreditUnits,
      totalQualityPoints,
      cgpa,
    };
  }, [results]);

  return (
    <div className="space-y-6 print:space-y-4 print:p-0">
      {/* Top Selector & Action Bar (Hidden during print) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm print:hidden space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Admin Transcript Verification
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">Student Transcript Preview</h2>
            <p className="mt-1 text-sm text-slate-600">
              Select any student to verify or print their complete academic transcript.
            </p>
          </div>

          {!loadingTranscript && targetStudent && (
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              Print Transcript
            </button>
          )}
        </div>

        {/* Student Dropdown Selector */}
        {!loadingStudents && students && students.length > 0 && (
          <div className="max-w-md pt-2">
            <label htmlFor="selectAdminTranscriptStudent" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Select Student Record
            </label>
            <select
              id="selectAdminTranscriptStudent"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
            >
              {students.map((s) => (
                <option key={s.student_id} value={s.student_id}>
                  {s.full_name} — {s.matric_number} ({s.department ?? 'Dept'})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Loading State */}
      {(loadingStudents || loadingTranscript) && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
          <p className="mt-4 text-sm font-medium text-slate-600">
            Fetching student transcript record...
          </p>
        </div>
      )}

      {/* Error State */}
      {!loadingStudents && !loadingTranscript && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-red-900">Unable to load transcript</h3>
          <p className="mt-1 text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Transcript Document View */}
      {!loadingStudents && !loadingTranscript && !error && targetStudent && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm print:border-none print:shadow-none print:p-0 print:m-0">
          {/* Institutional Document Header */}
          <div className="border-b-2 border-slate-900 pb-6 text-center">
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-slate-900">
              Federal Polytechnic Offa
            </h1>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.25em] text-slate-600">
              Student Result & Transcript Management Portal
            </p>
            <div className="mt-4 inline-block border-y border-slate-300 py-1 px-6">
              <h2 className="text-base font-bold uppercase tracking-widest text-slate-900">
                Unofficial Academic Transcript
              </h2>
            </div>
          </div>

          {/* Student Identity Metadata Grid */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5 print:bg-slate-50 print:border-slate-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Student Name:
                </span>
                <p className="font-bold text-slate-900">{targetStudent.full_name}</p>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Matriculation Number:
                </span>
                <p className="font-mono font-bold text-slate-900">{targetStudent.matric_number}</p>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Department / Programme:
                </span>
                <p className="font-medium text-slate-800">{targetStudent.department ?? 'N/A'}</p>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Level of Enrollment:
                </span>
                <p className="font-medium text-slate-800">{targetStudent.level_of_enrollment}</p>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Student Email:
                </span>
                <p className="font-medium text-slate-800">{targetStudent.email ?? 'N/A'}</p>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Academic Status:
                </span>
                <p className="font-medium text-slate-800 capitalize">{targetStudent.status}</p>
              </div>
            </div>
          </div>

          {/* Empty Academic History State */}
          {(!results || results.length === 0) && (
            <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="text-base font-semibold text-slate-800">No Academic Results Found</p>
              <p className="mt-1 text-sm text-slate-600">
                There are currently no published course results recorded for this student account.
              </p>
            </div>
          )}

          {/* Academic History Sections */}
          {groupedSessions.length > 0 && (
            <div className="mt-8 space-y-8 print:space-y-6">
              {groupedSessions.map((sessionGroup) => (
                <div
                  key={sessionGroup.sessionName}
                  className="space-y-6 print:space-y-4 print:break-inside-avoid"
                >
                  <div className="border-b border-slate-300 pb-1">
                    <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide">
                      {sessionGroup.sessionName} Academic Session
                    </h3>
                  </div>

                  {sessionGroup.semesters.map((semesterGroup) => (
                    <div
                      key={`${sessionGroup.sessionName}-${semesterGroup.semesterName}`}
                      className="rounded-xl border border-slate-200 overflow-hidden print:border-slate-300 print:break-inside-avoid"
                    >
                      <div className="border-b border-slate-200 bg-slate-100 px-4 py-2.5 print:bg-slate-100">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                            {semesterGroup.semesterName}
                          </h4>
                          <span className="text-xs font-bold text-slate-700">
                            Semester GPA: {semesterGroup.semesterGpa === null ? 'N/A' : semesterGroup.semesterGpa.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Course Results Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs sm:text-sm">
                          <thead className="border-b border-slate-200 bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider text-[0.7rem] print:bg-slate-50">
                            <tr>
                              <th scope="col" className="px-4 py-2.5">Course Code</th>
                              <th scope="col" className="px-4 py-2.5">Course Title</th>
                              <th scope="col" className="px-4 py-2.5 text-center">Credit Units</th>
                              <th scope="col" className="px-4 py-2.5 text-center">Score</th>
                              <th scope="col" className="px-4 py-2.5 text-center">Grade</th>
                              <th scope="col" className="px-4 py-2.5 text-center">Grade Point</th>
                              <th scope="col" className="px-4 py-2.5 text-center">Quality Points</th>
                              <th scope="col" className="px-4 py-2.5">Remark</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
                            {semesterGroup.results.map((row) => {
                              const qualityPoints = (row.grade_point * row.credit_unit).toFixed(2);
                              return (
                                <tr key={row.result_id} className="hover:bg-slate-50/50 print:hover:bg-transparent">
                                  <td className="px-4 py-2.5 font-mono font-bold text-slate-900">
                                    {row.course_code}
                                  </td>
                                  <td className="px-4 py-2.5">{row.course_title}</td>
                                  <td className="px-4 py-2.5 text-center">{row.credit_unit}</td>
                                  <td className="px-4 py-2.5 text-center font-mono">{row.score.toFixed(2)}</td>
                                  <td className="px-4 py-2.5 text-center font-bold">{row.grade}</td>
                                  <td className="px-4 py-2.5 text-center font-mono">{row.grade_point.toFixed(2)}</td>
                                  <td className="px-4 py-2.5 text-center font-mono font-semibold">{qualityPoints}</td>
                                  <td className="px-4 py-2.5 text-slate-600 italic">
                                    {row.remark ?? 'Pass'}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Semester Summary Footer Bar */}
                      <div className="border-t border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 flex flex-wrap justify-between gap-4 print:bg-slate-50">
                        <div>
                          <span>Semester Earned Units: </span>
                          <span className="font-bold text-slate-900">{semesterGroup.semesterCreditUnits}</span>
                        </div>
                        <div>
                          <span>Semester Quality Points: </span>
                          <span className="font-bold text-slate-900">{semesterGroup.semesterQualityPoints.toFixed(2)}</span>
                        </div>
                        <div>
                          <span>Semester GPA: </span>
                          <span className="font-bold text-slate-900">
                            {semesterGroup.semesterGpa === null ? 'N/A' : semesterGroup.semesterGpa.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Cumulative Performance Summary Block */}
          {groupedSessions.length > 0 && (
            <div className="mt-8 rounded-xl border-2 border-slate-900 bg-slate-900 p-5 text-white print:bg-slate-100 print:text-slate-900 print:border-slate-800 print:break-inside-avoid">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 print:text-slate-600">
                Cumulative Academic Performance Summary
              </h3>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="rounded-lg bg-slate-800 p-3 print:bg-white print:border print:border-slate-300">
                  <p className="text-[0.7rem] uppercase font-bold text-slate-400 print:text-slate-500">
                    Courses Recorded
                  </p>
                  <p className="mt-1 text-xl font-bold">{cumulativeStats.totalCourses}</p>
                </div>

                <div className="rounded-lg bg-slate-800 p-3 print:bg-white print:border print:border-slate-300">
                  <p className="text-[0.7rem] uppercase font-bold text-slate-400 print:text-slate-500">
                    Total Earned Credits
                  </p>
                  <p className="mt-1 text-xl font-bold">{cumulativeStats.totalCreditUnits}</p>
                </div>

                <div className="rounded-lg bg-slate-800 p-3 print:bg-white print:border print:border-slate-300">
                  <p className="text-[0.7rem] uppercase font-bold text-slate-400 print:text-slate-500">
                    Total Quality Points
                  </p>
                  <p className="mt-1 text-xl font-bold">{cumulativeStats.totalQualityPoints.toFixed(2)}</p>
                </div>

                <div className="rounded-lg bg-sky-600 p-3 print:bg-slate-900 print:text-white">
                  <p className="text-[0.7rem] uppercase font-bold text-sky-100 print:text-slate-300">
                    Overall CGPA
                  </p>
                  <p className="mt-1 text-xl font-black">
                    {cumulativeStats.cgpa === null ? 'N/A' : cumulativeStats.cgpa.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Official Signatures & Unofficial Disclaimer Block */}
          <div className="mt-12 border-t border-slate-300 pt-6 space-y-6 print:break-inside-avoid">
            <div className="grid grid-cols-2 gap-8 text-center pt-4">
              <div>
                <div className="mx-auto w-48 border-b border-dashed border-slate-400 pb-1" />
                <p className="mt-1 text-xs font-semibold uppercase text-slate-600">
                  Dean / Head of Department
                </p>
                <p className="text-[0.7rem] text-slate-400">(Signature & Date Placeholder)</p>
              </div>

              <div>
                <div className="mx-auto w-48 border-b border-dashed border-slate-400 pb-1" />
                <p className="mt-1 text-xs font-semibold uppercase text-slate-600">
                  Registrar / Academic Affairs
                </p>
                <p className="text-[0.7rem] text-slate-400">(Institutional Seal Placeholder)</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center print:border-slate-300">
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                <strong>DISCLAIMER:</strong> This document is an unofficial academic transcript preview generated from the Student Portal. It is issued for informational purposes only and does not constitute an official registrar-certified transcript.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
