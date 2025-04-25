import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AiOutlineClose } from "react-icons/ai";
import { FaKeyboard } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
  Typography,
  IconButton
} from "@mui/material";

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

const Shortcut = () => {
  const [open, setOpen] = useState(false);

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
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1
      }
    })
  };

  // Keyboard shortcut to open the dialog
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <>
      {/* Shortcut Button */}
      <Tooltip title="Shortcuts" arrow placement="bottom">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 p-2 rounded-lg cursor-pointer"
          style={{
            backgroundColor: COLORS.primary,
            color: COLORS.primaryLight
          }}
        >
          <FaKeyboard className="text-xl" />
          <span className="font-medium">Shortcuts</span>
        </motion.div>
      </Tooltip>

      {/* Shortcut Dialog */}
      <AnimatePresence>
        {open && (
          <Dialog
            open={open}
            onClose={() => setOpen(false)}
            maxWidth="sm"
            fullWidth
            slotProps={{
              paper: {
                sx: {
                  borderRadius: "12px",
                  overflow: "hidden",
                  background: "white",
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                  maxWidth: "600px"
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
                  Keyboard Shortcuts
                </Typography>
                <IconButton
                  onClick={() => setOpen(false)}
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
              <DialogContent sx={{ p: 3, bgcolor: COLORS.background }}>
                <div className="space-y-4">
                  {[
                    { shortcut: "Ctrl + L", description: "Logout" },
                    { shortcut: "Ctrl + Shift + C", description: "Open Add Category Form" },
                    { shortcut: "Ctrl + Shift + A", description: "Open Add SubCategory Form" },
                    { shortcut: "Ctrl + Shift + S", description: "Open SearchBar" },
                    { shortcut: "Alt + Shift + P", description: "Open Add Products Form" },
                    { shortcut: "Alt + O", description: "Open Sidebar" },
                    { shortcut: "Alt + C", description: "Close Sidebar" }
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      custom={i}
                      variants={itemVariants}
                      className="flex items-center gap-4"
                    >
                      <span
                        className="px-3 py-2 rounded-md font-bold"
                        style={{
                          backgroundColor: `${COLORS.primary}20`,
                          color: COLORS.primaryDark,
                          minWidth: "160px",
                          textAlign: "center",
                          border: `1px solid ${COLORS.primary}`
                        }}
                      >
                        {item.shortcut}
                      </span>
                      <span className="text-gray-700 font-medium">
                        {item.description}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </DialogContent>

              {/* Actions */}
              <DialogActions sx={{ bgcolor: COLORS.background, px: 3, py: 2 }}>
                <motion.div variants={itemVariants}>
                  <Button
                    onClick={() => setOpen(false)}
                    sx={{
                      backgroundColor: COLORS.danger,
                      color: COLORS.primaryLight,
                      "&:hover": {
                        backgroundColor: `${COLORS.danger}90`
                      }
                    }}
                  >
                    Close
                  </Button>
                </motion.div>
              </DialogActions>
            </motion.div>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
};

export default Shortcut;