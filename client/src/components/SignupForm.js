import React, { useContext } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import UserContext from "./UserContext";

function SignupForm() {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const initialVallues = {
    name: "",
    // email: "",
    password: "",
    confirmPassword: "",
  };
  const validationSchema = Yup.object({
    name: Yup.string().required("name is required"),
    // email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Password must match")
      .required("Please confirm your password"),
  });
  const handleSubmit = (values, { resetForm }) => {
    fetch("/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    }).then((res) => {
      if (res.ok) {
        res.json().then((user) => setUser(user));
        resetForm();
        navigate("/");
      }
    });
  };
  return (
    <div className="signup-container">
      <div className="signup-card">
        {" "}
        <Formik
          initialValues={initialVallues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          <Form className="signup-form">
            <div>
              <Field type="text" name="name" placeholder="name..." />
              <ErrorMessage name="name" component="div" />
              {/* <Field type="text" name="email" placeholder="Email..." />
              <ErrorMessage name="email" component="div" /> */}
              <Field
                type="password"
                name="password"
                placeholder="Password..."
              />
              <ErrorMessage name="password" component="div" />
              <Field
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password..."
              />
              <ErrorMessage name="confirmPassword" component="div" />
            </div>
            <button type="submit">Sign Up</button>
            <div className="signup-footer">
              <span>Already have an account?</span>
              <button
                className="login-button"
                onClick={() => navigate("/login")}
              >
                Log in
              </button>
            </div>
          </Form>
        </Formik>
      </div>
    </div>
  );
}

export default SignupForm;
