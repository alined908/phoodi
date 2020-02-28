import React, {Component} from "react";
import '../home.scss'
import {Typography} from '@material-ui/core'

class HomeComponent extends Component {
    render() {
        const dog = () => {
            return (
                <div class="🐕">
                        <div class="torso">
                            <div class="fur">
                            <div class="spot"></div>
                            </div>
                            <div class="neck">
                            <div class="fur"></div>
                            <div class="head">
                                <div class="fur">
                                <div class="snout"></div>          
                                </div>
                                <div class="ears">
                                <div class="ear">
                                    <div class="fur"></div>
                                </div>
                                <div class="ear">
                                    <div class="fur"></div>
                                </div>
                                </div>
                                <div class="eye"></div>
                            </div>
                            <div class="collar">
                                
                            </div>
                            </div>
                            <div class="legs">
                            <div class="leg">
                                <div class="fur"></div>
                                <div class="leg-inner">
                                <div class="fur"></div>
                                </div>
                            </div>
                            <div class="leg">
                                <div class="fur"></div>
                                <div class="leg-inner">
                                <div class="fur"></div>
                                </div>
                            </div>
                            <div class="leg">
                                <div class="fur"></div>
                                <div class="leg-inner">
                                <div class="fur"></div>
                                </div>
                            </div>
                            <div class="leg">
                                <div class="fur"></div>
                                <div class="leg-inner">
                                <div class="fur"></div>
                                </div>
                            </div>
                            </div>
                            <div class="tail">
                            <div class="tail">
                                <div class="tail">
                                <div class="tail -end">
                                    <div class="tail">
                                    <div class="tail">
                                        <div class="tail">
                                        <div class="tail"></div>
                                        </div>
                                    </div>
                                    </div>
                                </div>
                                </div>
                            </div>
                            </div>
                        </div>
                    </div>
            )
        }

        const food = () => {
            return (
                <div className="food">

                </div>
            )
        }

        return (
            <div className="home">
                <div className="top">
                    {dog()}
                    {food()}
                    <div className="home-banner">
                        <Typography style={{fontFamily: "Lato"}} variant="h3">Meetup</Typography>
                    </div>
                </div>
                <div className="middle">
                    <div className="middle-header">
                        <div>
                            <Typography style={{fontFamily: "Lato"}} variant="h4">Get food with friends faster</Typography>
                        </div>
                        <div>
                            <Typography style={{fontFamily: "Lato", marginTop: "1rem"}} variant="h6">Save your precious time</Typography>
                        </div>
                    </div>
                    <div className="middle-entry">
                        <div className="middle-entry-img">
                            <Typography style={{fontFamily: "Lato"}} variant="h4">Schedule your Meetups</Typography>
                            <Typography style={{fontFamily: "Lato"}} variant="h7">Add multiple events to your meetup and schedule it on google.</Typography>
                        </div>
                        <div className="middle-entry-text">

                        </div>
                    </div>
                    <div className="middle-entry">
                        <div>

                        </div>
                        <div>
                            
                        </div>
                    </div>
                </div>
                <div className="bottom">

                </div>
            </div>
        )
    }
}

export default HomeComponent