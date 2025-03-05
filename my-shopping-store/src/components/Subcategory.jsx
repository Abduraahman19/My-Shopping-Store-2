import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
    Button,
    Dialog,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Tooltip,
    ListItemIcon,
    ListItemText,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { styled } from "@mui/material/styles";

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
    selectedCategory: Yup.string().required("Category is required"),
    subCategoryName: Yup.string().required("Sub-Category name is required"),
    subCategoryDescription: Yup.string().required("Sub-Category Description is required"),
});

const SubCategory = () => {
    const [open, setOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        axios.get("http://localhost:5000/api/categories")
            .then(response => setCategories(response.data))
            .catch(error => console.error("Error fetching categories:", error));
    }, []);

    const handleShortcut = useCallback((event) => {
        if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "a") {
            event.preventDefault();
            setOpen(true);
        }
    }, []);

    useEffect(() => {
        window.addEventListener("keydown", handleShortcut);
        return () => window.removeEventListener("keydown", handleShortcut);
    }, [handleShortcut]);

    const handleClickOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
        <div className="flex flex-col items-center mt-10">
            <div className="p-6 rounded-xl w-full max-w-md bg-neutral-200 shadow-lg">
                <div className="mb-4 font-bold text-2xl text-neutral-700 text-center">
                    Add a New Sub-Category
                </div>
                <Tooltip title="+ Add Sub-Category (Ctrl + Shift + S)" arrow placement="bottom">
                    <Button variant="contained" fullWidth onClick={handleClickOpen}>
                        + Add Sub-Category
                    </Button>
                </Tooltip>
            </div>

            <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
                <div className="bg-cyan-600 py-4 text-white text-2xl font-bold text-center">
                    Add Sub-Category
                </div>
                <DialogContent className="bg-black/10">
                    <Formik
                        initialValues={{
                            selectedCategory: "",
                            subCategoryName: "",
                            subCategoryDescription: "",
                            subCategoryImage: null,
                        }}
                        validationSchema={validationSchema}
                        onSubmit={async (values, { resetForm }) => {
                            const formData = new FormData();
                            formData.append("name", values.subCategoryName);
                            formData.append("description", values.subCategoryDescription);
                            if (values.subCategoryImage) {
                                formData.append("image", values.subCategoryImage);
                            }
                            try {
                                await axios.post(
                                    `http://localhost:5000/api/categories/${values.selectedCategory}/subcategories`,
                                    formData,
                                    { headers: { "Content-Type": "multipart/form-data" } }
                                );
                                handleClose();
                                resetForm();
                                window.location.reload();
                            } catch (error) {
                                console.error("Error adding subcategory:", error);
                            }
                        }}
                    >
                        {({ setFieldValue }) => (
                            <Form className="space-y-2">
                                <FormControl fullWidth variant="outlined">
                                    <InputLabel>Select Category</InputLabel>
                                    <Field as={Select} name="selectedCategory" label="Select Category">
                                        {categories.map((category) => (
                                            <MenuItem key={category._id} value={category._id}>
                                                <ListItemIcon>
                                                    <img
                                                        src={category.image || "https://via.placeholder.com/40"}
                                                        alt={category.name}
                                                        className="w-8 h-8 object-cover overflow-y-auto rounded-full"
                                                    />
                                                </ListItemIcon>
                                                <ListItemText primary={category.name} />
                                            </MenuItem>
                                        ))}
                                    </Field>
                                    <ErrorMessage name="selectedCategory" component="div" className="text-red-500" />
                                </FormControl>

                                <Field as={TextField} label="Sub-Category Name" fullWidth name="subCategoryName" />
                                <ErrorMessage name="subCategoryName" component="div" className="text-red-500" />

                                <Field
                                    as={TextField}
                                    label="Sub-Category Description"
                                    fullWidth
                                    multiline
                                    rows={3}
                                    name="subCategoryDescription"
                                />
                                <ErrorMessage name="subCategoryDescription" component="div" className="text-red-500" />

                                <div className="bg-white rounded-lg p-3 shadow-sm">
                                    <label className="block font-semibold mb-2 text-gray-700">
                                        Upload Sub-Category Image
                                    </label>
                                    <Tooltip title="Upload Image" arrow placement="bottom">
                                        <Button
                                            component="label"
                                            variant="contained"
                                            startIcon={<CloudUploadIcon />}
                                        >
                                            Upload Image
                                            <VisuallyHiddenInput
                                                type="file"
                                                accept="image/*"
                                                onChange={(event) => {
                                                    const file = event.target.files[0];
                                                    setFieldValue("subCategoryImage", file);
                                                    setPreviewImage(URL.createObjectURL(file));
                                                }}
                                            />
                                        </Button>
                                    </Tooltip>
                                    {previewImage && (
                                        <div className="mt-2">
                                            <img src={previewImage} alt="Preview" className="w-32 h-32 object-cover rounded-lg border" />
                                        </div>
                                    )}
                                </div>

                                <DialogActions>
                                    <Button onClick={handleClose} color="error" variant="contained">Cancel</Button>
                                    <Button type="submit" color="primary" variant="contained">Save Sub-Category</Button>
                                </DialogActions>
                            </Form>
                        )}
                    </Formik>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default SubCategory;