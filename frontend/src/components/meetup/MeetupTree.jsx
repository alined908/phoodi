import React, { memo, useState, useRef, useEffect } from 'react'
import { useSpring, a, animated } from 'react-spring'
import * as Icons from '../../assets/components/treeIcons'
import styles from "../../styles/meetup.module.css"
import ResizeObserver from 'resize-observer-polyfill'
import {HashLink} from 'react-router-hash-link';

const usePrevious = value => {
    const ref = useRef()
    useEffect(() => void (ref.current = value), [value])
    return ref.current
  }
  
const useMeasure = () => {
    const ref = useRef()
    const [bounds, set] = useState({ left: 0, top: 0, width: 0, height: 0 })
    const [ro] = useState(() => new ResizeObserver(([entry]) => set(entry.contentRect)))
    useEffect(() => {
      if (ref.current) ro.observe(ref.current)
      return () => ro.disconnect()
    }, [])
    return [{ ref }, bounds]
}

const determineHashLink = (type, meetup, element) => {
    let anchor;
    let name;
    if (type === "meetup"){
        anchor = "head"
        name = element.name
    } else if (type === "event"){
        anchor = `event-${element.id}`
        name = element.title
    } else if (type === "section"){
        anchor = element
        name = element
    } else if (type === "option"){
        const option = element.restaurant
        anchor = `option-${element.id}`
        name = option.name
    }
    return (
        <HashLink to={`/meetups/${meetup.uri}#${anchor}`} smooth={true}>
            {name}
        </HashLink>
    )
}

const TreeNode = memo(({children, meetup, element, style, type, defaultOpen = false}) => {
    const [isOpen, setOpen] = useState(defaultOpen)
    const previous = usePrevious(isOpen)
    const [bind, { height: viewHeight }] = useMeasure()
    const { height, opacity, transform } = useSpring({
        from: { height: 0, opacity: 0, transform: 'translate3d(20px,0,0)' },
        to: { height: isOpen ? viewHeight : 0, opacity: isOpen ? 1 : 0, transform: `translate3d(${isOpen ? 0 : 20}px,0,0)` }
    })
    const Icon = Icons[`${children ? (isOpen ? 'Minus' : 'Plus') : 'Close'}SquareO`]
    const hashLink = determineHashLink(type, meetup, element)

    return (
        <div className={styles.treeNode}>
            <Icon 
                style={{width: '1em', height: '1em', marginRight: 10, cursor: 'pointer',verticalAlign: 'middle', opacity: children ? 1 : 0.3 }} 
                onClick={() => setOpen(!isOpen)} 
            />
            <span className={styles.treeTitle} style={style}>
                {hashLink}
            </span>
            <animated.div className={styles.content} style={{ opacity, height: isOpen && previous === isOpen ? 'auto' : height }}>
                <a.div style={{ transform }} {...bind} children={children} />
            </animated.div>
        </div>
    )
})

const MeetupTree = props => (
    <div className={styles.tree}>
        {props.initialized && props.meetup.events && 
            <>
                Outline
                <TreeNode meetup={props.meetup} element={props.meetup} type="meetup" defaultOpen>
                    <TreeNode meetup={props.meetup} element="Members" type="section"/>
                    <TreeNode meetup={props.meetup} element="Events" type="section" defaultOpen>
                        {props.sortEvents(props.meetup.events).map((event) => {
                                const eventObj = props.meetup.events[event]
                                const options = Object.keys(eventObj.options)
                                return (
                                    <TreeNode meetup={props.meetup} element={eventObj} type="event">
                                        {options.map((key) => 
                                            <TreeNode type="option" meetup={props.meetup} element={eventObj.options[key]}/> 
                                        )}
                                    </TreeNode>
                                )
                            } 
                       )}
                    </TreeNode>
                </TreeNode>
            </>
        }
    </div>
)

export default MeetupTree