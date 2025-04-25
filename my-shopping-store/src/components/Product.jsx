import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { AiOutlinePlus } from "react-icons/ai";
import { FiX, FiUpload } from "react-icons/fi";
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
  name: Yup.string().required("Product name is required"),
  description: Yup.string().required("Description is required"),
  price: Yup.string()
    .required("Price is required")
    .test("is-positive", "Price must be positive", (value) => {
      const numericValue = Number(value.replace(/,/g, ""));
      return numericValue > 0;
    }),
});

const AddProduct = ({ onProductAdded }) => {
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

  const formatPrice = (value) => {
    if (!value) return "";
    const numericValue = value.replace(/,/g, "");
    return new Intl.NumberFormat("en-US").format(numericValue);
  };

  const handleSubmit = async (values, { resetForm }) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description);
      formData.append("price", values.price.replace(/,/g, ""));
      if (values.image) formData.append("image", values.image);

      await axios.post("http://localhost:5000/api/products", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      resetForm();
      handleClose();
      if (onProductAdded) onProductAdded();
    } catch (err) {
      console.error("Error adding product:", err);
      setError(err.response?.data?.message || "Failed to add product");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.shiftKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        handleOpen();
      }
      if (e.key === "Escape" && open) {
        e.preventDefault();
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <>
      {/* Add Product Button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleOpen}
          className="flex items-center gap-2 p-2 rounded-lg cursor-pointer"
          style={{
            backgroundColor: COLORS.primary,
            color: COLORS.primaryLight
          }}
        >
          <AiOutlinePlus className="text-xl" />
          <span className="font-medium">Add Product</span>
        </motion.div>

      {/* Add Product Dialog */}
      <AnimatePresence>
        {open && (
          <Dialog
          open={open}
          onClose={handleClose}
          maxWidth="md" // Changed from "sm" to "md" for a wider dialog
          fullWidth={true} // This makes the dialog take the full width allowed by maxWidth
          slotProps={{
            paper: {
              sx: {
                borderRadius: "12px",
                overflow: "hidden",
                background: "white",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                width: "100%", // Ensures it takes full width
                maxWidth: "500px" // You can set a specific max width if needed
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
                  Add New Product
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
                    name: "",
                    description: "",
                    price: "",
                    image: null
                  }}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                >
                  {({ setFieldValue, values }) => (
                    <Form className="space-y-4">
                      {/* Name Field */}
                      <motion.div variants={itemVariants}>
                        <Field
                          as={TextField}
                          name="name"
                          label="Product Name"
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
                        />
                        <ErrorMessage
                          name="name"
                          component="div"
                          className="text-red-500 text-sm"
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
                        />
                        <ErrorMessage
                          name="description"
                          component="div"
                          className="text-red-500 text-sm"
                        />
                      </motion.div>

                      {/* Price Field */}
                      <motion.div variants={itemVariants}>
                        <TextField
                          name="price"
                          label="Price"
                          variant="outlined"
                          fullWidth
                          value={values.price}
                          onChange={(e) => {
                            const formattedValue = formatPrice(e.target.value);
                            setFieldValue("price", formattedValue);
                          }}
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
                        />
                        <ErrorMessage
                          name="price"
                          component="div"
                          className="text-red-500 text-sm"
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
                            <motion.img
                              src={previewImage}
                              alt="Preview"
                              style={{
                                width: "100px",
                                height: "100px",
                                objectFit: "cover",
                                borderRadius: "8px",
                                marginTop: "16px",
                                border: `2px solid ${COLORS.primary}`
                              }}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            />
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
                            "Add Product"
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

export default AddProduct;