import Style from '../../components/Button/button.module.css';

const Button = ({ btnName, handleClick, classStyles }) => (
    <button className={Style.button} type = "button" onClick={handleClick}>
    {btnName}
    </button>
    
);

export default Button;