import React, {Component} from 'react'
import { Dialog, DialogContent, DialogActions, Button, DialogTitle, IconButton} from '@material-ui/core'
import {renderTextField} from '../components'
import {axiosClient} from '../../accounts/axiosClient'
import { reduxForm, Field } from "redux-form";
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import styles from '../../styles/feed.module.css'

class FeedFormPopup extends Component {

    constructor(props){
        super(props)
        this.state = {
            images: [],
            imageURLs: [],
            isSubmitting: false
        }
    }

    onSubmit = async (formProps) => {
        this.setState({isSubmitting: true})
        console.log(formProps)
        let data = new FormData();
        data.append('content', formProps['content']);

        for (let i = 0; i < this.state.images.length; i++) {
            data.append(`image`, this.state.images[i])
        }

        try {
            const response = await axiosClient.post(`/api/posts/`, data,
            {
                headers: { 
                    'Authorization': `Bearer ${localStorage.getItem("token")}`, 
                    'content-type': "multipart/form-data",
                }
            }
        );
            console.log(response.data);
            this.props.addActivity(response.data);
        } catch (e) {
            console.log(e);
        }
        this.setState({isSubmitting: false})
        this.props.handleClose();
    };

    handleImageDelete = (index) => {
        this.setState({
            images: [...this.state.images.slice(0, index), ...this.state.images.slice(index + 1)],
            imageURLs : [...this.state.imageURLs.slice(0, index), ...this.state.imageURLs.slice(index + 1)],
        })
    }

    handleImageChange = (e) => {
        var reader = new FileReader();
        let files = e.target.files 

        for (let i = 0; i < files.length; i++) {
            let file = files[i]
            if (!file.type.match('image.*')) {
                continue;
            }

            var reader = new FileReader();

            reader.onloadend = () => {
                this.setState({
                    images: [...this.state.images, file],
                    imageURLs: [...this.state.imageURLs, reader.result],
                });
            };
    
            reader.readAsDataURL(file);

        }
    };

    render(){
        const { handleSubmit, submitting, invalid } = this.props;

        return (
            <Dialog open={this.props.open} onClose={this.props.handleClose} fullWidth={true}>
                <DialogTitle>
                    Create Post
                </DialogTitle>
                <form onSubmit={handleSubmit(this.onSubmit.bind(this))}>
                    <DialogContent dividers>
                        <Field
                            name="content"
                            component={renderTextField}
                            label="Write something here.."
                            {...{
                                multiline: true,
                                rows: 10,
                                variant: "filled",
                                fullWidth: true,
                            }}
                        />
                    </DialogContent>
                    {this.state.images.length > 0 &&
                        <DialogContent>
                            <div className={styles.postImages}>
                                {this.state.images.map((image, index) => 
                                    <div className={styles.postImageWrapper}>
                                        <span className={styles.postImageDelete}>
                                            <IconButton color="secondary" onClick={() => this.handleImageDelete(index)}>
                                                <HighlightOffIcon />
                                            </IconButton>
                                        </span>
                                        <img src={this.state.imageURLs[index]} className={styles.postImage}/>
                                    </div>  
                                )}
                            </div>
                        </DialogContent>
                    }
                    
                    <DialogActions>
                        <div className={styles.feedFormPopupActions}>
                            <input
                                onChange={this.handleImageChange}
                                id="icon-button-file"
                                type="file"
                                multiple
                                className={styles.popupImageInput}
                            />
                            <label htmlFor="icon-button-file">
                                <Button color="primary" component="span">
                                    Upload Pictures
                                </Button>
                            </label>

                            <span>
                                <Button onClick={this.props.handleClose} color="secondary" disabled={submitting}>
                                    Close
                                </Button>
                                <Button type="submit" color="primary" disabled={invalid || submitting}>
                                    Submit
                                </Button>
                            </span>
                        </div>
                    </DialogActions>
                </form>
            </Dialog>
        )
    }
}

export default reduxForm({form: 'feed_form'})(FeedFormPopup)