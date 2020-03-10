import React, {Component} from "react";
import '../home.scss'
import {Typography, Button} from '@material-ui/core'
import {Link} from 'react-router-dom'
import {ReactComponent as CupcakeIcon} from '../assets/ice-cream.svg'
import {ReactComponent as WatermelonIcon} from '../assets/watermelon.svg'
import {ReactComponent as DonutIcon} from '../assets/mini-donut.svg'
import {ReactComponent as CakeIcon} from '../assets/cake.svg'
import {ReactComponent as IcecreamIcon} from '../assets/icecream.svg'
import {ReactComponent as BreadIcon} from '../assets/bread.svg'
import {ReactComponent as HavingFunIcon} from '../assets/svgs/undraw_having_fun_iais.svg'
import {ReactComponent as TastingIcon} from "../assets/svgs/undraw_tasting_de22.svg"
import {ReactComponent as ClockIcon} from "../assets/clock.svg"
import {ReactComponent as StreetFoodIcon} from "../assets/svgs/undraw_street_food_hm5i.svg"
import {ReactComponent as OnlineFriendsIcon} from "../assets/svgs/undraw_online_friends_x73e.svg"
import {ReactComponent as BreakFastIcon} from "../assets/svgs/undraw_breakfast_psiw.svg"
import {ReactComponent as HamburgerIcon} from "../assets/svgs/undraw_Hamburger_8ge6.svg"
import {ReactComponent as DonutLoveIcon} from "../assets/svgs/undraw_donut_love_kau1.svg"
import {ReactComponent as WheelIcon} from "../assets/wheel.svg"

class HomeComponent extends Component {

    render() {
        const dog = () => {
            return (
                <div></div>
            )
        }

        const food = () => {
            return (
                <div className="food-belt">
                    <div className="food">
                        <CupcakeIcon className={"cupcake"} height={50} width={50}/>
                        {/* <WatermelonIcon className={"cupcake"} height={50} width={50}/>
                        <DonutIcon className={"cupcake"} height={50} width={50}/>
                        <BreadIcon className={"cupcake"} height={50} width={50}/>
                        <IcecreamIcon className={"cupcake"} height={50} width={50}/> */}
                    </div>
                    <div className="belt">
                        <WheelIcon className={"wheel"}></WheelIcon>
                    </div>
                </div>
            )
        }

        return (
            <div className="home">
                <div className="top">
                    {/* {dog()} */}
                    {food()}
                    {/* <div className="home-banner">
                        <Typography style={{fontFamily: "Lato", fontWeight: 600}} variant="h3">Meetup</Typography>
                    </div> */}
                </div>
                <div className="middle">
                    <div className="middle-header">
                        <ClockIcon className={"svg"} width={50} height={"auto"} />
                        <Typography style={{fontFamily: "Lato", fontWeight: 600}} variant="h4">Get food with friends faster</Typography>
                        <Typography style={{fontFamily: "Lato", marginTop: ".5rem"}} variant="h6">Schedule events. Choose from options. Meetup!</Typography>
                    </div>
                    <div className="middle-entry left">
                        <div className="middle-entry-img">
                            <HavingFunIcon width={600} height={"auto"}/>
                        </div>
                        <div className="middle-entry-text">
                            <Typography style={{fontFamily: "Lato", fontWeight: 600}} variant="h4">Find Food Friends</Typography>
                            <Typography style={{fontFamily: "Lato"}} variant="h6">Bond with friends and people with similar food tastes near you</Typography>
                        </div>
                    </div>
                    <div className="middle-entry right">
                        <div className="middle-entry-text">
                            <Typography style={{fontFamily: "Lato", fontWeight: 600}} variant="h4">Schedule Group Meetups</Typography>
                            <Typography style={{fontFamily: "Lato"}} variant="h6">Create multiple events and instantly add them to your calendar</Typography>
                        </div>
                        <div className="middle-entry-img">
                            <TastingIcon width={600} height={"auto"}/>
                        </div>
                    </div>
                    <div className="middle-entry left">
                        <div className="middle-entry-img">
                            <StreetFoodIcon width={700} height={"auto"}/>
                        </div>
                        <div className="middle-entry-text">
                            <Typography style={{fontFamily: "Lato", fontWeight: 600}} variant="h4">Explore New Foods</Typography>
                            <Typography style={{fontFamily: "Lato"}} variant="h6">See what tastes good in your area</Typography>
                        </div>
                    </div>
                    <div className="middle-entry right">
                        <div className="middle-entry-text">
                            <Typography style={{fontFamily: "Lato", fontWeight: 600}} variant="h4">Chat With Friends</Typography>
                            <Typography style={{fontFamily: "Lato"}} variant="h6">Talk about what you've been craving</Typography>
                        </div>
                        <div className="middle-entry-img">
                            <OnlineFriendsIcon width={800} height={"auto"}/>
                        </div>
                    </div>
                    <div className="middle-tri">
                        <div className="middle-tri-col">
                            <div className="middle-tri-col-img">
                                <BreakFastIcon height={200} width={"auto"}/>
                            </div>
                            <div className="middle-tri-col-txt">
                                <Typography  style={{fontFamily: "Lato", marginBottom: "1rem", fontWeight: 600}} variant="h5">Simplify Lunch</Typography>
                            </div>
                        </div>
                        <div className="middle-tri-col">
                            <div className="middle-tri-col-img">
                                <HamburgerIcon height={200} width={"auto"}/>
                            </div>
                            <div className="middle-tri-col-txt">
                                <Typography style={{fontFamily: "Lato",  marginBottom: "1rem", fontWeight: 600}} variant="h5">Simplify Dinner</Typography>
                            </div>
                        </div>
                        <div className="middle-tri-col">
                            <div className="middle-tri-col-img">
                                <DonutLoveIcon height={200} width={"auto"}/>
                            </div>
                            <div className="middle-tri-col-txt">
                                <Typography style={{fontFamily: "Lato",  marginBottom: "1rem", fontWeight: 600}} variant="h5">Simplify Dessert</Typography>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bottom">
                    <Typography style={{fontFamily: "Lato",  margin: "1rem", fontWeight: 600}} variant="h3">Meet with Friends</Typography>
                    <div className="bottom-button">
                        <Link to="/register"><Button style={{padding: "1rem"}} variant="contained" color="primary">Start Exploring</Button></Link>
                    </div>
                </div>
            </div>
        )
    }
}

export default HomeComponent