import React from 'react';
import { Link } from 'react-router-dom';

export default function Login() {
  return (
    <div className='auth-wrapper'>
      <div className='auth-card'>
        <h1>M&B Care</h1>
        <p className='subtitle'>Professional Healthcare CRM</p>

        <div className='mb-3'>
          <label>Email</label>
          <input type='email' className='form-control' placeholder='Email' />
        </div>

        <div className='mb-3'>
          <label>Contraseña</label>
          <input
            type='password'
            className='form-control'
            placeholder='Contraseña (mínimo 8 caracteres)'
          />
        </div>

        <button className='btn btn-primary w-100'>Sign In</button>

        <Link to='/register' className='text-decoration-none'>
          <div className='switch-link'>Need an account? Sign up</div>
        </Link>
      </div>
    </div>
  );
}
