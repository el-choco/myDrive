import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  sortBy: "date_desc",
  limit: 50,
  search: "",
  mediaFilter: "all",
  typeFilter: "all", // <--- NEU
  dateFilter: "all", // <--- NEU
};

const filterSlice = createSlice({
  name: "selected",
  initialState,
  reducers: {
    setSortBy: (state, action: PayloadAction<string>) => {
      state.sortBy = action.payload;
    },
    setMediaFilter: (state, action: PayloadAction<string>) => {
      state.mediaFilter = action.payload;
    },
    setTypeFilter: (state, action: PayloadAction<string>) => {
      state.typeFilter = action.payload;
    },
    setDateFilter: (state, action: PayloadAction<string>) => {
      state.dateFilter = action.payload;
    },
  },
});

export const { setSortBy, setMediaFilter, setTypeFilter, setDateFilter } = filterSlice.actions;

export default filterSlice.reducer;