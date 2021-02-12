import React, {useState} from "react"
import ReactMarkdown from 'react-markdown'
import {Liquid} from "liquidjs"
import {template} from "../templates/letter.tpl.js"
import './LetterToTrustedPerson.css'

const LetterToTrustedPerson = ({docProps}) => (
    <div className='letter'>
        <header>
            <h1>Letter to Trusted Person</h1>
        </header>
        <div className='instructions'>
            <div>
                This letter describes your membership at Opolis and the benefits that you receive from them. It will
                provide them with the following information:
            </div>
            <ul>
                <li>
                    Information about how to make a disability claim your behalf in case you become incapacitated and
                    can't do it yourself
                </li>
                <li>Information about how to make a life insurance claim is you should die unexpectedly.</li>
                <li>How to wind down your Opolis account if it isn't needed any more.</li>
            </ul>
        </div>
        <div className='renderedDocument'>
            <RenderTemplate template={template} data={docProps}/>
        </div>
    </div>
)

const engine = new Liquid()
engine.registerFilter('money', new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
}).format)
engine.registerFilter('redactedOrBold', v => '**' + (v ? v : "<redacted>") + '**')

const RenderTemplate = ({template, data}) =>  {
    const [filled, setFilled] = useState('loading...')
    engine.parseAndRender(template, data) // TODO Remove repeated  redactions
        .then(setFilled)
    return <ReactMarkdown children={filled}/>
}

export default LetterToTrustedPerson


