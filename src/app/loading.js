'use client'

import styled from "styled-components";

const SpinnerWidget = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 1);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999; /* Ensure the spinner is on top of other content */
`;

const SpinnerCircle = styled.div`
    border: ${(props) => props.size / 8}rem solid transparent;
    border-top: ${(props) => props.size / 8}rem solid white; 
    border-right: ${(props) => props.size / 8}rem solid white;
    border-radius: 50%;
    width: ${(props) => props.size}rem;
    height: ${(props) => props.size}rem;
    animation: spin 0.4s linear infinite;
    
    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
`;

const Spinner = ({ size = 2 }) => (
    <SpinnerWidget>
        <SpinnerCircle size={size} />
    </SpinnerWidget>
);

export default Spinner;
