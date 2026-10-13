import {useAuth} from '../auth/AuthProvider'
import { toast } from "react-toastify";


const useAuthCheck = () => {

    const {isAuthenticated} = useAuth()
    const validateLogin = () => {
        if(!isAuthenticated)
        {
            toast.error("you must be logged in", {position: "bottom-right"})
            return false
        } else return true
    }
  return (
    {
        validateLogin
    }
  )
}

export default useAuthCheck