import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import UserContext from "./UserContext";

function AddSupportLogForm() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);

  const [allResources, setAllResources] = useState([]);
  const [allUrgencyLevels, setAllUrgencyLevels] = useState([]);

  useEffect(() => {
    fetch("/all-resources", { credentials: "include" })
      .then((res) => res.json())
      .then(setAllResources);

    fetch("/all-urgency-levels", { credentials: "include" })
      .then((res) => res.json())
      .then(setAllUrgencyLevels);
  }, []);

  const initialValues = {
    notes: "",
    resource_id: "",
    urgency_level_id: "",
  };

  const validationSchema = Yup.object({
    notes: Yup.string().required("Notes are required"),
    resource_id: Yup.number().required("Select a resource"),
    urgency_level_id: Yup.number().required("Select an urgency level"),
  });

  const handleSubmit = (values) => {
    const payload = {
      notes: values.notes.trim(),
      resource_id: parseInt(values.resource_id),
      urgency_level_id: parseInt(values.urgency_level_id),
    };

    fetch("/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to create log");
        return res.json();
      })
      .then((newLog) => {
        // Update resource logs
        const updatedResources = user.resources.some(
          (r) => r.id === newLog.resource.id
        )
          ? user.resources.map((r) =>
              r.id === newLog.resource.id
                ? { ...r, support_logs: [...(r.support_logs || []), newLog] }
                : r
            )
          : [...user.resources, { ...newLog.resource, support_logs: [newLog] }];

        // Update urgency level logs
        const updatedUrgencies = user.urgency_levels.some(
          (u) => u.id === newLog.urgency_level.id
        )
          ? user.urgency_levels.map((u) =>
              u.id === newLog.urgency_level.id
                ? {
                    ...u,
                    support_logs: [...(u.support_logs || []), newLog],
                  }
                : u
            )
          : [
              ...user.urgency_levels,
              { ...newLog.urgency_level, support_logs: [newLog] },
            ];

        // Update context
        setUser({
          ...user,
          resources: updatedResources,
          urgency_levels: updatedUrgencies,
        });

        navigate(`/logs/${newLog.id}`);
      })
      .catch((err) => {
        console.error(err);
        alert("Error adding support log.");
      });
  };

  return (
    <div className="add-log-container">
      <h2 className="add-log-title">Add New Support Log</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        <Form className="add-log-form">
          <div className="form-group">
            <label>Notes:</label>
            <br />
            <Field
              as="textarea"
              name="notes"
              rows={5}
              cols={50}
              className="textarea-field"
            />
            <ErrorMessage name="notes" component="div" className="error" />
          </div>

          <div className="form-group">
            <label>Resource:</label>
            <br />
            <Field as="select" name="resource_id" className="select-field">
              <option value="">-- Select Resource --</option>
              {allResources.map((res) => (
                <option key={res.id} value={res.id}>
                  {res.name}
                </option>
              ))}
            </Field>
            <ErrorMessage
              name="resource_id"
              component="div"
              className="error"
            />
          </div>

          <div className="form-group">
            <label>Urgency Level:</label>
            <br />
            <Field as="select" name="urgency_level_id" className="select-field">
              <option value="">-- Select Urgency --</option>
              {allUrgencyLevels.map((lvl) => (
                <option key={lvl.id} value={lvl.id}>
                  {lvl.level}
                </option>
              ))}
            </Field>
            <ErrorMessage
              name="urgency_level_id"
              component="div"
              className="error"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-button">
              Add Log
            </button>{" "}
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="cancel-button"
            >
              ← Cancel
            </button>
          </div>
        </Form>
      </Formik>
    </div>
  );
}

export default AddSupportLogForm;
