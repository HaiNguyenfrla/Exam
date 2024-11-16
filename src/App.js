import './App.css';
import Backtesting from './component/Backtesting'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (  
    <div className="main">
      <Backtesting/>
      <ToastContainer />
    </div>
  );
}

export default App;