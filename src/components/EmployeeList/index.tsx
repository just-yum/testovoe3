import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {Table, Select, Checkbox, Button, Spin, CheckboxChangeEvent} from 'antd';
import {useAppDispatch, useAppSelector} from "../../hooks";
import {
  Employee,
  fetchEmployeesThunk,
  selectFilteredEmployees,
  setFilters
} from "../../store/employeeSlice.ts";
import {parse} from "date-fns";
import {enqueueSnackbar} from "notistack";


const columns = [
  {
    title: 'Имя',
    dataIndex: 'name',
    key: 'name',
    sorter: (a: Employee, b: Employee) => a.name.localeCompare(b.name)
  },
  {
    title: 'Должность',
    dataIndex: 'role',
    key: 'role'
  },
  {
    title: 'Дата рождения',
    dataIndex: 'birthday',
    key: 'birthday',
    sorter: (a: Employee, b: Employee) => parse(a.birthday, 'dd.MM.yyyy', new Date()).getTime() - parse(b.birthday, 'dd.MM.yyyy', new Date()).getTime()
  },

];

const EmployeeList: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchEmployeesThunk())
  }, [dispatch]);

  const filteredEmployees = useAppSelector(selectFilteredEmployees).map(el => {
    return {
      ...el,
      key: el.id.toString()
    }
  });

  const roleOptions = [
    {value: '', label: 'Все'},
    {value: 'cook', label: 'cook'},
    {value: 'driver', label: 'driver'},
    {value: 'waiter', label: 'waiter'}
  ]

  const {filters, error} =useAppSelector(state => state.employees)

  const handleChangeArchive = (event: CheckboxChangeEvent) => {
    dispatch(setFilters({ isArchive: event.target.checked  }))
  }

  const handleChangeRole = (value: string)=> {
    dispatch(setFilters({ role: value }))
  }

  const loading = useAppSelector(state => state.employees.isLoading)

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: 'error'});
    }
  }, [error]);

  return (
    <div className="employee-list">
      <div className="filters">
        <Select defaultValue={""} onChange={handleChangeRole} options={roleOptions} style={{ width: '120px' }} />
        <Checkbox style={{ display: 'flex', alignItems: 'center' }} checked={filters.isArchive} onChange={handleChangeArchive}>В архиве</Checkbox>
        <Button type="primary" onClick={() => navigate('/add')}>
          Добавить сотрудника
        </Button>
      </div>
      {loading ? <Spin /> : (
        <Table
          dataSource={filteredEmployees}
          columns={columns}
          onRow={(record) => ({
            onClick: () => navigate(`/edit/${record.id}`)
          })}
        />
      )}
    </div>
  );
};

export default EmployeeList;