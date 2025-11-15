import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';

export default function Login() {
  const login = useUserStore((state) => state.login);
  const isLoading = useUserStore((state) => state.loading);
  const navigate = useNavigate();

  const [data, setData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const res = await login(data);

    if (res.ok) {
      navigate('/app');
    } else {
      alert(res.message || 'Credenciales inválidas');
    }
  };

  return (
    <div className='auth-wrapper'>
      <div className='auth-card'>
        <h1>M&B Care</h1>
        <p className='subtitle'>Professional Healthcare CRM</p>

        <div className='mb-3'>
          <label>Email</label>
          <input
            name='email'
            type='email'
            className='form-control'
            placeholder='Email'
            onChange={handleChange}
          />
        </div>

        <div className='mb-3'>
          <label>Contraseña</label>
          <input
            name='password'
            type='password'
            className='form-control'
            placeholder='Contraseña (mínimo 8 caracteres)'
            onChange={handleChange}
          />
        </div>

        <button className='btn btn-primary w-100' onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Cargando...' : 'Sign In'}
        </button>

        <Link to='/register' className='text-decoration-none'>
          <div className='switch-link'>Need an account? Sign up</div>
        </Link>
      </div>
    </div>
  );
}
