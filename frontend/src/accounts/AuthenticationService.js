class AuthenticationService{

    registerSuccessfulLogin(token){
        localStorage.setItem('token', token);
        console.log("register successfull login");
    }

    retrieveToken(){
        return localStorage.getItem('token');
    }

    logout(){
        localStorage.removeItem('token');
    }

    getUser(){
        return localStorage.getItem('token');
    }

    isUserLoggedIn(){
        let user = this.getUser();
        if (user === null){
            return false
        }
        return true
    }
}

export default new AuthenticationService()