
const Item = (props) => {

    const { title, content, end } = props

    const itemStyle = {
        minHeight: '2rem',
        color: 'gray',
        fontSize: '1.1rem',
        fontWeight: 600,
        marginTop: '8px'
    }

    const titleStyle = {
        float: 'left',
    }

    const contentStyle = {
        float: 'right',
        color: '#474747',
        marginRight: '.5rem',
    }

    const endStyle = {
        float: 'right'
    }

    return (
        <div style={itemStyle}>
            <div style={titleStyle}>{title}</div>
            <div style={endStyle}>{end}</div>
            <div style={contentStyle}>{content}</div>
        </div>
    )
}


export default Item