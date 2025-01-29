import {createAsyncThunk, createSelector, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from "./index.ts";
import {EmployeeAPI} from '../api/index.ts'
import {Response} from "../api/employees.ts";
export interface Employee {
  id: number;
  name: string;
  phone: string;
  birthday: string;
  role: 'driver' | 'waiter' | 'cook';
  isArchive: boolean;
}

export interface EmployeesState {
  employees: Employee[]
  isLoading: boolean
  error: string | null
  filters: {
    role: string
    isArchive: boolean
  }
}

const initialState: EmployeesState = {
  employees: [],
  isLoading: false,
  error: null,
  filters: {
    role: '',
    isArchive: false
  }
};

export const fetchEmployeesThunk = createAsyncThunk<
  Employee[],
  void,
  { rejectValue: Response }
>(
  `employee/fetchAll`,
  async (_, { rejectWithValue })  => {
    try {
      return await EmployeeAPI.loadEmployees()
    } catch (e) {
      return rejectWithValue(e as Response)
    }
  }
)

export const selectFilteredEmployees = createSelector(
  [(state: RootState) => state.employees.employees, (state: RootState) => state.employees.filters],
  (employees, filters) => employees.filter(employee => {
    const roleMatch = filters.role ? employee.role === filters.role : true;
    const archiveMatch = employee.isArchive === filters.isArchive;
    return roleMatch && archiveMatch;
  })
);

export const employeeSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    setEmployees: (state, action: PayloadAction<Employee[]>) => {
      state.employees = action.payload;
    },
    updateEmployee: (state, action: PayloadAction<Employee>) => {
      const index = state.employees.findIndex(e => e.id === action.payload.id);
      if (index !== -1) state.employees[index] = action.payload;
    },
    setFilters: (state, action: PayloadAction<{role?: string; isArchive?: boolean}>) => {
      state.filters = { ...state.filters, ...action.payload };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployeesThunk.pending, state => {
        state.isLoading = true;
        state.employees = []
      })
      .addCase(fetchEmployeesThunk.fulfilled, (state,action) => {
        state.employees = action.payload;
        state.isLoading = false
      })
      .addCase(fetchEmployeesThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action?.payload?.error || null
      })
  }
});

export const { setEmployees, setFilters } = employeeSlice.actions;
export default employeeSlice.reducer;