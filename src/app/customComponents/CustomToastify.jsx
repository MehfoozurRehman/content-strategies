import { toast } from 'react-toastify'; 
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';


export const ShowCustomToast = (message, type = 'default', duration) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="text-green-400" style={{ fontSize: '30px' }} />;
      case 'error':
        return <FaExclamationCircle className="text-red-400" style={{ fontSize: '30px' }} />;
      case 'info':
        return <FaInfoCircle className="text-blue-400" style={{ fontSize: '30px' }} />;
      default:
        return null;
    }
  };

  const customStyle = {
    backgroundColor: '#2B2B4B',
    color: '#FFFFFF',
    minHeight: '50px',
    border: '1px solid #213C7C',
  };

  toast(
    <div className={`custom-toast custom-toast-${type} flex items-center`}>
      <span className="custom-toast-icon mr-2">
        {getIcon()}
      </span>
      <span className="custom-toast-message">{message}</span>
    </div>,
    {
      className: ``,
      bodyClassName: "",
      progressClassName: "",
      style: customStyle,
      autoClose: duration,
    }
  );
};
