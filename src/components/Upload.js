import React, {useState} from "react";

const Upload = ({}) => {
    const [image, setImage] = useState()
    const handleChange = ({target: {files}}) => {
        setImage(URL.createObjectURL(files[0]))
    }

    return (
        <div>
            <input type="file" onChange={handleChange}/><br/>
            <img style={{margin: "30px", width: "400px"}} src={image}/>
        </div>
    )
}

export default Upload