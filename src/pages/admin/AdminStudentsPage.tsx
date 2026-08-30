import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  createAdminStudent,
  fetchAdminStudents,
  updateAdminStudent,
  type AdminStudentItem,
  type CreateStudentPayload,
} from '../../services/supabase/admin';

export function AdminStudentsPage() {
  const [students, setStudents] = useState<AdminStudentItem[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<AdminStudentItem | null>(null);
  const [selectedDetailsStudent, setSelectedDetailsStudent] = useState<AdminStudentItem | null>(null);
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState<string>('');
  const [matricNumber, setMatricNumber] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [levelOfEnrollment, setLevelOfEnrollment] = useState<string>('HND 1');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [status, setStatus] = useState<string>('active');

  const loadData = useCallback(async () => {
    const res = await fetchAdminStudents();
    if (res.error) {
      setError(res.error);
      setStudents(null);
    } else {
      setError(null);
      setStudents(res.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      const res = await fetchAdminStudents();
      if (!isMounted) return;

      if (res.error) {
        setError(res.error);
        setStudents(null);
      } else {
        setError(null);
        setStudents(res.data);
      }
      setLoading(false);
    };

    void initialize();

    return () => {
      isMounted = false;
    };
  }, []);

  const openCreateModal = () => {
    setEditingStudent(null);
    setFullName('');
    setMatricNumber('');
    setDepartment('Networking and Cloud Computing');
    setLevelOfEnrollment('HND 2');
    setEmail('');
    setPhone('');
    setStatus('active');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (student: AdminStudentItem) => {
    setEditingStudent(student);
    setFullName(student.full_name);
    setMatricNumber(student.matric_number);
    setDepartment(student.department || '');
    setLevelOfEnrollment(student.level_of_enrollment);
    setEmail(student.email || '');
    setPhone(student.phone || '');
    setStatus(student.status);
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !matricNumber.trim() || !levelOfEnrollment.trim()) {
      setFormError('Full Name, Matriculation Number, and Level are required.');
      return;
    }

    setFormSubmitting(true);
    setFormError(null);

    if (editingStudent) {
      const res = await updateAdminStudent(editingStudent.student_id, {
        full_name: fullName,
        matric_number: matricNumber,
        department,
        level_of_enrollment: levelOfEnrollment,
        email,
        phone,
        status,
      });

      setFormSubmitting(false);

      if (res.error) {
        setFormError(res.error);
      } else {
        setActionSuccess(`Student "${fullName}" updated successfully.`);
        closeModal();
        void loadData();
      }
    } else {
      const payload: CreateStudentPayload = {
        full_name: fullName,
        matric_number: matricNumber,
        department,
        level_of_enrollment: levelOfEnrollment,
        email,
        phone,
      };

      const res = await createAdminStudent(payload);
      setFormSubmitting(false);

      if (res.error) {
        setFormError(res.error);
      } else {
        setActionSuccess(`Student "${fullName}" created successfully.`);
        closeModal();
        void loadData();
      }
    }
  };

  const handleToggleStatus = async (student: AdminStudentItem) => {
    const newStatus = student.status === 'active' ? 'inactive' : 'active';
    const res = await updateAdminStudent(student.student_id, { status: newStatus });
    if (res.error) {
      setError(res.error);
    } else {
      setActionSuccess(
        `Student "${student.full_name}" is now ${newStatus === 'active' ? 'Active' : 'Inactive'}.`,
      );
      void loadData();
    }
  };

  // Derive filter dropdown lists
  const departmentsList = useMemo(() => {
    if (!students) return [];
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.department) set.add(s.department);
    });
    return Array.from(set).sort();
  }, [students]);

  const levelsList = useMemo(() => {
    if (!students) return [];
    const set = new Set<string>();
    students.forEach((s) => set.add(s.level_of_enrollment));
    return Array.from(set).sort();
  }, [students]);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    if (!students) return [];

    return students.filter((s) => {
      const matchesSearch =
        s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.matric_number.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDept =
        departmentFilter === 'ALL' || s.department === departmentFilter;

      const matchesLevel =
        levelFilter === 'ALL' || s.level_of_enrollment === levelFilter;

      const matchesStatus =
        statusFilter === 'ALL' || s.status === statusFilter;

      return matchesSearch && matchesDept && matchesLevel && matchesStatus;
    });
  }, [students, searchQuery, departmentFilter, levelFilter, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Student Management
          </p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">Student Directory</h2>
          <p className="mt-1 text-sm text-slate-600">
            View, search, create, and update student profiles.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none"
        >
          + Add New Student
        </button>
      </div>

      {/* Toast Notification */}
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

      {/* State A: Loading */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
          <p className="mt-4 text-sm font-medium text-slate-600">Loading student directory...</p>
        </div>
      )}

      {/* State B: Error */}
      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-red-900">Failed to load students</h3>
          <p className="mt-1 text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* State C: Main Table View */}
      {!loading && !error && students && (
        <div className="space-y-4">
          {/* Filters & Search Toolbar */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div>
              <label htmlFor="searchQuery" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Search Student
              </label>
              <input
                id="searchQuery"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Name or Matric Number..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="departmentFilter" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Department
              </label>
              <select
                id="departmentFilter"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
              >
                <option value="ALL">All Departments</option>
                {departmentsList.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="levelFilter" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Level
              </label>
              <select
                id="levelFilter"
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
              >
                <option value="ALL">All Levels</option>
                {levelsList.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="statusFilter" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Status
              </label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>

          {/* Table View */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">Student Name</th>
                    <th scope="col" className="px-6 py-3.5">Matric Number</th>
                    <th scope="col" className="px-6 py-3.5">Department</th>
                    <th scope="col" className="px-6 py-3.5">Level</th>
                    <th scope="col" className="px-6 py-3.5">Status</th>
                    <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                        No student records match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((item) => (
                      <tr key={item.student_id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {item.full_name}
                        </td>
                        <td className="px-6 py-4 font-mono font-semibold text-slate-700">
                          {item.matric_number}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {item.department ?? 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {item.level_of_enrollment}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              item.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                                : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
                            }`}
                          >
                            {item.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => setSelectedDetailsStudent(item)}
                            className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(item)}
                            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                              item.status === 'active'
                                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {item.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create / Edit Student */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-xl font-bold text-slate-900">
              {editingStudent ? 'Edit Student Record' : 'Add New Student'}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              {editingStudent
                ? 'Update student details. Passwords are managed securely via Supabase Auth.'
                : 'Enter details for the new student record. Hard deletion is disabled to preserve records.'}
            </p>

            {formError && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label htmlFor="modalFullName" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Full Name *
                </label>
                <input
                  id="modalFullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                  placeholder="e.g. Adebayo Blessing Funke"
                />
              </div>

              <div>
                <label htmlFor="modalMatricNumber" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Matriculation Number *
                </label>
                <input
                  id="modalMatricNumber"
                  type="text"
                  required
                  value={matricNumber}
                  onChange={(e) => setMatricNumber(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:border-slate-900 focus:outline-none"
                  placeholder="e.g. FPO/HND/NCC/2024/001"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="modalDepartment" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Department
                  </label>
                  <input
                    id="modalDepartment"
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                    placeholder="e.g. Networking and Cloud Computing"
                  />
                </div>

                <div>
                  <label htmlFor="modalLevel" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Level *
                  </label>
                  <select
                    id="modalLevel"
                    value={levelOfEnrollment}
                    onChange={(e) => setLevelOfEnrollment(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                  >
                    <option value="ND 1">ND 1</option>
                    <option value="ND 2">ND 2</option>
                    <option value="HND 1">HND 1</option>
                    <option value="HND 2">HND 2</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="modalEmail" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Email Address
                  </label>
                  <input
                    id="modalEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                    placeholder="student@fedpoffa.edu.ng"
                  />
                </div>

                <div>
                  <label htmlFor="modalPhone" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Phone Number
                  </label>
                  <input
                    id="modalPhone"
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                    placeholder="e.g. +2348012345678"
                  />
                </div>
              </div>

              {editingStudent && (
                <div>
                  <label htmlFor="modalStatus" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Status
                  </label>
                  <select
                    id="modalStatus"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                  >
                    <option value="active">Active Student</option>
                    <option value="inactive">Inactive / Deactivated</option>
                  </select>
                </div>
              )}

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
                  {formSubmitting ? 'Saving...' : editingStudent ? 'Update Record' : 'Create Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details View Drawer/Modal */}
      {selectedDetailsStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Student Profile</p>
                <h3 className="text-xl font-bold text-slate-900">{selectedDetailsStudent.full_name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetailsStudent(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-slate-500 block uppercase font-bold">Matric Number</span>
                  <span className="font-mono font-bold text-slate-900">{selectedDetailsStudent.matric_number}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block uppercase font-bold">Status</span>
                  <span className="font-semibold text-slate-800 capitalize">{selectedDetailsStudent.status}</span>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-500 block uppercase font-bold">Department</span>
                <span className="font-medium text-slate-800">{selectedDetailsStudent.department ?? 'N/A'}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-slate-500 block uppercase font-bold">Level</span>
                  <span className="font-medium text-slate-800">{selectedDetailsStudent.level_of_enrollment}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block uppercase font-bold">Gender</span>
                  <span className="font-medium text-slate-800">{selectedDetailsStudent.gender ?? 'Not Specified'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-slate-500 block uppercase font-bold">Email</span>
                  <span className="font-medium text-slate-800">{selectedDetailsStudent.email ?? 'N/A'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block uppercase font-bold">Phone</span>
                  <span className="font-medium text-slate-800">{selectedDetailsStudent.phone ?? 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 text-right">
              <button
                type="button"
                onClick={() => setSelectedDetailsStudent(null)}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
