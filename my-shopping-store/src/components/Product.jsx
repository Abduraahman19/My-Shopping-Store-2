import React, { useState, useEffect, useCallback } from "react";
import {
    Button,
    Dialog,
    DialogContent,
    TextField,
    DialogActions,
    Tooltip,
} from "@mui/material";
import { AiOutlinePlus } from "react-icons/ai";
import { styled } from "@mui/material/styles";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
});

const validationSchema = Yup.object({
    name: Yup.string().required("Product Name is required!"),
    description: Yup.string().required("Product Description is required!"),
    price: Yup.string()
        .required("Product Price is required!")
        .test("is-positive", "Price must be a positive number", (value) => {
            const numericValue = Number(value.replace(/,/g, ""));
            return numericValue > 0;
        }),
});

const AddProduct = () => {
    const [open, setOpen] = useState(false);
    const [productImage, setProductImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    const handleClickOpen = () => setOpen(true);

    const handleClose = (resetForm) => {
        setOpen(false);
        setProductImage(null);
        setPreviewImage(null);
        resetForm(); // Reset all form fields
    };

    const handleImageChange = (event, setFieldValue) => {
        const file = event.target.files[0];
        if (file) {
            setProductImage(file);
            setPreviewImage(URL.createObjectURL(file));
            setFieldValue("image", file);
        }
    };

    const handleSubmit = async (values, { resetForm }) => {
        try {
            const formData = new FormData();
            formData.append("name", values.name);
            formData.append("description", values.description);
            formData.append("price", values.price.replace(/,/g, "")); // Remove commas before submission
            if (values.image) formData.append("image", values.image);

            await axios.post("http://localhost:5000/api/products", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            handleClose(resetForm);
            window.location.reload();
        } catch (error) {
            console.error("Error adding product:", error.response?.data || error.message);
        }
    };

    // Shortcut Key Handler (Alt + Shift + P)
    const handleKeyPress = useCallback((event) => {
        if (event.altKey && event.shiftKey && event.key.toLowerCase() === "p") {
            event.preventDefault();
            handleClickOpen();
        }
    }, []);

    useEffect(() => {
        document.addEventListener("keydown", handleKeyPress);
        return () => document.removeEventListener("keydown", handleKeyPress);
    }, [handleKeyPress]);

    // Helper function to format the price with commas
    const formatPriceWithCommas = (value) => {
        if (!value) return "";
        const numericValue = value.replace(/,/g, ""); // Remove existing commas
        return new Intl.NumberFormat("en-US").format(numericValue);
    };

    return (
        <div>
            <Tooltip title="Add New Product" arrow placement="right">
                <div
                    className="p-2 flex items-center gap-2 font-semibold hover:bg-white/20 rounded cursor-pointer"
                    onClick={handleClickOpen}
                >
                    <AiOutlinePlus className="text-2xl text-green-400" />
                    <span className="text-lg">Add New Product</span>
                </div>
            </Tooltip>
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
                <div className="bg-cyan-600 py-4 text-white text-2xl font-bold text-center">
                    Add New Product
                </div>
                <DialogContent className="bg-black/10">
                    <Formik
                        initialValues={{ name: "", description: "", price: "", image: null }}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ setFieldValue, values, resetForm }) => (
                            <Form className="space-y-4">
                                {/* Product Name */}
                                <div>
                                    <Field
                                        as={TextField}
                                        label="Product Name"
                                        name="name"
                                        variant="outlined"
                                        fullWidth
                                        required
                                    />
                                    <ErrorMessage name="name" component="div" className="text-red-500 text-sm" />
                                </div>

                                {/* Product Description */}
                                <div>
                                    <Field
                                        as={TextField}
                                        label="Product Description"
                                        name="description"
                                        variant="outlined"
                                        fullWidth
                                        multiline
                                        rows={3}
                                        required
                                    />
                                    <ErrorMessage
                                        name="description"
                                        component="div"
                                        className="text-red-500 text-sm"
                                    />
                                </div>

                                {/* Price (With Commas) */}
                                <div>
                                    <TextField
                                        label="Price"
                                        name="price"
                                        variant="outlined"
                                        fullWidth
                                        required
                                        value={values.price}
                                        onChange={(e) => {
                                            const formattedValue = formatPriceWithCommas(e.target.value);
                                            setFieldValue("price", formattedValue);
                                        }}
                                    />
                                    <ErrorMessage name="price" component="div" className="text-red-500 text-sm" />
                                </div>

                                {/* Upload Image */}
                                <div className="bg-white rounded-lg p-3 shadow-sm">
                                    <label className="block font-semibold mb-2 text-gray-700">
                                        Upload Product Image
                                    </label>
                                    <Tooltip title="Upload Image" arrow placement="bottom">
                                        <Button component="label" variant="contained">
                                            Upload Image
                                            <VisuallyHiddenInput
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleImageChange(e, setFieldValue)}
                                            />
                                        </Button>
                                    </Tooltip>
                                    {previewImage && (
                                        <img
                                            src={previewImage}
                                            alt="Preview"
                                            className="w-32 h-32 object-cover rounded-lg border mt-2"
                                        />
                                    )}
                                </div>

                                {/* Actions */}
                                <DialogActions>
                                    <Tooltip title="Cancel" arrow placement="bottom">
                                        <Button onClick={() => handleClose(resetForm)} color="error" variant="contained">
                                            Cancel
                                        </Button>
                                    </Tooltip>
                                    <Tooltip title="Add Product" arrow placement="bottom">
                                        <Button type="submit" color="primary" variant="contained">
                                            Add Product
                                        </Button>
                                    </Tooltip>
                                </DialogActions>
                            </Form>
                        )}
                    </Formik>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AddProduct;
