import React, { useState } from "react";
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
    name: Yup.string().required("Category Name is required!"),
    description: Yup.string().required("Category Description is required!"),
});

const EditCategory = ({ initialData, onSubmit }) => {
        // console.log("Initial Data in EditCategory:", initialData);  
    const [open, setOpen] = useState(false);
    const [categoryImage, setCategoryImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(initialData?.image || null);

    const handleClickOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setCategoryImage(null);
        setPreviewImage(initialData?.image || null);
    };

    const handleImageChange = (event, setFieldValue) => {
        const file = event.target.files[0];
        if (file) {
            setCategoryImage(file);
            setPreviewImage(URL.createObjectURL(file));
            setFieldValue("image", file);
        }
    };

    const handleUpdateCategory = async (values) => {
        if (!initialData?._id) {
            console.error("Error: Category ID is missing.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("name", values.name);
            formData.append("description", values.description);
            if (values.image) {
                formData.append("image", values.image);
            }

            const response = await axios.put(`http://localhost:5000/api/categories/${initialData._id}`, formData);
            
            console.log("Category updated:", response.data);
            handleClose(); 
            onSubmit(); 
        } catch (error) {
            console.error("Error updating category:", error);
        }
    };

    return (
        <div>
            <Tooltip title="Edit" arrow placement="top">
                <Button variant="contained" onClick={handleClickOpen}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                </Button>
            </Tooltip>

            <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
                <div className="bg-cyan-600 py-4 text-white text-2xl font-bold text-center">
                    Edit Category
                </div>
                <DialogContent className="bg-black/10">
                    <Formik
                        initialValues={{
                            name: initialData?.name || "",
                            description: initialData?.description || "",
                            image: null
                        }}
                        validationSchema={validationSchema}
                        onSubmit={handleUpdateCategory}
                    >
                        {({ setFieldValue, errors, touched }) => (
                            <Form className="space-y-2">
                                <Field 
                                    as={TextField} 
                                    label="Category Name" 
                                    name="name" 
                                    variant="outlined" 
                                    fullWidth 
                                    required
                                    error={touched.name && Boolean(errors.name)} 
                                    helperText={touched.name && errors.name} 
                                />

                                <Field 
                                    as={TextField} 
                                    label="Category Description" 
                                    name="description" 
                                    variant="outlined" 
                                    fullWidth 
                                    multiline 
                                    rows={3}
                                    error={touched.description && Boolean(errors.description)} 
                                    helperText={touched.description && errors.description} 
                                />

                                <div className="bg-white rounded-lg p-3 shadow-sm">
                                    <label className="block font-semibold mb-2 text-gray-700">
                                        Upload Category Image
                                    </label>
                                    <Tooltip title="Upload Image" arrow placement="bottom">
                                        <Button component="label" variant="contained" startIcon={<CloudUploadIcon />} className="rounded-xl">
                                            Upload Image
                                            <VisuallyHiddenInput type="file" accept="image/*" onChange={(e) => handleImageChange(e, setFieldValue)} />
                                        </Button>
                                    </Tooltip>
                                    {previewImage && (
                                        <>
                                            <Typography className="text-sm mt-2 text-gray-600">{categoryImage?.name || "Current Image"}</Typography>
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

                                    <Tooltip title="Save Changes" arrow placement="bottom">
                                        <Button type="submit" color="primary" variant="contained" className="rounded-lg">
                                            Save Changes
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

export default EditCategory;
