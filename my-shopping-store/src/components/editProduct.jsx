import React, { useState } from "react";
import {
    Button,
    Dialog,
    DialogContent,
    TextField,
    DialogActions,
    Typography,
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
    name: Yup.string().required("Product Name is required!"),
    description: Yup.string().required("Product Description is required!"),
    price: Yup.string()
        .required("Product Price is required!")
        .test("is-positive", "Price must be positive!", (value) => {
            const numericValue = Number(value.replace(/,/g, ""));
            return numericValue > 0;
        }),
});

const EditProduct = ({ initialData, onSubmit }) => {
    const [open, setOpen] = useState(false);
    const [productImage, setProductImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(initialData?.image || null);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setProductImage(null);
        setPreviewImage(initialData?.image || null);
    };

    const handleImageChange = (event, setFieldValue) => {
        const file = event.target.files[0];
        if (file) {
            setProductImage(file);
            setPreviewImage(URL.createObjectURL(file));
            setFieldValue("image", file);
        }
    };

    const formatPriceWithCommas = (value) => {
        if (!value) return "";
        const numericValue = value.replace(/,/g, "");
        return new Intl.NumberFormat("en-US").format(numericValue);
    };

    const handleUpdateProduct = async (values) => {
        if (!initialData || !initialData._id) {
            console.error("Error: Product ID is missing.", initialData);
            return;
        }

        try {
            const formData = new FormData();
            formData.append("name", values.name);
            formData.append("description", values.description);
            formData.append("price", values.price.replace(/,/g, "")); 
            if (values.image) {
                formData.append("image", values.image);
            }

            await axios.put(`http://localhost:5000/api/products/${initialData._id}`, formData);

            handleClose();
            onSubmit(); 
        } catch (error) {
            console.error("Error updating product:", error);
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
                    Edit Product
                </div>

                <DialogContent className="bg-black/10">
                    <Formik
                        initialValues={{
                            name: initialData?.name || "",
                            description: initialData?.description || "",
                            price: initialData?.price
                                ? formatPriceWithCommas(String(initialData.price))
                                : "",
                            image: null,
                        }}
                        validationSchema={validationSchema}
                        onSubmit={handleUpdateProduct}
                    >
                        {({ setFieldValue, values, errors, touched }) => (
                            <Form className="space-y-4">
                                <Field
                                    as={TextField}
                                    label="Product Name"
                                    name="name"
                                    variant="outlined"
                                    fullWidth
                                    required
                                    error={touched.name && Boolean(errors.name)}
                                    helperText={touched.name && errors.name}
                                />

                                <Field
                                    as={TextField}
                                    label="Product Description"
                                    name="description"
                                    variant="outlined"
                                    fullWidth
                                    multiline
                                    rows={3}
                                    error={touched.description && Boolean(errors.description)}
                                    helperText={touched.description && errors.description}
                                />

                                <TextField
                                    label="Product Price"
                                    name="price"
                                    variant="outlined"
                                    fullWidth
                                    required
                                    value={values.price}
                                    onChange={(e) => {
                                        const formattedValue = formatPriceWithCommas(e.target.value);
                                        setFieldValue("price", formattedValue);
                                    }}
                                    error={touched.price && Boolean(errors.price)}
                                    helperText={touched.price && errors.price}
                                />

                                <div className="bg-white rounded-lg p-3 shadow-sm">
                                    <label className="block font-semibold mb-2 text-gray-700">
                                        Upload Product Image
                                    </label>

                                    <Tooltip title="Upload Image" arrow placement="bottom">
                                        <Button
                                            component="label"
                                            variant="contained"
                                            startIcon={<CloudUploadIcon />}
                                            className="rounded-xl"
                                        >
                                            Upload Image
                                            <VisuallyHiddenInput
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleImageChange(e, setFieldValue)}
                                            />
                                        </Button>
                                    </Tooltip>

                                    {previewImage && (
                                        <>
                                            <Typography className="text-sm mt-2 text-gray-600">
                                                {productImage?.name || "Current Image"}
                                            </Typography>
                                            <div className="mt-2">
                                                <img
                                                    src={previewImage}
                                                    alt="Preview"
                                                    className="w-32 h-32 object-cover rounded-lg border"
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>

                                <DialogActions className="rounded-b-xl flex justify-between px-4 pb-4">
                                    <Tooltip title="Cancel" arrow placement="bottom">
                                        <Button onClick={handleClose} color="error" variant="contained">
                                            Cancel
                                        </Button>
                                    </Tooltip>

                                    <Tooltip title="Save Changes" arrow placement="bottom">
                                        <Button type="submit" color="primary" variant="contained">
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

export default EditProduct;
