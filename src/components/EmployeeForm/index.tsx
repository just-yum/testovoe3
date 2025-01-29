import { FC, useEffect, useCallback } from 'react';
import { Form, Input, Select, Checkbox, Button } from 'antd';
import { MaskedInput } from 'antd-mask-input';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { EmployeeAPI } from '../../api/index.ts';
import { enqueueSnackbar } from 'notistack';
import {Employee, fetchEmployeesThunk} from '../../store/employeeSlice';

const PHONE_MASK = '+7 (000) 000-0000';
const DATE_MASK = '00.00.0000';
const DATE_FORMAT = 'DD.MM.YYYY';

const EmployeeForm: FC = () => {
  const { id } = useParams<{ id?: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { employees } = useAppSelector(state => state.employees);
  const [form] = Form.useForm();
  const isEditMode = Boolean(id);

  const fetchEmployees = useCallback(() => dispatch(fetchEmployeesThunk()), [dispatch]);

  useEffect(() => {
    if (!isEditMode) return;

    const employee = employees.find(e => e.id === Number(id));
    if (!employee) {
      enqueueSnackbar('Сотрудник не найден', { variant: 'error' });
      navigate('/', { replace: true });
      return;
    }

    form.setFieldsValue({
      ...employee,
    });
  }, [id, form]);

  const handleFinish = async (values: Employee) => {
    try {

      const response = isEditMode
        ? await EmployeeAPI.updateEmployee({ ...values, id: Number(id) })
        : await EmployeeAPI.addEmployee(values);

      if (!response.success) throw new Error(response.error);

      await fetchEmployees();
      navigate('/');
      enqueueSnackbar('Данные сохранены', { variant: 'success' });
    } catch (err) {
      const error = err as Error;
      enqueueSnackbar(error.message || 'Ошибка сохранения', { variant: 'error' });
    }
  };

  return (
    <Form form={form} onFinish={handleFinish} layout="vertical">
      <Form.Item
        label="Имя"
        name="name"
        rules={[{required: true, message: 'Введите имя'}]}
      >
        <Input/>
      </Form.Item>

      <Form.Item
        label="Телефон"
        name="phone"
        rules={[
          {required: true, message: 'Введите телефон'},
          {pattern: /\+7 \(\d{3}\) \d{3}-\d{2}\d{2}/, message: 'Неверный формат'}
        ]}
      >
        <MaskedInput mask={PHONE_MASK}/>
      </Form.Item>

      <Form.Item
        label="Должность"
        name="role"
        rules={[{required: true, message: 'Выберите должность'}]}
      >
        <Select>
          <Select.Option value="cook">cook</Select.Option>
          <Select.Option value="waiter">waiter</Select.Option>
          <Select.Option value="driver">driver</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="Дата рождения"
        name="birthday"
        rules={[
          { required: true, message: 'Введите дату рождения' },
          { pattern: /^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[0-2])\.\d{4}$/, message: 'Неверный формат' }
        ]}
      >
        <MaskedInput mask={DATE_MASK} placeholder={DATE_FORMAT}  />
      </Form.Item>

      <Form.Item name="isArchive" valuePropName="checked" initialValue={false}>
        <Checkbox>В архиве</Checkbox>
      </Form.Item>

      <Button type="primary" htmlType="submit">
        Сохранить
      </Button>
      <Link to="/" className="return-link">
        На главную
      </Link>
    </Form>
  );
};

export default EmployeeForm;