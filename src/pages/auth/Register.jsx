import React from 'react';
import { Link } from 'react-router-dom';

export default function Register() {
  return (
    <>
      <div className='auth-wrapper'>
        <div className='auth-card'>
          <h1>M&B Care</h1>
          <p className='subtitle'>Professional Healthcare CRM</p>

          <div className='mb-3'>
            <label>Nombre Completo</label>
            <input type='text' className='form-control' placeholder='Nombre Completo' />
          </div>

          <div className='mb-3'>
            <label>Tipo de Profesión</label>
            <select className='form-select'>
              <option>Psicología</option>
              <option>CAF/E</option>
              <option>Odontología</option>
            </select>
          </div>

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

          <button className='btn btn-primary w-100'>Sign Up</button>

          <Link to='/login' className='text-decoration-none'>
            <div className='switch-link'>Have an account? Sign in</div>
          </Link>
        </div>
      </div>
    </>
  );
}
