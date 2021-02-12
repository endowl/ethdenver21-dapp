import {Liquid} from "liquidjs";
import React, {useState} from "react";
import ReactMarkdown from "react-markdown";
import "./RenderTemplate.css"

const engine = new Liquid()
engine.registerFilter('money', new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
}).format)
engine.registerFilter('redactedOrBold', v => '**' + (v ? v : "<redacted>") + '**')

const RenderTemplate = ({template, data}) => {
    const [filled, setFilled] = useState('loading...')
    engine.parseAndRender(template, data) // TODO Remove repeated  redactions
        .then(setFilled)
    return (
        <div class="renderedDocument">
            <ReactMarkdown children={filled}/>
        </div>
    )
}

export default RenderTemplate
