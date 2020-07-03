import React, {Component} from 'react'
import {Card, CardHeader, CardContent} from '@material-ui/core'
import {Skeleton} from '@material-ui/lab'
import styles from '../../styles/feed.module.css'

class SkeletonActivity extends Component {
    render() {
        return (
            <Card>
                <CardHeader
                    avatar={
                        <Skeleton animation="wave" variant="circle" width={40} height={40} />
                    }
                    title={
                        <Skeleton animation="wave" height={10} width="80%" style={{ marginBottom: 6 }} />
                    }
                    subheader={
                        <Skeleton animation="wave" height={10} width="40%" />
                    }
                />
                <Skeleton height={200} animation="wave" variant="rect" />
                <CardContent>
                    <React.Fragment>
                        <Skeleton animation="wave" height={10} style={{ marginBottom: 6 }} />
                        <Skeleton animation="wave" height={10} width="80%" />
                    </React.Fragment>
                </CardContent>
            </Card>
        )
    }
}

export default SkeletonActivity