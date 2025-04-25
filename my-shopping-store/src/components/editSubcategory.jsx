import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiUpload } from "react-icons/fi";
import { Pencil } from "lucide-react";
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
import axios from "axios";

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
  name: Yup.string().required("Subcategory name is required"),
  description: Yup.string().required("Description is required"),
});

const EditSubCategory = ({ categoryId, subCategoryId, selectedSubCategory, onSubCategoryUpdated }) => {
  const [open, setOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(selectedSubCategory?.image || null);
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
    setPreviewImage(selectedSubCategory?.image || null);
    setError(null);
  };

  const handleImageChange = (event, setFieldValue) => {
    const file = event.target.files[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
      setFieldValue("image", file);
    }
  };

  const handleSubmit = async (values) => {
    if (!categoryId || !subCategoryId) {
      setError("Category or Subcategory ID is missing");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description);
      if (values.image) formData.append("image", values.image);

      await axios.put(
        `http://localhost:5000/api/categories/${categoryId}/subcategories/${subCategoryId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      handleClose();
      if (onSubCategoryUpdated) onSubCategoryUpdated();
    } catch (err) {
      console.error("Error updating subcategory:", err);
      setError(err.response?.data?.message || "Failed to update subcategory");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Edit Button */}
      <Tooltip title="Edit Subcategory" arrow placement="top">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="contained"
            onClick={handleOpen}
            sx={{
              backgroundColor: COLORS.accent,
              color: COLORS.primaryLight,
              "&:hover": {
                backgroundColor: `${COLORS.accent}90`
              }
            }}
          >
            <Pencil className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </motion.div>
      </Tooltip>

      {/* Edit Subcategory Dialog */}
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
                  Edit Subcategory
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
                  <FiX />
                </IconButton>
              </div>

              {/* Content */}
              <DialogContent sx={{ p: 3 }}>
                <Formik
                  initialValues={{
                    name: selectedSubCategory?.name || "",
                    description: selectedSubCategory?.description || "",
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
                          label="Subcategory Name"
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
                            "Save Changes"
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

export default EditSubCategory;