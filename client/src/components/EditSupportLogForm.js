import React, { useContext, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import UserContext from "./UserContext";

function EditSupportLogForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);

  const logId = parseInt(id);
  const log =
    user?.resources
      ?.flatMap((r) => r.support_logs || [])
      ?.find((l) => l.id === logId) || null;

  const [allResources, setAllResources] = useState([]);
  const [allUrgencies, setAllUrgencies] = useState([]);

  useEffect(() => {
    fetch("/all-resources", { credentials: "include" })
      .then((res) => res.json())
      .then(setAllResources);

    fetch("/all-urgency-levels", { credentials: "include" })
      .then((res) => res.json())
      .then(setAllUrgencies);
  }, []);

  // if (!log)
  //   return <p className="edit-log-not-found">Log not found or unauthorized.</p>;

  const initialValues = {
    notes: log.notes || "",
    resource_id: log.resource?.id || "",
    urgency_level_id: log.urgency_level?.id || "",
  };

  const validationSchema = Yup.object({
    notes: Yup.string().required("Notes are required"),
    resource_id: Yup.number().required("Resource is required"),
    urgency_level_id: Yup.number().required("Urgency level is required"),
  });
  function updateUserAfterLogEdit({
    user,
    log,
    updatedLog,
    allResources,
    allUrgencies,
  }) {
    const logId = updatedLog.id;

    const fullResource =
      updatedLog.resource ||
      allResources.find((r) => r.id === updatedLog.resource_id);
    const fullUrgency =
      updatedLog.urgency_level ||
      allUrgencies.find((u) => u.id === updatedLog.urgency_level_id);

    const safeLog = {
      ...updatedLog,
      resource: fullResource,
      urgency_level: fullUrgency,
    };

    const prevResourceId = log.resource?.id;
    const prevUrgencyId = log.urgency_level?.id;

    const newResources = [...user.resources];
    const newResource = newResources.find((r) => r.id === fullResource.id);
    const oldResource = newResources.find((r) => r.id === prevResourceId);

    if (newResource) {
      newResource.support_logs = [
        ...(newResource.support_logs || []).filter((l) => l.id !== logId),
        safeLog,
      ];
    } else {
      newResources.push({ ...fullResource, support_logs: [safeLog] });
    }

    if (oldResource && oldResource.id !== fullResource.id) {
      oldResource.support_logs = (oldResource.support_logs || []).filter(
        (l) => l.id !== logId
      );
    }

    const finalResources = newResources.filter(
      (r) => r.support_logs?.length > 0
    );

    const newUrgencies = [...user.urgency_levels];
    const newUrgency = newUrgencies.find((u) => u.id === fullUrgency.id);
    const oldUrgency = newUrgencies.find((u) => u.id === prevUrgencyId);

    if (newUrgency) {
      newUrgency.support_logs = [
        ...(newUrgency.support_logs || []).filter((l) => l.id !== logId),
        safeLog,
      ];
    } else {
      newUrgencies.push({ ...fullUrgency, support_logs: [safeLog] });
    }

    if (oldUrgency && oldUrgency.id !== fullUrgency.id) {
      oldUrgency.support_logs = (oldUrgency.support_logs || []).filter(
        (l) => l.id !== logId
      );
    }

    const finalUrgencies = newUrgencies.filter(
      (u) => u.support_logs?.length > 0
    );

    return {
      ...user,
      resources: finalResources,
      urgency_levels: finalUrgencies,
    };
  }
  const handleSubmit = (values) => {
    fetch(`/logs/${logId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(values),
    })
      .then((res) => res.json())
      .then((updatedLog) => {
        const updatedUser = updateUserAfterLogEdit({
          user,
          log,
          updatedLog,
          allResources,
          allUrgencies,
        });

        setUser(updatedUser);
        navigate(`/logs/${logId}`);
      })
      .catch(() => alert("Failed to update log."));
  };

  return (
    <div className="edit-log-container">
      <h2 className="edit-log-title">Edit Support Log</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        <Form className="edit-log-form">
          <div className="edit-log-group">
            <label className="edit-log-label">Notes:</label>
            <Field
              as="textarea"
              name="notes"
              rows="4"
              className="edit-log-textarea"
            />
            <ErrorMessage
              name="notes"
              component="div"
              className="edit-log-error"
            />
          </div>

          <div className="edit-log-group">
            <label className="edit-log-label">Resource:</label>
            <Field as="select" name="resource_id" className="edit-log-select">
              <option value="">-- Select --</option>
              {allResources.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </Field>
            <ErrorMessage
              name="resource_id"
              component="div"
              className="edit-log-error"
            />
          </div>

          <div className="edit-log-group">
            <label className="edit-log-label">Urgency Level:</label>
            <Field
              as="select"
              name="urgency_level_id"
              className="edit-log-select"
            >
              <option value="">-- Select --</option>
              {allUrgencies.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.level}
                </option>
              ))}
            </Field>
            <ErrorMessage
              name="urgency_level_id"
              component="div"
              className="edit-log-error"
            />
          </div>

          <div className="edit-log-actions">
            <button type="submit" className="edit-log-button">
              Update
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="edit-log-cancel"
            >
              Cancel
            </button>
          </div>
        </Form>
      </Formik>
    </div>
  );
}

export default EditSupportLogForm;
