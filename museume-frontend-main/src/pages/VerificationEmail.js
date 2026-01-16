import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { emailVerification } from "../redux/slices/authSlice";
import { useNavigate, useLocation } from "react-router-dom";
import queryString from 'query-string';
import { toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
import { useTranslation } from 'react-i18next';

const VerificationEmail = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = queryString.parse(location.search);
    const { uid, token } = queryParams;

    useEffect(() => {
        let isApiCalled = false; // Flag to prevent multiple API calls

        const verifyEmail = async () => {
            if (isApiCalled) return; // Prevent repeated API calls
            isApiCalled = true;

            const credentials = { uid, token };
            dispatch(emailVerification(credentials)).then((action) => {
                if (action.type === 'auth/emailVerification/fulfilled') {
                    navigate('/login');
                    toast.success(t('Email verified successfully! Please login to continue.'));
                } else {
                    navigate('/login'); 
                }
            });
        };

        verifyEmail();
    }, [dispatch, uid, token, navigate]);

    return null; // Render nothing
};

export default VerificationEmail;
