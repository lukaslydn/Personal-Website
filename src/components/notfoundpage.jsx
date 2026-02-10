import { Link } from "react-router-dom";

import notfound from "../assets/notfound.png"

function NotFoundPage() {
    return ( 
        <div className="notfound-page">
            <Link to="/">
            <img className="notfound-image" src={notfound} />
            <p style={{color: 'white', textAlign: "center"}}>Page not found</p>
            </Link>
        </div>
     );
}

export default NotFoundPage;
