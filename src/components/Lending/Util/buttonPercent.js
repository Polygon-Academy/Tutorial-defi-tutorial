import { Button } from 'semantic-ui-react'


const ButtonPercent = (props) => {
    const { Liquidity, setUpdate } = props

    const updateAmount = (percent) => {
        setUpdate(Liquidity * percent)
    }


    return (
        <div style={{ marginBottom: '1rem' }}>
            <Button basic color='grey' size='large' style={{ width: '115px' }} onClick={(e) => updateAmount(0.25)}> 25%</Button>
            <Button basic color='grey' size='large' style={{ width: '115px' }} onClick={(e) => updateAmount(0.50)}>50%</Button>
            <Button basic color='grey' size='large' style={{ width: '115px' }} onClick={(e) => updateAmount(0.75)}>75%</Button>
            <Button basic color='grey' size='large' style={{ width: '115px' }} onClick={(e) => updateAmount(1.00)}>100%</Button>
        </div>
    )
}

export default ButtonPercent