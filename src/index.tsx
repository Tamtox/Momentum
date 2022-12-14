//Dependencies
import React from 'react';
import {createRoot} from 'react-dom/client';
import {Provider} from 'react-redux';
import {BrowserRouter} from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// Components
import App from './App';
import store from './Store/Store';

const root = createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>  
    <Provider store={store}>
      <BrowserRouter>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <App />
        </LocalizationProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);
