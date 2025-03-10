import React, { useState, useEffect, useCallback } from "react";
import {
    Button,
    Dialog,
    DialogContent,
    TextField,
    DialogActions,
    Typography,
    Tooltip
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { styled } from "@mui/material/styles";
import axios from "axios";
import { Formik, Form, Field } from "formik";
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
    name: Yup.string().required("Category Name is required!"),
    description: Yup.string().required("Category Description is required!"),
});

const Category = () => {
    const [open, setOpen] = useState(false);
    const [categoryImage, setCategoryImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    // 🔥 Shortcut Key Function
    const handleShortcut = useCallback((event) => {
        if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "c") {
            event.preventDefault();
            setOpen(true);
        }
    }, []);

    // 🔥 Add Shortcut Listener
    useEffect(() => {
        window.addEventListener("keydown", handleShortcut);
        return () => window.removeEventListener("keydown", handleShortcut);
    }, [handleShortcut]);

    const handleClickOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setCategoryImage(null);
        setPreviewImage(null);
    };

    const handleImageChange = (event, setFieldValue) => {
        const file = event.target.files[0];
        if (file) {
            setCategoryImage(file);
            setPreviewImage(URL.createObjectURL(file));
            setFieldValue("image", file);
        }
    };

    const handleSubmit = async (values, { resetForm }) => {
        try {
            const formData = new FormData();
            formData.append("name", values.name);
            formData.append("description", values.description);
            if (values.image) formData.append("image", values.image);

            console.log("Sending FormData:", {
                name: values.name,
                description: values.description,
                image: values.image ? values.image.name : "No image",
            });

            const response = await axios.post("http://localhost:5000/api/categories", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            console.log("Category Added:", response.data);

            resetForm();
            setCategoryImage(null);
            setPreviewImage(null);
            handleClose();

            setTimeout(() => {
                window.location.reload();
            }, 500);

        } catch (error) {
            console.error("Error adding category:", error.response?.data || error.message);
        }
    };

    return (
        <div className="flex flex-col items-center mt-10">
            <div className="p-6 rounded-xl w-full max-w-md bg-neutral-200 shadow-lg">
                <div className="mb-4 font-bold text-2xl text-neutral-700 text-center">
                    Add a New Category
                </div>
                <Tooltip title="+ Add Category" arrow placement="bottom">
                    <Button variant="contained" fullWidth className="text-white font-bold px-6 py-3 rounded-lg" onClick={handleClickOpen}>
                        + Add Category
                    </Button>
                </Tooltip>
            </div>

            <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
                <div className="bg-cyan-600 py-4 text-white text-2xl font-bold text-center">
                    Add Category
                </div>
                <DialogContent className="bg-black/10">
                    <Formik
                        initialValues={{ name: "", description: "", image: null }}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ setFieldValue, errors, touched }) => (
                            <Form className="space-y-2">
                                <Field as={TextField} label="Category Name" name="name" variant="outlined" fullWidth required
                                    error={touched.name && Boolean(errors.name)} helperText={touched.name && errors.name} />

                                <Field as={TextField} label="Category Description" name="description" variant="outlined" fullWidth multiline rows={3}
                                    error={touched.description && Boolean(errors.description)} helperText={touched.description && errors.description} />

                                <div className="bg-white rounded-lg p-3 shadow-sm">
                                    <label className="block font-semibold mb-2 text-gray-700">Upload Category Image</label>
                                    <Tooltip title="Upload Image" arrow placement="bottom">
                                        <Button component="label" variant="contained" startIcon={<CloudUploadIcon />} className="rounded-xl">
                                            Upload Image
                                            <VisuallyHiddenInput type="file" accept="image/*" onChange={(e) => handleImageChange(e, setFieldValue)} />
                                        </Button>
                                    </Tooltip>
                                    {categoryImage && (
                                        <>
                                            <Typography className="text-sm mt-2 text-gray-600">{categoryImage.name}</Typography>
                                            <div className="mt-2">
                                                <img src={previewImage} alt="Preview" className="w-32 h-32 object-cover rounded-lg border" />
                                            </div>
                                        </>
                                    )}
                                </div>

                                <DialogActions className="rounded-b-xl flex justify-between px-4 pb-4">
                                    <Tooltip title="Cancel" arrow placement="bottom">
                                        <Button onClick={handleClose} color="error" variant="contained" className="rounded-lg">
                                            Cancel
                                        </Button>
                                    </Tooltip>

                                    <Tooltip title="Save Category" arrow placement="bottom">
                                        <Button type="submit" color="primary" variant="contained" className="rounded-lg">
                                            Save Category
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

export default Category;
