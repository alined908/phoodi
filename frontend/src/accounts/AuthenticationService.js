class AuthenticationService{

    registerSuccessfulLogin(access, refresh){
        this.setToken(access)
        this.setRefresh(refresh)
    }
    retrieveUser(){
        return localStorage.getItem('user')
    }

    setToken(token){
        localStorage.setItem('token', token);
    }

    setRefresh(refresh){
        localStorage.setItem('refresh', refresh);
    }

    retrieveToken(){
        return localStorage.getItem('token');
    }

    retrieveRefresh(){
        return localStorage.getItem('refresh')
    }

    removeToken(){
        localStorage.removeItem('token');
    }

    removeUser(){
        localStorage.removeItem('user')
    }

    removeRefresh(){
        localStorage.removeItem('refresh')
    }

    logout(){
        this.removeToken()
        this.removeUser()
        this.removeRefresh()
    }

    isUserLoggedIn(){
        let user = this.retrieveToken();
        if (user === null){
            return false
        }
        return true
    }
}

export default new AuthenticationService()