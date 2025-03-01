import * as React from 'react';
import axios from 'axios';
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import { motion, AnimatePresence } from 'framer-motion';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    [theme.breakpoints.up('sm')]: {
      width: '20ch',
      '&:focus': {
        width: '25ch',
      },
    },
  },
}));

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [categories, setCategories] = React.useState([]);
  const searchRef = React.useRef(null);

  React.useEffect(() => {
    axios.get('http://localhost:5000/api/categories')
      .then(response => setCategories(response.data))
      .catch(error => console.error('Error fetching categories:', error));
  }, []);

  const filteredCategories = categories.filter(category => 
    typeof category.name === 'string' && category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectCategory = (category) => {
    setSearchTerm(category.name);
    setShowDropdown(false);
  };

  const handleClickOutside = (event) => {
    if (searchRef.current && !searchRef.current.contains(event.target)) {
      setShowDropdown(false);
    }
  };

  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <Box ref={searchRef} sx={{ display: 'flex', marginLeft: 'auto', marginRight: '10px', flexDirection: 'column', alignItems: 'flex-end' }}>
      
      {/* 🔹 Search Bar */}
      <Search>
        <SearchIconWrapper>
          <SearchIcon />
        </SearchIconWrapper>
        <StyledInputBase
          placeholder="Search Categories…"
          inputProps={{ 'aria-label': 'search' }}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowDropdown(true);
          }}
        />
      </Search>

      {/* 🔹 Search Results with Faster Animations */}
      <AnimatePresence>
        {showDropdown && !!searchTerm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } }}
            exit={{ opacity: 0, y: -10, transition: { duration: 0.15, ease: 'easeIn' } }}
            style={{
              position: 'absolute',
              right: 120,
              marginTop: '2.6rem',
              backgroundColor: 'rgba(8, 145, 178, 0.8)',
              borderBottomLeftRadius: '5px',
              borderBottomRightRadius: '5px',
              width: '250px',
              padding: '8px',
              boxShadow: '10px 10px 20px rgba(0,0,0,0.2)',
              backdropFilter: 'blur(10px)',
              opacity: 0.9,
              maxHeight: '600px',
              overflowY: 'auto',
              scrollbarWidth: 'none',
            }}
          >
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0, transition: { duration: 0.25 } }}
                  exit={{ opacity: 0, x: -10, transition: { duration: 0.35 } }}
                  whileHover={{ scale: 1.07, backgroundColor: 'rgba(255, 255, 255, 0.4)', transition: { duration: 0.15 } }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px',
                    marginLeft: '8px',
                    marginRight: '8px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onClick={() => handleSelectCategory(category)}
                >
                  {category.image && <img src={category.image} alt={category.name} style={{ width: 40, height: 40, marginRight: 10, borderRadius: '50%' }} />}
                  {category.name}
                </motion.div>
              ))
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.2 } }}>
                <Box sx={{ padding: 1 }}>No results found</Box>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
