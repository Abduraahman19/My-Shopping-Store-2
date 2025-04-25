import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { AiOutlinePlus, AiOutlineClose } from "react-icons/ai";
import { FiUpload } from "react-icons/fi";
import {
  Dialog,
  DialogContent,
  TextField,
  Button,
  Tooltip,
  CircularProgress,
  IconButton,
  Typography
} from "@mui/material";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const COLORS = {
  primary: "#4f46e5",
  primaryLight: "#ffffff",
  primaryDark: "#4338ca",
  secondary: "#10b981",
  accent: "#f59e0b",
  background: "#f8fafc",
  card: "#4f46e5",
  textPrimary: "#ffffff",
  textSecondary: "#64748b",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#3b82f6"
};

const validationSchema = Yup.object({
  name: Yup.string().required("Category name is required"),
  description: Yup.string().required("Description is required"),
});

const Category = ({ onCategoryAdded }) => {
  const [open, setOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Animation variants
  const modalVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", damping: 25, stiffness: 500 }
    },
    exit: { opacity: 0, y: 20 }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setPreviewImage(null);
    setError(null);
  };

  const handleImageChange = (event, setFieldValue) => {
    const file = event.target.files[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
      setFieldValue("image", file);
    }
  };

  // Keyboard shortcut
  const handleShortcut = useCallback((event) => {
    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "c") {
      event.preventDefault();
      handleOpen();
    }
    if (event.key === "Escape" && open) {
      event.preventDefault();
      handleClose();
    }
  }, [open]);

  useEffect(() => {
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [handleShortcut]);

  const handleSubmit = async (values, { resetForm }) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description);
      if (values.image) formData.append("image", values.image);

      await axios.post("http://localhost:5000/api/categories", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      resetForm();
      handleClose();
      if (onCategoryAdded) onCategoryAdded();
    } catch (err) {
      console.error("Error adding category:", err);
      setError(err.response?.data?.message || "Failed to add category");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Add Category Button */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex justify-center mt-10"
      >
        <div className="p-6 rounded-xl w-full max-w-md shadow-lg"
          style={{ backgroundColor: `${COLORS.primary}10` }}
        >
          <Typography variant="h6" component="div" 
            sx={{
              mb: 4,
              fontWeight: "bold",
              textAlign: "center",
              color: COLORS.primaryDark
            }}
          >
            Add a New Category
          </Typography>
          <Tooltip title="Add Category (Ctrl+Shift+C)" arrow placement="bottom">
            <motion.div
              onClick={handleOpen}
              className="flex items-center justify-center gap-2 p-2 rounded-lg cursor-pointer"
              style={{
                backgroundColor: COLORS.primary,
                color: COLORS.primaryLight
              }}
            >
              <AiOutlinePlus className="text-xl" />
              <span className="font-medium">Add Category</span>
            </motion.div>
          </Tooltip>
        </div>
      </motion.div>

      {/* Add Category Dialog */}
      <AnimatePresence>
        {open && (
          <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            slotProps={{
              paper: {
                sx: {
                  borderRadius: "12px",
                  overflow: "hidden",
                  background: "white",
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                  maxWidth: "500px"
                }
              }
            }}
          >
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={modalVariants}
            >
              {/* Header */}
              <div
                style={{
                  background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
                  padding: "16px 24px",
                  position: "relative"
                }}
              >
                <Typography
                  variant="h6"
                  component="div"
                  sx={{
                    color: COLORS.primaryLight,
                    fontWeight: "bold",
                    textAlign: "center"
                  }}
                >
                  Add New Category
                </Typography>
                <IconButton
                  onClick={handleClose}
                  sx={{
                    position: "absolute",
                    right: "16px",
                    top: "16px",
                    color: COLORS.primaryLight
                  }}
                >
                  <AiOutlineClose />
                </IconButton>
              </div>

              {/* Content */}
              <DialogContent sx={{ p: 3 }}>
                <Formik
                  initialValues={{
                    name: "",
                    description: "",
                    image: null
                  }}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                >
                  {({ setFieldValue, values, errors, touched }) => (
                    <Form className="space-y-4">
                      {/* Name Field */}
                      <motion.div variants={itemVariants}>
                        <Field
                          as={TextField}
                          name="name"
                          label="Category Name"
                          variant="outlined"
                          fullWidth
                          sx={{
                            mb: 1,
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "8px",
                              "& fieldset": {
                                borderColor: COLORS.primary
                              },
                              "&:hover fieldset": {
                                borderColor: COLORS.primaryDark
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: COLORS.primaryDark,
                                borderWidth: "2px"
                              }
                            }
                          }}
                          error={touched.name && Boolean(errors.name)}
                          helperText={touched.name && errors.name}
                        />
                      </motion.div>

                      {/* Description Field */}
                      <motion.div variants={itemVariants}>
                        <Field
                          as={TextField}
                          name="description"
                          label="Description"
                          variant="outlined"
                          fullWidth
                          multiline
                          rows={3}
                          sx={{
                            mb: 1,
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "8px",
                              "& fieldset": {
                                borderColor: COLORS.primary
                              },
                              "&:hover fieldset": {
                                borderColor: COLORS.primaryDark
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: COLORS.primaryDark,
                                borderWidth: "2px"
                              }
                            }
                          }}
                          error={touched.description && Boolean(errors.description)}
                          helperText={touched.description && errors.description}
                        />
                      </motion.div>

                      {/* Image Upload */}
                      <motion.div variants={itemVariants}>
                        <div
                          style={{
                            border: `2px dashed ${COLORS.primary}`,
                            borderRadius: "8px",
                            padding: "16px",
                            textAlign: "center",
                            backgroundColor: `${COLORS.primary}08`
                          }}
                        >
                          <label htmlFor="image-upload">
                            <input
                              id="image-upload"
                              type="file"
                              accept="image/*"
                              style={{ display: "none" }}
                              onChange={(e) => handleImageChange(e, setFieldValue)}
                            />
                            <Button
                              component="span"
                              startIcon={<FiUpload />}
                              sx={{
                                color: COLORS.primaryDark,
                                borderColor: COLORS.primary,
                                "&:hover": {
                                  backgroundColor: `${COLORS.primary}10`,
                                  borderColor: COLORS.primaryDark
                                }
                              }}
                              variant="outlined"
                            >
                              Upload Image
                            </Button>
                          </label>
                          {previewImage && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="mt-4"
                            >
                              <img
                                src={previewImage}
                                alt="Preview"
                                style={{
                                  width: "100px",
                                  height: "100px",
                                  objectFit: "cover",
                                  borderRadius: "8px",
                                  border: `2px solid ${COLORS.primary}`
                                }}
                              />
                            </motion.div>
                          )}
                        </div>
                      </motion.div>

                      {/* Error Message */}
                      {error && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-red-500 text-center"
                        >
                          {error}
                        </motion.div>
                      )}

                      {/* Actions */}
                      <motion.div
                        variants={itemVariants}
                        className="flex justify-end gap-3 mt-4"
                      >
                        <Button
                          onClick={handleClose}
                          sx={{
                            backgroundColor: COLORS.danger,
                            color: COLORS.primaryLight,
                            "&:hover": {
                              backgroundColor: `${COLORS.danger}90`
                            }
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          sx={{
                            backgroundColor: COLORS.success,
                            color: COLORS.primaryLight,
                            "&:hover": {
                              backgroundColor: `${COLORS.success}90`
                            },
                            "&:disabled": {
                              backgroundColor: `${COLORS.textSecondary}60`
                            }
                          }}
                        >
                          {isSubmitting ? (
                            <CircularProgress size={24} sx={{ color: COLORS.primaryLight }} />
                          ) : (
                            "Add Category"
                          )}
                        </Button>
                      </motion.div>
                    </Form>
                  )}
                </Formik>
              </DialogContent>
            </motion.div>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
};

export default Category;