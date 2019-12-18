class AuthenticationService{

    registerSuccessfulLogin(token){
        localStorage.setItem('token', token);
        console.log("register successfull login");
    }

    logout(){
        localStorage.removeItem('token');
    }

    isUserLoggedIn(){
        let user = localStorage.getItem('token')
        if (user === null){
            return false
        }
        return true
    }
}

export default new AuthenticationService()