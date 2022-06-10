//Dependencies
import React from 'react';
import {createRoot} from 'react-dom/client';
import {Provider} from 'react-redux';
import {BrowserRouter} from 'react-router-dom';
import {LocalizationProvider} from '@mui/lab';
import DateAdapter from '@mui/lab/AdapterDateFns';
// Components
import App from './App';
import store from './Store/Store';

const root = createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
  <Provider store={store}>
    <BrowserRouter>
      <LocalizationProvider dateAdapter={DateAdapter}>
        <App />
      </LocalizationProvider>
    </BrowserRouter>
  </Provider>
</React.StrictMode>,
);


// ReactDOM.render(
//   <React.StrictMode>
//     <Provider store={store}>
//       <BrowserRouter>
//         <LocalizationProvider dateAdapter={DateAdapter}>
//           <App />
//         </LocalizationProvider>
//       </BrowserRouter>
//     </Provider>
//   </React.StrictMode>,
//   document.getElementById('root')
// );
