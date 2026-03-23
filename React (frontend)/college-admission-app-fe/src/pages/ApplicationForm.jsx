import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  deleteApplication,
  getCourses,
  makePayment,
  submitApplication,
  uploadDocument,
} from '../services/api';

const TOTAL_STEPS = 6;

const ApplicationForm = () => {
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  const [step, setStep] = useState(1);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [applicationId, setApplicationId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    address: '',
    grades: '',
    subjects: '',
    courseId: '',
    documentFile: null,
    documentUrl: '',
    paymentMethod: 'Card',
    paymentStatus: 'Pending',
    paymentRef: '',
    docType: 'General',
  });

  const progress = useMemo(() => `${(step / TOTAL_STEPS) * 100}%`, [step]);

  const loadCourses = useCallback(async () => {
    setLoadingCourses(true);
    try {
      const data = await getCourses();
      const list = Array.isArray(data) ? data : data?.courses || [];
      setCourses(list);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingCourses(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, documentFile: file }));
  };

  const validateStep = () => {
    if (step === 1 && (!formData.name.trim() || !formData.dob || !formData.address.trim())) {
      return 'Please complete all personal details.';
    }

    if (step === 2 && (!formData.grades.trim() || !formData.subjects.trim())) {
      return 'Please complete all academic details.';
    }

    if (step === 3) {
      if (courses.length === 0) {
        return 'No courses available. Ask admin to add courses first.';
      }
      if (!formData.courseId) {
        return 'Please select a course before continuing.';
      }
    }

    return '';
  };

  const nextStep = () => {
    const validationMessage = validateStep();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }
    setError('');
    if (step < TOTAL_STEPS) setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep((prev) => prev - 1);
  };

  const handleDocumentUpload = async () => {
    if (!formData.documentFile) {
      setError('Please choose a file before uploading.');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const response = await uploadDocument(formData.documentFile, applicationId, formData.docType);
      setFormData((prev) => ({
        ...prev,
        documentUrl: response.fileUrl || response.url || response.documentUrl || formData.documentFile?.name || 'Uploaded',
      }));
      nextStep();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handlePayment = async () => {
    setProcessing(true);
    setError('');

    try {
      const response = await makePayment({
        amount: 1000,
        payMethod: formData.paymentMethod,
        status: 'Success',
      });

      setFormData((prev) => ({
        ...prev,
        paymentStatus: response.status || 'Paid',
        paymentRef: response.paymentId || response.reference || response.id || '',
      }));

      nextStep();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.courseId) {
      setError('Course is required. Go back to Step 3 and select a course.');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const parsedPercentage = Number(String(formData.grades).replace(/[^0-9.]/g, ''));
      const payload = {
        user: currentUser?.userId ? { userId: Number(currentUser.userId) } : null,
        course: { courseId: Number(formData.courseId) },
        dob: formData.dob,
        address: formData.address,
        percentage: Number.isNaN(parsedPercentage) ? null : parsedPercentage,
        status: 'Submitted',
      };

      const response = await submitApplication(payload);
      const createdId = response.appId || response.applicationId || response.id;
      setApplicationId(createdId || 'Generated');
      setStep(TOTAL_STEPS);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelSubmittedApplication = async () => {
    if (!applicationId || applicationId === 'Generated') return;

    setProcessing(true);
    setError('');

    try {
      await deleteApplication(applicationId);
      setApplicationId(null);
      setStep(1);
      setFormData({
        name: '',
        dob: '',
        address: '',
        grades: '',
        subjects: '',
        courseId: '',
        documentFile: null,
        documentUrl: '',
        paymentMethod: 'Card',
        paymentStatus: 'Pending',
        paymentRef: '',
        docType: 'General',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <section className="page fade-in">
      <div className="page-header">
        <h2>Admission Application</h2>
        <Link className="btn btn-outline" to="/dashboard">
          Back to Dashboard
        </Link>
      </div>

      <div className="card form-card">
        <div className="progress-wrap">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: progress }} />
          </div>
          <span>
            Step {step} of {TOTAL_STEPS}
          </span>
        </div>

        {error && <div className="alert error">{error}</div>}

        {step === 1 && (
          <div className="form-section">
            <h3>Step 1 - Personal Details</h3>
            <label>Name</label>
            <input name="name" value={formData.name} onChange={onChange} required />

            <label>Date of Birth</label>
            <input type="date" name="dob" value={formData.dob} onChange={onChange} required />

            <label>Address</label>
            <textarea name="address" value={formData.address} onChange={onChange} rows="3" required />
          </div>
        )}

        {step === 2 && (
          <div className="form-section">
            <h3>Step 2 - Academic Details</h3>
            <label>Grades</label>
            <input name="grades" value={formData.grades} onChange={onChange} placeholder="e.g. 92%" required />

            <label>Subjects</label>
            <input
              name="subjects"
              value={formData.subjects}
              onChange={onChange}
              placeholder="e.g. Physics, Chemistry, Math"
              required
            />
          </div>
        )}

        {step === 3 && (
          <div className="form-section">
            <h3>Step 3 - Course Selection</h3>
            <label>Select Course</label>
            <select name="courseId" value={formData.courseId} onChange={onChange} required>
              <option value="">Choose a course</option>
              {courses.map((course) => (
                <option key={course.courseId || course.id} value={course.courseId || course.id}>
                  {course.courseName || course.name || `Course ${course.courseId || course.id}`}
                </option>
              ))}
            </select>

            {loadingCourses && (
              <div className="loading-inline">
                <span className="spinner" />
                <span>Fetching courses...</span>
              </div>
            )}

            {!loadingCourses && courses.length === 0 && (
              <div className="alert error">
                No courses found in backend. Add courses first using `POST /api/courses`.
              </div>
            )}

            <button type="button" className="btn btn-outline" onClick={loadCourses} disabled={loadingCourses}>
              Refresh Courses
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="form-section">
            <h3>Step 4 - Document Upload</h3>
            <label>Upload Document</label>
            <input type="file" onChange={onFileChange} />
            <label>Document Type</label>
            <input
              name="docType"
              value={formData.docType}
              onChange={onChange}
              placeholder="e.g. Marksheet / Photo"
            />
            {formData.documentUrl && <p className="muted">Uploaded: {formData.documentUrl}</p>}
            <button type="button" className="btn btn-primary" onClick={handleDocumentUpload} disabled={processing}>
              {processing ? <span className="spinner" /> : 'Upload & Continue'}
            </button>
          </div>
        )}

        {step === 5 && (
          <div className="form-section">
            <h3>Step 5 - Fee Payment</h3>
            <label>Payment Method</label>
            <select name="paymentMethod" value={formData.paymentMethod} onChange={onChange}>
              <option value="Card">Card</option>
              <option value="UPI">UPI</option>
              <option value="Net Banking">Net Banking</option>
            </select>

            <button type="button" className="btn btn-primary" onClick={handlePayment} disabled={processing}>
              {processing ? <span className="spinner" /> : 'Pay Application Fee'}
            </button>

            <p className="muted">Fee amount: 1000</p>
          </div>
        )}

        {step === 6 && (
          <div className="form-section">
            <h3>Final Step - Confirm & Submit</h3>
            {!applicationId ? (
              <>
                <div className="summary-box">
                  <p>
                    <strong>Name:</strong> {formData.name}
                  </p>
                  <p>
                    <strong>Course ID:</strong> {formData.courseId || 'Not selected'}
                  </p>
                  <p>
                    <strong>Payment Status:</strong> {formData.paymentStatus}
                  </p>
                </div>

                <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={processing}>
                  {processing ? <span className="spinner" /> : 'Submit Application'}
                </button>
              </>
            ) : (
              <div className="alert success">
                Application submitted successfully. Application ID: <strong>{applicationId}</strong>
              </div>
            )}

            {applicationId && applicationId !== 'Generated' && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleCancelSubmittedApplication}
                disabled={processing}
              >
                {processing ? <span className="spinner" /> : 'Cancel Application'}
              </button>
            )}
          </div>
        )}

        {step < 4 && (
          <div className="form-actions">
            {step > 1 && (
              <button type="button" className="btn btn-outline" onClick={prevStep}>
                Previous
              </button>
            )}
            <button type="button" className="btn btn-primary" onClick={nextStep}>
              Next
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ApplicationForm;
