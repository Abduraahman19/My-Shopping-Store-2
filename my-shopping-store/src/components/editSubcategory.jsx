import React, { useState, useEffect } from "react";
import {
    Button,
    Dialog,
    DialogContent,
    TextField,
    DialogActions,
    Tooltip,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { styled } from "@mui/material/styles";
import axios from "axios";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { Pencil } from "lucide-react";

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
    name: Yup.string().required("Subcategory Name is required!"),
    description: Yup.string().required("Subcategory Description is required!"),
});

const EditSubCategory = ({ categoryId, subCategoryId, selectedSubCategory }) => {
    console.log(subCategoryId);
    console.log(categoryId);
    console.log(selectedSubCategory);
    
    
    const [open, setOpen] = useState(false);
    const [categoryImage, setCategoryImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(selectedSubCategory?.image || null);

    const handleClickOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setCategoryImage(null);
    };

    const handleImageChange = (event, setFieldValue) => {
        const file = event.target.files[0];
        if (file) {
            setCategoryImage(file);
            setPreviewImage(URL.createObjectURL(file));
            setFieldValue("image", file);
        }
    };

    const handleSubmit = async (values) => {
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
            window.location.reload(); 
        } catch (error) {
            console.error("Error updating subcategory:", error.response?.data || error.message);
        }
    };
    
    return (
        <div>
            <Tooltip title="Edit" arrow placement="left">
                <button onClick={handleClickOpen} className="ml-auto flex items-center px-[5px] py-[5px] bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600 transition">
                    <Pencil className="w-4 h-4" />
                </button>
            </Tooltip>

            <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
                <div className="bg-cyan-600 py-4 text-white text-2xl font-bold text-center">
                    Edit Subcategory
                </div>
                <DialogContent className="bg-black/10">
                    <Formik
                        initialValues={{
                            name: selectedSubCategory?.name || "",
                            description: selectedSubCategory?.description || "",
                            image: null,
                        }}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ setFieldValue }) => (
                            <Form className="space-y-4">
                                <Field as={TextField} label="Subcategory Name" name="name" variant="outlined" fullWidth required />
                                <Field as={TextField} label="Subcategory Description" name="description" variant="outlined" fullWidth multiline rows={3} />

                                <div className="bg-white rounded-lg p-3 shadow-sm">
                                    <label className="block font-semibold mb-2 text-gray-700">Upload Sub-Category Image</label>
                                    <Tooltip title="Upload Image" arrow placement="bottom">
                                        <Button component="label" variant="contained" startIcon={<CloudUploadIcon />}>
                                            Upload Image
                                            <VisuallyHiddenInput type="file" accept="image/*" onChange={(e) => handleImageChange(e, setFieldValue)} />
                                        </Button>
                                    </Tooltip>
                                    {previewImage && <img src={previewImage} alt="Preview" className="w-32 h-32 object-cover rounded-lg border mt-2" />}
                                </div>

                                <DialogActions>
                                    <Button onClick={handleClose} color="error" variant="contained">Cancel</Button>
                                    <Button type="submit" color="primary" variant="contained">Save Changes</Button>
                                </DialogActions>
                            </Form>
                        )}
                    </Formik>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default EditSubCategory;