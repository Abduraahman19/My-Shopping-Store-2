import React, { useState, useCallback } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FcGoogle } from "react-icons/fc";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

const SigninForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignIn = useCallback(async ({ email, password }, { setSubmitting }) => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("/api/auth/signin", { email, password });
      if (response.status === 200) {
        localStorage.setItem("token", response.data.token);
        console.log("✅ User signed in successfully!"); 
        navigate("/");
      }
    } catch (err) {
      setError(
        err.response?.data?.message === "Invalid credentials"
          ? "Incorrect email or password. Please try again."
          : err.response?.data?.message || "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#1E2A47] to-[#162032] relative overflow-hidden p-4">
      <div className="absolute w-40 h-40 md:w-64 md:h-64 bg-purple-500 rounded-full blur-[100px] opacity-70 top-10 left-10"></div>
      <div className="absolute w-40 h-40 md:w-64 md:h-64 bg-purple-500 rounded-full blur-[100px] opacity-70 bottom-10 right-10"></div>

      <div className="max-w-7xl w-full p-6 md:p-12 lg:gap-40 md:gap-2 justify-center flex flex-col md:flex-row items-center relative z-10">
        <div className="text-white max-w-md mb-6 md:mb-0 md:mr-8 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">Manage Your</h1>
          <h1 className="text-4xl md:text-5xl font-bold text-blue-400 leading-tight">Store with Ease</h1>
          <p className="mt-4 text-gray-300 text-lg">
            Simplify your eCommerce operations with a powerful and intuitive admin dashboard
          </p>
        </div>

        <div className="bg-white py-24 px-10 md:p-14 rounded-2xl shadow-2xl justify-center w-full lg:max-w-lg h-auto backdrop-blur-lg bg-opacity-80 relative">
          <h2 className="text-4xl font-bold text-center mb-8">Sign In</h2>
          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={validationSchema}
            onSubmit={handleSignIn}
          >
            {({ isSubmitting }) => (
              <Form>
                <div className="mb-4">
                  <Field
                    type="email"
                    name="email"
                    placeholder="Email address"
                    className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none"
                  />
                  <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div className="mb-5">
                  <Field
                    type="password"
                    name="password"
                    placeholder="Password"
                    className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none"
                  />
                  <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold shadow-md"
                  disabled={isSubmitting || loading}
                >
                  {loading ? "Loading..." : "Login"}
                </button>

                {error && <div className="text-red-500 text-sm mt-2 text-center">{error}</div>}
              </Form>
            )}
          </Formik>

          <div className="text-center mt-6 text-gray-600">
            <p>or sign in with:</p>
            <div className="flex justify-center mt-4">
              <button className="p-3 bg-gray-200 rounded-lg flex items-center space-x-3 hover:bg-gray-300 transition">
                <FcGoogle className="text-2xl" />
                <span className="text-gray-800 font-semibold">Continue with Google</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SigninForm;
