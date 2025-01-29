import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import EmployeeList from "./components/EmployeeList";
import EmployeeForm from "./components/EmployeeForm";
import {store} from "./store";
// @ts-ignore
import "./index.scss"
import {SnackbarProvider} from "notistack";

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <SnackbarProvider  />
      <Router>
        <Routes>
          <Route path="/" element={<EmployeeList />} />
          <Route path="/edit/:id" element={<EmployeeForm />} />
          <Route path="/add" element={<EmployeeForm />} />
        </Routes>
      </Router>
    </Provider>
  );
};

export default App;