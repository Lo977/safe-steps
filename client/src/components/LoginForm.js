import React, { useContext } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import UserContext from "./UserContext";

function LoginForm() {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const initialValues = {
    name: "",
    password: "",
  };

  const validationSchema = yup.object({
    name: yup.string().required("Name is required"),
    password: yup.string().required("Password is required"),
  });

  const handleSubmit = (values, { setSubmitting, setErrors }) => {
    fetch("/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    }).then((r) => {
      setSubmitting(false);
      if (r.ok) {
        r.json().then((user) => {
          setUser(user);
          navigate("/");
        });
      } else {
        r.json().then((err) =>
          setErrors({ password: err.error || "Login failed" })
        );
      }
    });
  };

  return (
    <div className="login-form-container">
      <h2 className="login-title">Login</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="login-form">
            <div className="form-group">
              <Field
                type="text"
                name="name"
                placeholder="Username"
                className="login-field"
              />
              <ErrorMessage
                name="name"
                component="div"
                className="error-message"
              />
            </div>

            <div className="form-group">
              <Field
                type="password"
                name="password"
                placeholder="Password"
                className="login-field"
              />
              <ErrorMessage
                name="password"
                component="div"
                className="error-message"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="login-button"
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default LoginForm;
