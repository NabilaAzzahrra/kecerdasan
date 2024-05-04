import React, { useEffect, useState } from 'react';
import Lottie from "lottie-react";
import awanLp3i from "../assets/img/awan-lp3i.json";
import logoLp3i from '../assets/img/logo-lp3i.png'
import logoTagline from '../assets/img/tagline-warna.png'
import { checkTokenExpiration } from '../middlewares/middleware';
import { jwtDecode } from "jwt-decode";
import axios from 'axios'
import { useNavigate } from 'react-router-dom';

function Home() {
    const [user, setUser] = useState({});
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(true);
    const navigate = useNavigate();

    const getUser = async () => {
        checkTokenExpiration()
            .then((response) => {
                const token = localStorage.getItem('token');
                const decoded = jwtDecode(token);

                const userId = decoded.id;
                const userName = decoded.name;
                const userEmail = decoded.email;
                const userPhone = decoded.phone;
                const userSchool = decoded.school ?? 'Tidak diketahui';
                const userClasses = decoded.classes ?? 'Tidak diketahui';
                const userStatus = decoded.status;

                const data = {
                    id: userId,
                    name: userName,
                    email: userEmail,
                    phone: userPhone,
                    school: userSchool,
                    classes: userClasses,
                    status: userStatus
                }

                setUser(data);
                getResult(data);
            })
            .catch((error) => {
                navigate('/');
            });
    }

    const getResult = async (data) => {
        await axios.get(`http://localhost:8001/hasils/${data.id}`)
            .then((response) => {
                setResult(response.data);
                setError(false);
                setLoading(false);
            })
            .catch((error) => {
                if (error.code == 'ERR_NETWORK') {
                    setError(true);
                    setLoading(false);
                }
            });
    }

    const logoutFunc = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('bucket');
        navigate('/');
    }

    const startTest = async () => {
        try {
            const responseUserExist = await axios.get(`http://localhost:8001/users/${user.id}`);
            console.log(responseUserExist);
            if (responseUserExist.data) {
                navigate('/question')
            } else {
                const data = {
                    id_user: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    school: user.school,
                    classes: user.classes,
                }
                await axios.post(`http://localhost:8001/users`, data)
                    .then((response) => {
                        navigate('/question');
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            }
        } catch (error) {
            console.log(error);
        }

    }

    useEffect(() => {
        getUser();
        checkTokenExpiration()
            .then((response) => {
                console.log(response);
            })
            .catch((error) => {
                navigate('/')
            });
    }, []);

    return (
        <section className='bg-white h-screen relative bg-cover'>
            <main className='container mx-auto flex flex-col justify-center items-center h-screen px-5 gap-5'>
                <div className='flex justify-between gap-5'>
                    <img src={logoLp3i} alt='logo lp3i' className='h-14' />
                    <img src={logoTagline} alt='logo lp3i' className='h-12' />
                </div>
                <div className=''>
                    <Lottie animationData={awanLp3i} loop={true} className='h-52' />
                </div>
                <div className='text-center space-y-2'>
                    <h2 className='uppercase font-bold text-3xl'>
                        Tes Kecerdasan Ganda
                    </h2>
                    <p className='text-sm'>Puncak kebahagiaan dan kesuksesan kita tercapai saat kita memanfaatkan kecerdasan alami kita secara optimal. Fokuslah pada pembelajaran dan pekerjaan yang sesuai dengan kekuatan, gaya, dan jenis otak kita sendiri.</p>
                </div>
                {
                    loading ? (
                        <p className='text-gray-900 text-sm'>Loading...</p>
                    ) : (
                        error ? (
                            <div className='text-center space-y-3'>
                                <div className='border-2 border-red-500 text-base bg-red-500 rounded-xl text-white px-5 py-3'>
                                    <p>Mohon maaf, server sedang tidak tersedia.</p>
                                </div>
                                <button type="button" onClick={logoutFunc} className='bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl text-sm'><i className="fa-solid fa-right-from-bracket"></i> Keluar</button>
                            </div>
                        ) : (
                            result ? (
                                <div className='text-center space-y-3'>
                                    <div className='border-2 border-gray-900 text-base hover:bg-gray-900 hover:text-white px-5 py-3'>
                                        <p>
                                            <span>Nama Lengkap: </span>
                                            <span className='font-bold underline'>{user.name}</span>
                                        </p>
                                        <p>
                                            <span>Jenis Kecerdasan Anda: </span>
                                            <span className='font-bold underline'>{result.jenis_kecerdasan}</span>
                                        </p>
                                    </div>
                                    <button type="button" onClick={logoutFunc} className='bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl text-sm'><i className="fa-solid fa-right-from-bracket"></i> Keluar</button>
                                </div>
                            ) : (
                                <button type="button" onClick={startTest} className='border-2 border-gray-900 text-sm uppercase font-bold hover:bg-gray-900 hover:text-white px-3 py-1'>
                                    <span>Mulai</span>
                                </button>
                            )
                        )
                    )
                }
            </main>
        </section>
    )
}

export default Home
