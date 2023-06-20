import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';

import logo from './assets/logo.png';
import './App.css';

const API_URL = 'http://localhost:3000/api/tabela'; // URL da sua API

const Login = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <div className="login-container">
      <div className="login-card">
        <img src={logo} alt="Logo" className="logo" />
        <h2 className="login-text">Faça login para continuar</h2>
        <button className="login-button" onClick={() => loginWithRedirect()}>
          Log In
        </button>
      </div>
    </div>
  );
};

const AccessDenied = () => {
  const { logout } = useAuth0();

  return (
    <div className="login-container">
      <div className="login-card">
        <img src={logo} alt="Logo" className="logo" />
        <h2 className="access-denied-text">Acesso negado</h2>
        <p className="access-denied-message">Saia da conta atual e entre com uma conta com acesso.</p>
        <button className="logout-button" onClick={() => logout({ returnTo: window.location.origin })}>
          Log Out
        </button>
      </div>
    </div>
  );
};


const App = () => {
  const [data, setData] = useState([]);
  const [editMode, setEditMode] = useState({});
  const [editedData, setEditedData] = useState({});
  const { isAuthenticated, isLoading, error, logout } = useAuth0();

  const fetchData = async () => {
    try {
      const response = await axios.get(API_URL);
      setData(response.data);
    } catch (error) {
      console.error('Erro ao obter dados:', error);
    }
  };

  const enableEditMode = (id, field, value) => {
    setEditMode({ ...editMode, [id]: field });
    setEditedData({ ...editedData, [id]: { ...editedData[id], [field]: value } });
  };

  const saveField = async (id) => {
    const updatedData = { ...data.find((item) => item.id === id), ...editedData[id] };
    try {
      await axios.put(`${API_URL}/${id}`, updatedData);
      setEditMode({ ...editMode, [id]: null });
    } catch (error) {
      console.error('Erro ao atualizar campo:', error);
    }
  };

  const renderField = (item, field) => {
    const id = item.id;

    if (editMode[id] === field) {
      return (
        <input
          type="text"
          value={editedData[id][field] || ''}
          onChange={(e) => setEditedData({ ...editedData, [id]: { ...editedData[id], [field]: e.target.value } })}
        />
      );
    }

    return item[field];
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <AccessDenied />;
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="container">
      <header className="header">
        <div className="logout-container">
          <button className="logout-button" onClick={() => logout({ returnTo: window.location.origin })}>
            Sair
          </button>
        </div>
        <img src={logo} alt="Logo" className="logo" />
        <h1 className="title">Controle CTE - Alado</h1>
      </header>
      <div className="content">
        <table>
          <thead>
            <tr>
              <th>FILIAL</th>
              <th>CNPJ</th>
              <th>DOC</th>
              <th>EMITENTE</th>
              <th>VALOR TOTAL</th>
              <th>DT. LIBERAÇÃO</th>
              <th>STATUS</th>
              <th>AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <td>{renderField(item, 'ZB1_FILIAL')}</td>
                <td>{renderField(item, 'ZB1_CGCEMI')}</td>
                <td>{renderField(item, 'ZB1_DOC')}</td>
                <td>{renderField(item, 'ZB1_EMIT')}</td>
                <td>{renderField(item, 'ZB1_TOTVAL')}</td>
                <td>{renderField(item, 'ZB1_DTLIB')}</td>
                <td>{renderField(item, 'ZB1_STATUS')}</td>
                <td>
                  {editMode[item.id] ? (
                    <button className="save-button" onClick={() => saveField(item.id)}>
                      Salvar
                    </button>
                  ) : (
                    <button
                      className="edit-button"
                      onClick={() => enableEditMode(item.id, 'ZB1_DTLIB', item.ZB1_DTLIB)}
                    >
                      <img src="edit-icon.png" alt="Editar" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


export default App;
