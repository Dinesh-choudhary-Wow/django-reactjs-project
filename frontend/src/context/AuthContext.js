import React, {createContext,useState ,useEffect} from 'react'
import jwt_decode from "jwt-decode";
import {useNavigate} from 'react-router-dom'
 

const AuthContext = createContext()

export default AuthContext

export const AuthProvider = ({children}) =>{

    
    let[authTokens,setAuthTokens] = useState( ()=>localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')): null )
    let[user,setUser] = useState( ()=>localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')): null)
    let[loading,setLoading] = useState(true)
    const[selectedFile,setSelectedFile] = useState();
    //This will be used further still under development
    const[isFilePicked,setIsFilePicked] = useState(false);
    let navigate = useNavigate()


    //loggin in the user
    const loginUser = async(e) =>{
        e.preventDefault()

        let response = await fetch("http://localhost:8000/api/token/",{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({'username':e.target.username.value,'password':e.target.password.value})
        }) 
        let data =await response.json()
       
        if(response.status === 200){
            setAuthTokens(data)
            setUser(jwt_decode(data.access))
            localStorage.setItem('authTokens',JSON.stringify(data))
            navigate('/')

        }else{
            alert('Please enter correct username and password')
        } 
    }


//This function will be used further still under development
    const changeHandler = (e) => {
        setSelectedFile(e.target.files[0]);
        setSelectedFile(true)
        const formData = new FormData();
        formData.append('File',selectedFile);

    }



//This function for signing up the user
    const signup = async(e) =>{
        e.preventDefault()
        let leng = e.target.password.value
        if(leng.length<8)
        {
            alert("Please Enter 8 char password")
            return;
        }
        let response = await fetch("http://localhost:8000/signup/",{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body: JSON.stringify({'username':e.target.username.value,'first_name':e.target.first_name.value,'last_name':e.target.last_name.value,'email':e.target.email.value,'password':e.target.password.value})
        })
        let data = await response.json()
        if(response.status===200)
        {
            alert('Account created for the username :'+data.username)
            navigate('/login')

        }
        else{
            alert('username already taken')
        }
    }

//This function is to logout the user
    const logoutuser =() => {
        setAuthTokens(null)
        setUser(null)
        localStorage.removeItem('authTokens')
        navigate('/login')
    }


    // This function to send refresh token and get new access token from the backend  
    const refreshtokens = async() =>{
            let response = await fetch("http://localhost:8000/api/token/refresh/",{
                method :'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({'refresh':authTokens?.refresh})
            })
            let data = await response.json()
            if(response.status === 200){
                setAuthTokens(data)
                setUser(jwt_decode(data.access))
                localStorage.setItem('authTokens',JSON.stringify(data))
            }else{
                logoutuser()
            }
            if(loading){
                setLoading(false)
            }
        }

        // after every 4 minutes refreshtokens function will be called 
        useEffect(()=>{

            if(loading){
                refreshtokens()
            }

            let fourMinutes = 1000 *60*4
            let interval = setInterval(()=>{
                if(authTokens){
                    refreshtokens()
                }
            },fourMinutes)
            return () => clearInterval(interval)
        },[authTokens,loading])


        //This is sending context to the other components
        let contextData = {
            user:user,
            loginUser:loginUser,
            logoutuser: logoutuser,
            signup:signup
        }


    return(
        <AuthContext.Provider value = {contextData}>
                {loading ? null : children}
        </AuthContext.Provider>
    )
}