class AuthenticationService{

    registerSuccessfulLogin(token, expiration){
        localStorage.setItem('token', token);
        localStorage.setItem('expiration', expiration.toString())
        console.log("register successfull login");
    }

    retrieveToken(){
        return localStorage.getItem('token');
    }

    retrieveExpiration(){
        return localStorage.getItem('expiration')
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