import React, {useState} from "react";

const Upload = ({deadSetter}) => {
    const [image, setImage] = useState()
    const handleChange = ({target: {files}}) => {
        setImage(URL.createObjectURL(files[0]))
        deadSetter()
    }

    return (
        <>
            <input type="file" onChange={handleChange}/><br/>
            <img alt="" style={{margin: "30px", width: "400px"}} src={image}/>
        </>
    )
}

export default Upload